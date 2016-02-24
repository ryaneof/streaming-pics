import getTweetDetail from '../dataSources/tweetInformation';

export default function showTweetDetail(req) {
  let user = null;

  if (req.session && req.session.passport && req.session.passport.user) {
    user = req.session.passport.user;
  }

  return new Promise((resolve, reject) => {
    if (!user) {
      return reject('cannot get authenticated twitter user');
    }

    const { tweetIdStr, mediumIdStr } = req.body;

    return getTweetDetail(user, {
      tweetIdStr,
      mediumIdStr
    })
    .then((tweet) => {
      resolve(tweet);
    })
    .catch((error) => {
      reject(error);
    });
  });
}
