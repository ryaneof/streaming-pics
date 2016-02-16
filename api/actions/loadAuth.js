export default function loadAuth(req) {
  let user = null;

  if (req.session && req.session.passport && req.session.passport.user) {
    user = req.session.passport.user;
    console.log(user);
  }

  return Promise.resolve(user);
}
