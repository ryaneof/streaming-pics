import { extractTweetMedia } from '../utils/tweetHandler';
import { createTwitClient } from '../utils/twitClient';

export default function userStream(socket) {
  let user;
  let userStreamSocket;

  try {
    user = socket.handshake.session.passport.user;
  } catch (err) {
    user = null;
  }

  console.info('==> 🙄  WELCOME TO YOUR STREAM', user);

  if (!user) {
    socket.emit('userStreamUserNotFound', {
      code: 400,
      msg: 'user not found or unauthorized'
    });
    return;
  }

  const twitClient = createTwitClient(user);

  // start loading the old tweets
  twitClient.get('statuses/home_timeline', {
    count: 1000
  }, (err, data, response) => {
    if (err) {
      console.log(err, data, response);
      socket.emit('userStreamSetHomeTimeline', {
        media: [],
        error: 'Unexpected error happened.'
      });
      return;
    }

    if (data.length === 0) {
      console.log(`got empty home timeline statuses for ${ user.username }`);

      socket.emit('userStreamSetHomeTimeline', {
        media: [],
        error: 'Exception: home timeline is empty. Please try again later or contact us for help.'
      });

      return;
    }

    const { headers } = response;
    let media = [];
    console.info(`==> 😍  got home timeline of @${ user.username }... on ${ headers.date }, rate limit remaining: ${ headers['x-rate-limit-remaining'] }`);

    const lastTweet = data[data.length - 1];

    data.forEach((tweet) => {
      const mediaArr = extractTweetMedia(tweet);

      if (mediaArr.length > 0) {
        media = media.concat(mediaArr);
      }
    });

    console.info('==> 😏  home timline is ready.');
    socket.emit('userStreamSetHomeTimeline', {
      media,
      lastTweetId: lastTweet.id
    });
  });

  socket.on('loadPreviousHomeTimelineStatus', (maxTweetId) => {
    if (!maxTweetId) {
      socket.emit('previousHomeTimelineStatusLoaded', {
        mediaArr: [],
        error: 'Exception: invalid tweet id while loading previous home timeline.'
      });
      return;
    }

    twitClient.get('statuses/home_timeline', {
      count: 1000,
      max_id: maxTweetId
    }, (err, data, response) => {
      if (err) {
        console.log(err, data, response);
        const msg = err.message || 'Unexpected error happened';
        socket.emit('previousHomeTimelineStatusLoaded', {
          mediaArr: [],
          error: `Exception: ${ msg }`
        });
        return;
      }

      if (data.length === 0) {
        console.log(`got empty previous home timeline statuses for ${ user.username }`);

        socket.emit('previousHomeTimelineStatusesLoaded', {
          media: []
        });

        return;
      }

      let media = [];
      const { headers } = response;
      const lastTweet = data[data.length - 1];
      const firstTweet = data[0];

      console.info(`==> 😍  got previous home timeline of @${ user.username } since ${ maxTweetId }. on ${ headers.date }, rate limit remaining: ${ headers['x-rate-limit-remaining'] }`);

      if (firstTweet.id === maxTweetId) {
        data.shift();
      }

      data.forEach((tweet) => {
        const mediaArr = extractTweetMedia(tweet);

        if (mediaArr.length > 0) {
          media = media.concat(mediaArr);
        }
      });

      socket.emit('previousHomeTimelineStatusesLoaded', {
        media: media,
        lastTweetId: lastTweet.id
      });
    });
  });

  userStreamSocket = twitClient.stream('user');

  userStreamSocket.on('disconnect', (disconnectMessage) => {
    console.info('==> 😅  disconnectMessage', disconnectMessage);
  });

  userStreamSocket.on('connect', () => {
    console.info('==> 😂  connecting...');
  });

  userStreamSocket.on('connected', () => {
    console.info('==> 😍  connected...');
    // this event will not always be triggered.
  });

  userStreamSocket.on('tweet', (tweet) => {
    console.info('==> 😘  new tweet...');
    const mediaArr = extractTweetMedia(tweet);

    if (mediaArr.length > 0) {
      console.info('==> 😍  new media tweet...');
      socket.emit('userStreamGotNewTweetMedia', mediaArr);
    }
  });

  userStreamSocket.on('limit', (limitMessage) => {
    console.log('==> 😱  got limited..', limitMessage);
  });

  userStreamSocket.on('delete', (deleteMessage) => {
    console.info('==> 😂  someone deleted some message.', deleteMessage);
    socket.emit('userStreamDeletedMessage', {
      tweetIdStr: deleteMessage.delete.status.id_str
    });
  });

  userStreamSocket.on('warning', (warning) => {
    console.log('==> 😱  warning!!', warning);
  });

  userStreamSocket.on('error', (eventMsg) => {
    console.log('==> 😱  error!!!!', eventMsg);
  });

  return userStreamSocket; // eslint-disable-line consistent-return
}
