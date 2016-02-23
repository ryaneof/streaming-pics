import getUserProfile from '../dataSources/userInformation';

export default function showUserProfile(req) {
  let user = null;

  if (req.session && req.session.passport && req.session.passport.user) {
    user = req.session.passport.user;
  }

  return new Promise((resolve, reject) => {
    if (!user) {
      return reject('cannot get authenticated twitter user');
    }

    return getUserProfile(user, {
      screenName: req.body.screenName
    })
    .then((profile) => {
      resolve(profile);
    })
    .catch((error) => {
      reject(error);
    });
  });
}
