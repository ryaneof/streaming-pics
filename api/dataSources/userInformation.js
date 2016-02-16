import { createTwitClient } from '../utils/twitClient';

export default function getUserProfile(user, showUserProfile) {
  let T = createTwitClient(user);

  return new Promise((resolve, reject) => {
    T.get('users/show', {
      screen_name: showUserProfile.screenName
    }, (err, data, response) => {
      if (err) {
        console.log(err, data, response);
        return reject(err);
      }

      let profile = {};

      // console.log(data);

      profile.userName = data.name;
      profile.userScreenName = data.screen_name;
      profile.userIdStr = data.id_str;
      profile.protected = data.protected;
      profile.followingCount = data.friends_count;
      profile.followerCount = data.followers_count;
      profile.statusCount = data.statuses_count;
      profile.listedCount = data.listed_count;
      profile.favoriteCount = data.favourites_count;
      profile.bannerImageURL = data.profile_banner_url;
      profile.profileImageURL = data.profile_image_url_https.replace(/\_normal/, '_bigger');

      return resolve(profile);
    });
  });
}
