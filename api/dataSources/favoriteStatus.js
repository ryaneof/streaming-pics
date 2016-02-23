import { createTwitClient } from '../utils/twitClient';

export function createFavoriteStatus(user, favoriteStatusParams) {
  const twitClient = createTwitClient(user);

  return new Promise((resolve, reject) => {
    twitClient.post('favorites/create', {
      id: favoriteStatusParams.tweetIdStr,
      include_entities: false
    }, (err, data, response) => {
      if (err) {
        console.log(err, data, response);
        return reject(err);
      }

      const tweet = {};

      tweet.isFavorited = data.favorited;
      tweet.tweetIdStr = data.id_str;
      tweet.favoriteCount = data.favorite_count;

      return resolve(tweet);
    });
  });
}

export function destroyFavoriteStatus(user, favoriteStatusParams) {
  const twitClient = createTwitClient(user);

  return new Promise((resolve, reject) => {
    twitClient.post('favorites/destroy', {
      id: favoriteStatusParams.tweetIdStr,
      include_entities: false
    }, (err, data, response) => {
      if (err) {
        console.log(err, data, response);
        return reject(err);
      }

      const tweet = {};

      tweet.isFavorited = data.favorited;
      tweet.tweetIdStr = data.id_str;
      tweet.favoriteCount = data.favorite_count;

      return resolve(tweet);
    });
  });
}
