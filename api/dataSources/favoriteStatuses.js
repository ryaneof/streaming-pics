import { createTwitClient } from '../utils/twitClient';
import { extractTweetMedia } from '../utils/tweetHandler';

export default function favoriteStatuses(socket, userScreenName) {
  let user;
  let twitClient;

  try {
    user = socket.handshake.session.passport.user;
  } catch (err) {
    user = null;
  }

  console.info('==> 🙄  WELCOME TO %s\'s MEDIA TWEETS', userScreenName);

  if (!user) {
    socket.emit('userStreamUserNotFound', {
      code: 400,
      msg: 'user not found or unauthorized'
    });
    return;
  }

  twitClient = createTwitClient(user);

  // include entities

  twitClient.get('favorites/list', {
    count: 100,
    screen_name: userScreenName
  }, (err, data, response) => {
    if (err) {
      console.log(err, data, response);
      socket.emit('favoriteStatusesInited', {
        media: [],
        error: 'Unexpected error happened.'
      });
      return;
    }

    if (data.length === 0) {
      console.log(`got empty favorite statuses list for ${ userScreenName }`);

      socket.emit('favoriteStatusesInited', {
        media: [],
        error: 'Exception: user favorited status not found. Please try again later or contact us for help.'
      });

      return;
    }

    const { headers } = response;
    let media = [];

    console.info(`==> 😍  got favorite statuses of @${ userScreenName }... on ${ headers.date }, rate limit remaining: ${ headers['x-rate-limit-remaining'] }`);

    const lastTweet = data[data.length - 1];

    data.forEach((tweet) => {
      const mediaArr = extractTweetMedia(tweet);

      if (mediaArr.length > 0) {
        media = media.concat(mediaArr);
      }
    });

    socket.emit('favoriteStatusesInited', {
      media,
      lastTweetId: lastTweet.id
    });
  });

  socket.on('loadPreviousFavoriteStatuses', (maxTweetId) => {
    if (!maxTweetId) {
      socket.emit('previousFavoriteStatusesLoaded', {
        error: 'Exception: invalid tweet id while loading previous user favorited statuses.'
      });
      return;
    }

    twitClient.get('favorites/list', {
      count: 100,
      screen_name: userScreenName,
      max_id: maxTweetId
    }, (err, data, response) => {
      if (err) {
        console.log(err, data, response);
        socket.emit('previousFavoriteStatusesLoaded', {
          media: [],
          error: 'Unexpected error happened.'
        });
        return;
      }

      if (data.length === 0) {
        console.log(`got empty previous favorite statuses for ${ userScreenName }`);

        socket.emit('previousFavoriteStatusesLoaded', {
          media: [],
          lastTweetId: null
        });

        return;
      }

      const { headers } = response;
      console.info(`==> 😍  got previous favorite statuses of @${ userScreenName } since ${ maxTweetId }. on ${ headers.date }, rate limit remaining: ${ headers['x-rate-limit-remaining'] }`);

      let media = [];

      const lastTweet = data[data.length - 1];
      const firstTweet = data[0];

      if (firstTweet.id === maxTweetId) {
        data.shift();
      }

      data.forEach((tweet) => {
        const mediaArr = extractTweetMedia(tweet);

        if (mediaArr.length > 0) {
          media = media.concat(mediaArr);
        }
      });

      socket.emit('previousFavoriteStatusesLoaded', {
        media: media,
        lastTweetId: lastTweet.id
      });
    });
  });
}
