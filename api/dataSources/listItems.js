import { createTwitClient } from '../utils/twitClient';

export default function getListItems(user, listRelation, listItemsParams) {
  const listRelationEndpointMap = {
    listed: 'lists/memberships',
    created: 'lists/ownerships',
    subscribed: 'lists/subscriptions'
  };

  if (!listRelation || !listRelationEndpointMap[listRelation]) {
    return Promise.reject('invalid list relation');
  }

  let T = createTwitClient(user);

  return new Promise((resolve, reject) => {
    T.get(listRelationEndpointMap[listRelation], {
      screen_name: listItemsParams.userScreenName,
      count: 20,
      cursor: listItemsParams.nextCursorStr
    }, (err, data, response) => {
      if (err) {
        console.log(err, data, response);
        return reject(err);
      }

      let listItems = {};

      listItems.previousCursorStr = data.previous_cursor_str;
      listItems.listsArr = data.lists.map((listItemData) => {
        const listOwner = listItemData.user;
        let listItem = {};

        listItem.listIdStr = listItemData.id_str;
        listItem.listName = listItemData.name;
        listItem.listSlug = listItemData.slug;
        listItem.listMode = listItemData.mode;
        listItem.listURL = `https://twitter.com${ listItemData.uri }`;
        listItem.subscriberCount = listItemData.subscriber_count;
        listItem.memberCount = listItemData.member_count;
        listItem.ownerScreenName = listOwner.screen_name;
        listItem.ownerName = listOwner.name;
        listItem.ownerProfileImageURL = listOwner.profile_image_url_https.replace(/\_normal/, '_bigger');

        return listItem;
      });

      listItems.nextCursorStr = data.next_cursor_str;

      return resolve(listItems);
    });
  });
}
