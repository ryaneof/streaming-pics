export function extractTweetMedia(tweet) {
  let status = tweet;

  if (tweet.retweeted_status) {
    status = tweet.retweeted_status;
  } else if (tweet.quoted_status) {
    status = tweet.quoted_status;
  }

  const user = status.user;

  let mediaArr = [];
  let thirdPartyServiceMediaURLArr = [];
  let twitterMediaArr = [];
  let containsExtendedMediaEntities = (status.extended_entities && status.extended_entities.media && status.extended_entities.media.length > 0);

  if (containsExtendedMediaEntities) {
    status.extended_entities.media.forEach((extendedMediaItem) => {
      if (extendedMediaItem.type === 'photo') {
        twitterMediaArr.push({
          mediumExternalURL: extendedMediaItem.url,
          mediumIdStr: extendedMediaItem.id_str,
          mediumSource: 'Twitter',
          mediumType: extendedMediaItem.type,
          mediumURL: extendedMediaItem.media_url_https
        });
      } else {
        console.log('==> 😆  collect unknown media type', extendedMediaItem.type);
      }
    });
  }

  // filter third party potential image from tweet url entities
  status.entities.urls.forEach((entitiesURLItem, entitiesURLIndex) => {
    let expandedURL = entitiesURLItem.expanded_url;
    let instagramMatchResult = expandedURL.match(/instagram.com\/p\/(.*)/);

    if (instagramMatchResult && instagramMatchResult[1]) {
      thirdPartyServiceMediaURLArr.push({
        mediumExternalURL: expandedURL,
        mediumIdStr: `instagram-${ entitiesURLIndex }`,
        mediumSource: 'Instagram',
        mediumType: 'photoOrVideo',
        mediumURL: `https://instagram.com/p/${ instagramMatchResult[1].replace(/\/.*/, '') }/media/?size=l`
      });
      return;
    }
  });

  mediaArr = twitterMediaArr.concat(thirdPartyServiceMediaURLArr).map((mediaItem) => {
    mediaItem.favoriteCount = status.favorite_count;
    // mediaItem.retweetCount = status.retweet_count;
    mediaItem.tweetCreatedTime = new Date(status.created_at).getTime();
    mediaItem.tweetText = status.text;
    mediaItem.tweetIdStr = tweet.id_str;
    mediaItem.tweetUserScreenName = tweet.user.screen_name;
    // mediaItem.tweetUserIdStr = tweet.user.id_str;
    mediaItem.tweetURL = `https://twitter.com/${ tweet.user.screen_name }/status/${ tweet.id_str }`;
    mediaItem.userScreenName =  user.screen_name;
    mediaItem.userProfileImageURL = user.profile_image_url_https.replace(/\_normal/, '_bigger');
    mediaItem.userName = user.name;
    mediaItem.userIdStr = user.id_str;

    return mediaItem;
  });

  return mediaArr;
}
