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
      const originalTweet = data;
      const status = originalTweet.retweeted_status ? originalTweet.retweeted_status : originalTweet;
      const quotedStatus = status.quoted_status;
      let currentMedium = null;
      let currentMediumIndex = -1;

      tweet.favoriteCount = status.favorite_count;
      tweet.isFavorited = status.favorited;
      tweet.isRetweeted = status.retweeted;
      tweet.mediaArr = extractTweetMedia(status);
      // tweet.retweetCount = status.retweet_count;
      tweet.tweetCreatedTime = new Date(status.created_at).getTime();
      tweet.tweetText = status.text;
      tweet.tweetIdStr = originalTweet.id_str;
      tweet.tweetUserScreenName = originalTweet.user.screen_name;
      tweet.tweetUserName = originalTweet.user.name;
      tweet.tweetUserProfileImageURL = originalTweet.user.profile_image_url_https.replace(/\_normal/, '_bigger');
      tweet.tweetURL = `https://twitter.com/${ originalTweet.user.screen_name }/status/${ originalTweet.id_str }`;
      tweet.userScreenName = status.user.screen_name;
      tweet.userProfileImageURL = status.user.profile_image_url_https.replace(/\_normal/, '_bigger');
      tweet.userName = status.user.name;
      tweet.userIdStr = status.user.id_str;

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
