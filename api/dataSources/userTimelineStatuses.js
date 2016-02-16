import Twit from 'twit';
import nconf from 'nconf';
import { extractTweetMedia } from '../utils/tweetHandler';
import { createTwitClient } from '../utils/twitClient';

nconf.env();

export default function userTimelineStatuses(socket, userScreenName) {
  let user;

  try {
    user = socket.handshake.session.passport.user;
  } catch (e) {
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

  let T = createTwitClient(user);

  // Streaming API won't display protected users' statuses
  // userTimelineStatusesSocket = T.stream('statuses/filter', { follow: '' });

  T.get('statuses/user_timeline', {
    count: 100,
    screen_name: userScreenName,
    include_rts: true
  }, (err, data, response) => {
    if (err) {
      console.log(err, data, response);
      socket.emit('userTimelineStatusesInited', {
        media: [],
        error: 'Unexpected error happened.'
      });
      return;
    }

    if (data.length === 0) {
      console.log(`got empty user timeline statuses for ${ userScreenName }`);

      socket.emit('userTimelineStatusesInited', {
        media: [],
        lastTweetId: null,
        error: 'Exception: user timeline is empty. Please try again later or contact us for help.'
      });

      return;
    }

    const { headers } = response;

    console.info(`==> 😍  got timeline of @${ userScreenName }... on ${ headers.date }, rate limit remaining: ${ headers['x-rate-limit-remaining'] }`);

    let media = [];
    const lastTweet = data[data.length - 1];

    data.forEach((tweet) => {
      let mediaArr = extractTweetMedia(tweet);

      if (mediaArr.length > 0) {
        media = media.concat(mediaArr);
      }
    });

    socket.emit('userTimelineStatusesInited', {
      media,
      lastTweetId: lastTweet.id
    });
  });

  socket.on('loadPreviousUserTimelineStatuses', (maxTweetId) => {
    if (!maxTweetId) {
      socket.emit('previousUserTimelineStatusesLoaded', {
        media: [],
        error: 'Exception: invalid tweet id while loading previous user timeline.'
      });
      return;
    }

    T.get('statuses/user_timeline', {
      count: 100,
      screen_name: userScreenName,
      include_rts: true,
      max_id: maxTweetId
    }, (err, data, response) => {
      if (err) {
        console.log(err, data, response);
        socket.emit('previousUserTimelineStatusesLoaded', {
          media: [],
          error: 'Unexpected error happened.'
        });
        return;
      }

      if (data.length === 0) {
        console.log(`got empty previous user timeline statuses for ${ userScreenName }`);

        socket.emit('previousUserTimelineStatusesLoaded', {
          media: [],
          lastTweetId: null
        });

        return;
      }

      const { headers } = response;
      console.info(`==> 😍  got previous timeline of @${ userScreenName } since ${ maxTweetId }. on ${ headers.date }, rate limit remaining: ${ headers['x-rate-limit-remaining'] }`);

      let media = [];

      const lastTweet = data[data.length - 1];
      const firstTweet = data[0];

      if (firstTweet.id === maxTweetId) {
        data.shift();
      }

      data.forEach((tweet) => {
        let mediaArr = extractTweetMedia(tweet);

        if (mediaArr.length > 0) {
          media = media.concat(mediaArr);
        }
      });

      socket.emit('previousUserTimelineStatusesLoaded', {
        media: media,
        lastTweetId: lastTweet.id
      });
    })
  });
}
