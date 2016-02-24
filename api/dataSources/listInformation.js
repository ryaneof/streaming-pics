import { createTwitClient } from '../utils/twitClient';

export default function getListInformation(user, listInformationParams) {
  const twitClient = createTwitClient(user);

  return new Promise((resolve, reject) => {
    twitClient.get('lists/show', {
      owner_screen_name: listInformationParams.userScreenName,
      slug: listInformationParams.listSlug
    }, (err, data, response) => {
      if (err) {
        console.log(err, data, response);
        return reject(err);
      }

      const listDetail = {};
      const listOwner = data.user || {};

      // console.log(data);

      listDetail.listIdStr = data.id_str;
      listDetail.listName = data.name;
      listDetail.listSlug = data.slug;
      listDetail.listMode = data.mode;
      listDetail.listURL = `https://twitter.com${ data.uri }`;
      listDetail.subscriberCount = data.subscriber_count;
      listDetail.memberCount = data.member_count;
      listDetail.userScreenName = listOwner.screen_name;
      listDetail.userName = listOwner.name;
      listDetail.userProfileImageURL = listOwner.profile_image_url_https.replace(/\_normal/, '_bigger');

      return resolve(listDetail);
    });
  });
}
