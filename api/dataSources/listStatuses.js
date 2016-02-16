import Twit from 'twit';
import nconf from 'nconf';
import { extractTweetMedia } from '../utils/tweetHandler';
import { createTwitClient } from '../utils/twitClient';

nconf.env();

export default function listStatuses(socket, listStatusesParams) {
  let user;

  try {
    user = socket.handshake.session.passport.user;
  } catch (e) {
    user = null;
  }

  console.info('==> 🙄  WELCOME TO %s\'s MEDIA TWEETS', listStatusesParams);

  if (!user) {
    socket.emit('listStatusesUserNotFound', {
      code: 400,
      msg: 'user not found or unauthorized'
    });
    return;
  }

  let T = createTwitClient(user);
  const { userScreenName, listSlug } = listStatusesParams;

  T.get('lists/statuses', {
    count: 100,
    owner_screen_name: userScreenName,
    slug: listSlug,
    include_rts: true
  }, (err, data, response) => {
    if (err) {
      console.log(err, data, response);
      socket.emit('listStatusesInited', {
        media: [],
        error: 'Unexpected error happened.'
      });
      return;
    }

    if (data.length === 0) {
      console.log(`got empty list statuses for @${ userScreenName }/${ listSlug }`);

      socket.emit('listStatusesInited', {
        media: [],
        lastTweetId: null,
        error: 'Exception: list status is empty. Please try again later or contact us for help.'
      });

      return;
    }

    const { headers } = response;

    console.info(`==> 😍  got list statuses of @${ userScreenName }/${ listSlug }... on ${ headers.date }, rate limit remaining: ${ headers['x-rate-limit-remaining'] }`);

    let media = [];
    const lastTweet = data[data.length - 1];

    data.forEach((tweet) => {
      let mediaArr = extractTweetMedia(tweet);

      if (mediaArr.length > 0) {
        media = media.concat(mediaArr);
      }
    });

    socket.emit('listStatusesInited', {
      media,
      lastTweetId: lastTweet.id
    });
  });

  socket.on('loadPreviousListStatuses', (maxTweetId) => {
    if (!maxTweetId) {
      socket.emit('previousListStatusesLoaded', {
        media: [],
        error: 'Exception: invalid tweet id while loading previous list statuses.'
      });
      return;
    }

    T.get('lists/statuses', {
      count: 100,
      owner_screen_name: userScreenName,
      slug: listSlug,
      include_rts: true
    }, (err, data, response) => {
      if (err) {
        console.log(err, data, response);
        socket.emit('previousListStatusesLoaded', {
          media: [],
          error: 'Unexpected error happened.'
        });
        return;
      }

      if (data.length === 0) {
        console.log(`got empty previous list statuses for @${ userScreenName }/${ listSlug }`);

        socket.emit('previousListStatusesLoaded', {
          media: [],
          lastTweetId: null
        });

        return;
      }

      const { headers } = response;
      console.info(`==> 😍  got previous list statuses of @${ userScreenName }/${ listSlug } since ${ maxTweetId }. on ${ headers.date }, rate limit remaining: ${ headers['x-rate-limit-remaining'] }`);

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

      socket.emit('previousListStatusesLoaded', {
        media: media,
        lastTweetId: lastTweet.id
      });
    })
  });
}
