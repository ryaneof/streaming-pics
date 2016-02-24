import { createTwitClient } from '../utils/twitClient';
import { extractTweetMedia } from '../utils/tweetHandler';

export default function getTweetDetail(user, tweetParams) {
  const twitClient = createTwitClient(user);
  const { tweetIdStr, mediumIdStr } = tweetParams;

  return new Promise((resolve, reject) => {
    twitClient.get('statuses/show', {
      id: tweetIdStr,
      trim_user: false,
      include_my_retweet: true,
      include_entities: true
    }, (err, data, response) => {
      if (err) {
        console.log(err, data, response);
        return reject(err);
      }

      const tweet = {};
      const quotedStatus = data.quoted_status;
      let currentMedium = null;
      let currentMediumIndex = -1;

      // console.log(data);
      tweet.favoriteCount = data.favorite_count;
      tweet.isFavorited = data.favorited;
      tweet.isRetweeted = data.retweeted;
      tweet.mediaArr = extractTweetMedia(data);
      // tweet.retweetCount = data.retweet_count;
      tweet.tweetCreatedTime = new Date(data.created_at).getTime();
      tweet.tweetText = data.text;
      tweet.tweetIdStr = data.id_str;
      tweet.tweetURL = `https://twitter.com/${ data.user.screen_name }/status/${ data.id_str }`;
      tweet.userScreenName = data.user.screen_name;
      tweet.userName = data.user.name;
      tweet.userProfileImageURL = data.user.profile_image_url_https.replace(/\_normal/, '_bigger');

      tweet.quotedStatus = quotedStatus ? {
        favoriteCount: quotedStatus.favorite_count,
        isFavorited: quotedStatus.favorited,
        isRetweeted: quotedStatus.retweeted,
        tweetUserScreenName: quotedStatus.user.screen_name,
        tweetIdStr: quotedStatus.id_str,
        tweetText: quotedStatus.text,
        tweetURL: `https://twitter.com/${ quotedStatus.user.screen_name }/status/${ quotedStatus.id_str }`,
        userScreenName: quotedStatus.user.screen_name,
        userProfileImageURL: quotedStatus.user.profile_image_url_https.replace(/\_normal/, '_bigger'),
        userName: quotedStatus.user.name,
        userIdStr: quotedStatus.user.id_str
      } : null;

      const mediaArr = tweet.mediaArr;

      if (mediaArr.length > 0) {
        if (mediumIdStr) {
          mediaArr.forEach((mediaItem, mediaItemIndex) => {
            if (mediaItem.mediumIdStr === mediumIdStr) {
              currentMedium = mediaItem;
              currentMediumIndex = mediaItemIndex;
              return false;
            }
          });
        } else {
          currentMediumIndex = 0;
          currentMedium = mediaArr[currentMediumIndex];
        }
      }

      tweet.currentMedium = currentMedium;
      tweet.currentMediumIndex = currentMediumIndex;

      return resolve(tweet);
    });
  });
}
