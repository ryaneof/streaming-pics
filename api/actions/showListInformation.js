import getListInformation from '../dataSources/listInformation';

export default function showListInformation(req) {
  let user = null;

  if (req.session && req.session.passport && req.session.passport.user) {
    user = req.session.passport.user;
  }

  return new Promise((resolve, reject) => {
    if (!user) {
      return reject('cannot get authenticated twitter user');
    }

    return getListInformation(user, {
      userScreenName: req.body.userScreenName,
      listSlug: req.body.listSlug
    })
    .then((profile) => {
      resolve(profile);
    })
    .catch((error) => {
      reject(error);
    });
  });
}
