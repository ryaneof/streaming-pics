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
    mediaItem.isFavorited = status.favorited;
    mediaItem.isRetweeted = status.retweeted;
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
