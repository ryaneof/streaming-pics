import { destroyFavoriteStatus } from '../dataSources/favoriteStatus';

export default function destroyFavoriteTweet(req) {
  let user = null;

  if (req.session && req.session.passport && req.session.passport.user) {
    user = req.session.passport.user;
  }

  return new Promise((resolve, reject) => {
    if (!user) {
      return reject('cannot get authenticated twitter user');
    }

    return destroyFavoriteStatus(user, {
      tweetIdStr: req.body.tweetIdStr
    })
    .then((tweet) => {
      resolve(tweet);
    })
    .catch((error) => {
      reject(error);
    })
  });
}
