export default function signOut(req) {
  return new Promise((resolve) => {
    req.session.destroy(() => {
      req.session = null;
      return resolve(null);
    });
  });
}
