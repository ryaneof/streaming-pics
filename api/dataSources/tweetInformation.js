import { createTwitClient } from '../utils/twitClient';
import { extractTweetMedia } from '../utils/tweetHandler';

export default function getTweetDetail(user, tweetParams) {
  let T = createTwitClient(user);
  const { tweetIdStr, mediumIdStr } = tweetParams;

  return new Promise((resolve, reject) => {
    T.get('statuses/show', {
      id: tweetIdStr,
      trim_user: false,
      include_my_retweet: true,
      include_entities: true
    }, (err, data, response) => {
      if (err) {
        console.log(err, data, response);
        return reject(err);
      }

      let tweet = {};
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

      const mediaArr = tweet.mediaArr;

      if (mediaArr.length > 0 && mediumIdStr) {
        mediaArr.forEach((mediaItem, mediaItemIndex) => {
          if (mediaItem.mediumIdStr === mediumIdStr) {
            currentMedium = mediaItem;
            currentMediumIndex = mediaItemIndex;
            return false;
          }
        });
      }

      tweet.currentMedium = currentMedium;
      tweet.currentMediumIndex = currentMediumIndex;

      return resolve(tweet);
    });
  });
}
