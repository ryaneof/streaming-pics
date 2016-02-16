import getListItems from '../dataSources/listItems';

export default function loadListItems(req) {
  let user = null;

  if (req.session && req.session.passport && req.session.passport.user) {
    user = req.session.passport.user;
  }

  return new Promise((resolve, reject) => {
    if (!user) {
      return reject('cannot get authenticated twitter user');
    }

    // console.log('req.body', req.body);

    return getListItems(user, req.body.listRelation, {
      userScreenName: req.body.userScreenName,
      nextCursorStr: req.body.nextCursorStr
    })
    .then((listItems) => {
      resolve(listItems);
    })
    .catch((error) => {
      reject(error);
    })
  });
}
