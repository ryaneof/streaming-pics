function extractStatusMedia(status) {
  // a status would be a tweet, a retweeted tweet, or a quoted tweet
  const thirdPartyServiceMediaURLArr = [];
  const twitterMediaArr = [];
  const containsExtendedMediaEntities = (status.extended_entities &&
    status.extended_entities.media &&
    status.extended_entities.media.length > 0
  );

  if (containsExtendedMediaEntities) {
    status.extended_entities.media.forEach((extendedMediaItem) => {
      switch (extendedMediaItem.type) {
        case 'photo':
          twitterMediaArr.push({
            mediumExternalURL: extendedMediaItem.url,
            mediumIdStr: extendedMediaItem.id_str,
            mediumSource: 'Twitter',
            mediumType: extendedMediaItem.type,
            mediumURL: extendedMediaItem.media_url_https
          });
          return;
        case 'animated_gif':
          if (extendedMediaItem.video_info && extendedMediaItem.video_info.variants) {
            const animatedGIFVariant = extendedMediaItem.video_info.variants[0];
            twitterMediaArr.push({
              mediumExternalURL: extendedMediaItem.url,
              mediumIdStr: extendedMediaItem.id_str,
              mediumSource: 'Twitter',
              mediumType: extendedMediaItem.type,
              mediumURL: extendedMediaItem.media_url_https,
              mediumVideoURL: animatedGIFVariant.url
            });

            if (animatedGIFVariant.content_type !== 'video/mp4') {
              console.log('==> 😅  collect unknown animated_gif variant content type', animatedGIFVariant);
            }
          }

          return;
        case 'video':
          if (extendedMediaItem.video_info && extendedMediaItem.video_info.variants) {
            const videoInfo = extendedMediaItem.video_info;
            let highestBitrateMP4VideoURL = '';
            let highestBitrate = 0;

            videoInfo.variants.forEach((variant) => {
              if (variant.content_type === 'video/mp4' && variant.bitrate > highestBitrate) {
                highestBitrate = variant.bitrate;
                highestBitrateMP4VideoURL = variant.url;
              }
            });

            if (highestBitrateMP4VideoURL) {
              twitterMediaArr.push({
                mediumExternalURL: extendedMediaItem.url,
                mediumIdStr: extendedMediaItem.id_str,
                mediumSource: 'Twitter',
                mediumType: extendedMediaItem.type,
                mediumURL: extendedMediaItem.media_url_https,
                mediumVideoURL: highestBitrateMP4VideoURL,
                mediumVideoDurationMillis: videoInfo.duration_millis,
                mediumVideoAspectRadioArr: videoInfo.aspect_ratio
              });
            } else {
              console.log('==> 😅  collect unknown type variant content type', videoInfo);
            }
          }
          return;
        default:
          console.log('==> 😆  collect unknown media type', extendedMediaItem.type);
      }
    });
  }

  // filter third party potential image from tweet url entities
  status.entities.urls.forEach((entitiesURLItem, entitiesURLIndex) => {
    const expandedURL = entitiesURLItem.expanded_url;
    const instagramMatchResult = expandedURL.match(/instagram.com\/p\/(.*)/);

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

  return twitterMediaArr.concat(thirdPartyServiceMediaURLArr);
}

function appendTweetInformation(mediaItem, status, tweet) {
  const user = status.user;
  const quotedStatus = status.quoted_status;

  mediaItem.favoriteCount = status.favorite_count;
  mediaItem.isFavorited = status.favorited;
  mediaItem.isRetweeted = status.retweeted;
  // mediaItem.retweetCount = status.retweet_count;
  mediaItem.retweetedTweetIdStr = status.retweeted ? status.id_str : null;
  mediaItem.tweetCreatedTime = new Date(status.created_at).getTime();
  mediaItem.tweetText = status.text;
  mediaItem.tweetIdStr = tweet.id_str;
  mediaItem.tweetUserScreenName = tweet.user.screen_name;
  mediaItem.tweetUserName = tweet.user.name;
  mediaItem.tweetUserProfileImageURL = tweet.user.profile_image_url_https.replace(/\_normal/, '_bigger');
  // mediaItem.tweetUserIdStr = tweet.user.id_str;
  mediaItem.tweetURL = `https://twitter.com/${ tweet.user.screen_name }/status/${ tweet.id_str }`;
  mediaItem.userScreenName = user.screen_name;
  mediaItem.userProfileImageURL = user.profile_image_url_https.replace(/\_normal/, '_bigger');
  mediaItem.userName = user.name;
  mediaItem.userIdStr = user.id_str;

  mediaItem.quotedStatus = quotedStatus ? {
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

  return mediaItem;
}

export function extractTweetMedia(tweet) {
  let status = tweet;

  if (tweet.retweeted_status) {
    status = tweet.retweeted_status;
  }

  let mediaArr = [];
  let quotedStatusMediaArr = [];

  const tweetMediaArr = extractStatusMedia(status);
  const quotedStatus = status.quoted_status;

  mediaArr = tweetMediaArr.map((mediaItem) => {
    return appendTweetInformation(mediaItem, status, tweet);
  });

  if (quotedStatus) {
    // quoted status is technically two complete tweets
    // media within quoted status should contain original status information
    quotedStatusMediaArr = extractStatusMedia(quotedStatus).map((mediaItem) => {
      mediaItem = appendTweetInformation(mediaItem, status, tweet); // eslint-disable-line no-param-reassign
      mediaItem.isFromQuotedStatus = true;

      return mediaItem;
    });
  }

  return mediaArr.concat(quotedStatusMediaArr);
}
