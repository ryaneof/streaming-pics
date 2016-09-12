import { extractTweetMedia } from '../utils/tweetHandler';
import { createTwitClient } from '../utils/twitClient';

export default function searchStream(socket, searchParams) {
  let user;
  let searchStreamSocket;

  try {
    user = socket.handshake.session.passport.user;
  } catch (err) {
    user = null;
  }

  console.info('==> 🙄  WELCOME TO SEARCH STREAM FOR ', JSON.stringify(searchParams));

  if (!user) {
    socket.emit('searchStreamUserNotFound', {
      code: 400,
      msg: 'user not found or unauthorized'
    });
    return;
  }

  const twitClient = createTwitClient(user);
  // just try hashtag for now
  const { hashtag } = searchParams;
  const searchQuery = `#${ hashtag }`;

  // start loading the old tweets
  twitClient.get('search/tweets', {
    count: 1000,
    q: searchQuery
  }, (err, result, response) => {
    if (err) {
      console.log(err, result, response);
      socket.emit('searchStreamSetSearchTimeline', {
        media: [],
        error: 'Unexpected error happened.'
      });
      return;
    }

    const data = result.statuses;

    if (data.length === 0) {
      console.log(`got empty search timeline statuses for ${ JSON.stringify(searchParams) }`);

      socket.emit('searchStreamSetSearchTimeline', {
        media: [],
        error: 'Exception: search timeline is empty. Please try again later or contact us for help.'
      });

      return;
    }

    const { headers } = response;
    let media = [];
    console.info(`==> 😍  got search timeline of ${ JSON.stringify(searchParams) }... on ${ headers.date }, rate limit remaining: ${ headers['x-rate-limit-remaining'] }`);

    const lastTweet = data[data.length - 1];

    data.forEach((tweet) => {
      const mediaArr = extractTweetMedia(tweet);

      if (mediaArr.length > 0) {
        media = media.concat(mediaArr);
      }
    });

    console.info('==> 😏  search timeline is ready.');
    socket.emit('searchStreamSetSearchTimeline', {
      media,
      lastTweetId: lastTweet.id
    });
  });

  socket.on('loadPreviousSearchTimelineStatus', (maxTweetId) => {
    if (!maxTweetId) {
      socket.emit('previousSearchTimelineStatusesLoaded', {
        mediaArr: [],
        error: 'Exception: invalid tweet id while loading previous search timeline.'
      });
      return;
    }

    twitClient.get('search/tweets', {
      count: 1000,
      q: searchQuery,
      max_id: maxTweetId
    }, (err, result, response) => {
      if (err) {
        console.log(err, result, response);
        const msg = err.message || 'Unexpected error happened';
        socket.emit('previousSearchTimelineStatusesLoaded', {
          mediaArr: [],
          error: `Exception: ${ msg }`
        });
        return;
      }

      const data = result.statuses;

      if (data.length === 0) {
        console.log(`got empty previous search timeline statuses for ${ JSON.stringify(searchParams) }`);

        socket.emit('previousSearchTimelineStatusesLoaded', {
          media: []
        });

        return;
      }

      let media = [];
      const { headers } = response;
      const lastTweet = data[data.length - 1];
      const firstTweet = data[0];

      console.info(`==> 😍  got previous search timeline of @${ JSON.stringify(searchParams) } since ${ maxTweetId }. on ${ headers.date }, rate limit remaining: ${ headers['x-rate-limit-remaining'] }`);

      if (firstTweet.id === maxTweetId) {
        data.shift();
      }

      data.forEach((tweet) => {
        const mediaArr = extractTweetMedia(tweet);

        if (mediaArr.length > 0) {
          media = media.concat(mediaArr);
        }
      });

      socket.emit('previousSearchTimelineStatusesLoaded', {
        media: media,
        lastTweetId: lastTweet.id
      });
    });
  });

  searchStreamSocket = twitClient.stream('statuses/filter', {
    track: hashtag
  });

  searchStreamSocket.on('disconnect', (disconnectMessage) => {
    console.info('==> 😅  disconnectMessage', disconnectMessage);
  });

  searchStreamSocket.on('connect', () => {
    console.info('==> 😂  connecting...');
  });

  searchStreamSocket.on('connected', () => {
    console.info('==> 😍  connected...');
    // this event will not always be triggered.
  });

  searchStreamSocket.on('tweet', (tweet) => {
    console.info('==> 😘  new tweet...');
    const mediaArr = extractTweetMedia(tweet);

    if (mediaArr.length > 0) {
      console.info('==> 😍  new media tweet...');
      socket.emit('searchStreamGotNewTweetMedia', mediaArr);
    }
  });

  searchStreamSocket.on('limit', (limitMessage) => {
    console.log('==> 😱  got limited..', limitMessage);
  });

  searchStreamSocket.on('delete', (deleteMessage) => {
    console.info('==> 😂  someone deleted some message.', deleteMessage);
    socket.emit('searchStreamDeletedMessage', {
      tweetIdStr: deleteMessage.delete.status.id_str
    });
  });

  searchStreamSocket.on('warning', (warning) => {
    console.log('==> 😱  warning!!', warning);
  });

  searchStreamSocket.on('error', (eventMsg) => {
    console.log('==> 😱  error!!!!', eventMsg);
  });

  return searchStreamSocket; // eslint-disable-line consistent-return
}
