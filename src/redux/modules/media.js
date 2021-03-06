const INIT = 'StreamingPics/media/INIT';
const INITED = 'StreamingPics/media/INITED';
const INIT_FAILED = 'StreamingPics/media/INIT_FAILED';
const UNSHIFT = 'StreamingPics/media/UNSHIFT';
const EMPTY = 'StreamingPics/media/EMPTY';
const APPEND = 'StreamingPics/media/APPEND';
const PUSH = 'StreamingPics/media/PUSH';
const REMOVE = 'StreamingPics/media/REMOVE';
const DISPLAY_MODAL = 'StreamingPics/media/DISPLAY_MODAL';
const DISPLAY_MODAL_PREVIOUS_MEDIUM = 'StreamingPics/media/DISPLAY_MODAL_PREVIOUS_MEDIUM';
const DISPLAY_MODAL_NEXT_MEDIUM = 'StreamingPics/media/DISPLAY_MODAL_NEXT_MEDIUM';
const HIDE_MODAL = 'StreamingPics/media/HIDE_MODAL';
const FAVORITE_MEDIA_ITEM = 'StreamingPics/media/FAVORITE_MEDIA_ITEM';
const FAVORITE_MEDIA_ITEM_SUCCESS = 'StreamingPics/media/FAVORITE_MEDIA_ITEM_SUCCESS';
const FAVORITE_MEDIA_ITEM_FAILED = 'StreamingPics/media/FAVORITE_MEDIA_ITEM_FAILED';
const UNFAVORITE_MEDIA_ITEM = 'StreamingPics/media/UNFAVORITE_MEDIA_ITEM';
const UNFAVORITE_MEDIA_ITEM_SUCCESS = 'StreamingPics/media/UNFAVORITE_MEDIA_ITEM_SUCCESS';
const UNFAVORITE_MEDIA_ITEM_FAILED = 'StreamingPics/media/UNFAVORITE_MEDIA_ITEM_FAILED';

const initialState = {
  loading: true,
  mediaArr: [],
  error: null,
  lastTweetId: null,
  showModal: false,
  modalMediaItem: null,
  modalMediaIndex: -1
};

const reCalculateModalMediaIndex = (currentState, upcomingMediaArr) => {
  const {
    showModal,
    modalMediaItem,
    modalMediaIndex
  } = currentState;

  let upcomingModalMediaIndex = modalMediaIndex;

  if (!showModal) {
    return {};
  }

  upcomingMediaArr.forEach((upcomingMediaItem, upcomingMediaIndex) => {
    if (modalMediaItem.tweetIdStr === upcomingMediaItem.tweetIdStr &&
        modalMediaItem.mediumIdStr === upcomingMediaItem.mediumIdStr) {
      upcomingModalMediaIndex = upcomingMediaIndex;
      return false;
    }
  });

  // current media item might be deleted, we will do nothing about this situation.

  return {
    showModal,
    modalMediaItem,
    modalMediaIndex: upcomingModalMediaIndex
  };
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case INIT:
      return initialState;
    case INITED:
      return {
        ...state,
        mediaArr: action.mediaArr,
        lastTweetId: action.lastTweetId,
        loading: false,
        error: null
      };
    case INIT_FAILED:
      return {
        ...state,
        mediaArr: [],
        loading: false,
        error: action.error
      };
    case UNSHIFT:
      const mediaArrAfterUnshift = action.mediaArr.concat(state.mediaArr);
      const modalStateAfterUnshift = reCalculateModalMediaIndex(state, mediaArrAfterUnshift);
      return {
        ...state,
        ...modalStateAfterUnshift,
        mediaArr: mediaArrAfterUnshift,
        loading: false,
        error: null
      };
    case EMPTY:
      return {
        ...state,
        mediaArr: [],
        lastTweetId: null,
        loading: false,
        error: null
      };
    case APPEND:
      return {
        ...state,
        mediaArr: state.mediaArr,
        lastTweetId: state.lastTweetId,
        loading: true,
        error: null
      };
    case PUSH:
      return {
        ...state,
        mediaArr: state.mediaArr.concat(action.mediaArr),
        lastTweetId: action.lastTweetId,
        loading: false,
        error: null
      };
    case REMOVE:
      const filteredMediaArr = state.mediaArr.filter((mediaItem) => {
        return (mediaItem.tweetIdStr !== action.tweetIdStr);
      });
      const modalStateAfterRemove = reCalculateModalMediaIndex(state, filteredMediaArr);
      const filteredMediaArrLastTweetId = (filteredMediaArr.length > 0) ? filteredMediaArr[filteredMediaArr.length - 1].tweetIdStr : null;

      return {
        ...state,
        ...modalStateAfterRemove,
        mediaArr: filteredMediaArr,
        lastTweetId: filteredMediaArrLastTweetId,
        loading: false,
        error: null
      };
    case DISPLAY_MODAL:
      return {
        ...state,
        showModal: true,
        modalMediaItem: action.mediaItem,
        modalMediaIndex: action.mediaIndex,
        error: null
      };
    case DISPLAY_MODAL_PREVIOUS_MEDIUM:
      const previousMediaIndex = state.modalMediaIndex > 0 ? state.modalMediaIndex - 1 : 0;
      return {
        ...state,
        showModal: true,
        modalMediaItem: state.mediaArr[previousMediaIndex],
        modalMediaIndex: previousMediaIndex,
        error: null
      };
    case DISPLAY_MODAL_NEXT_MEDIUM:
      const maxMediaIndex = state.mediaArr.length - 1;
      const nextMediaIndex = state.modalMediaIndex < maxMediaIndex ? state.modalMediaIndex + 1 : maxMediaIndex;
      return {
        ...state,
        showModal: true,
        modalMediaItem: state.mediaArr[nextMediaIndex],
        modalMediaIndex: nextMediaIndex,
        error: null
      };
    case HIDE_MODAL:
      return {
        ...state,
        showModal: false,
        modalMediaItem: null,
        modalMediaIndex: -1,
        error: null
      };
    case FAVORITE_MEDIA_ITEM:
      const modalMediaItemAfterFavorite = state.modalMediaItem ? {
        ...state.modalMediaItem,
        isFavorited: true
      } : null;

      return {
        ...state,
        modalMediaItem: modalMediaItemAfterFavorite
      };
    case FAVORITE_MEDIA_ITEM_SUCCESS:
      const favoritedActionResult = action.result;
      const favoritedTweetIdStr = favoritedActionResult.tweetIdStr;
      const updatedMediaArrWithFavoritedTweetIdStr = state.mediaArr.map((mediaItem) => {
        let tweetIdStr;
        let mediaItemSource;

        if (mediaItem.isRetweeted) {
          tweetIdStr = mediaItem.retweetedTweetIdStr;
        } else {
          tweetIdStr = mediaItem.tweetIdStr;
        }

        if (mediaItem.isFromQuotedStatus) {
          mediaItemSource = mediaItem.quotedStatus;
          tweetIdStr = mediaItemSource.tweetIdStr;
        } else {
          mediaItemSource = mediaItem;
        }

        if (tweetIdStr === favoritedTweetIdStr) {
          mediaItemSource.isFavorited = true;
          mediaItemSource.favoriteCount = favoritedActionResult.favoriteCount;
        }
        return mediaItem;
      });
      const modalMediaItemAfterFavoriteSuccess = state.modalMediaItem ? {
        ...state.modalMediaItem,
        favoriteCount: favoritedActionResult.favoriteCount
      } : null;

      return {
        ...state,
        mediaArr: updatedMediaArrWithFavoritedTweetIdStr,
        modalMediaItem: modalMediaItemAfterFavoriteSuccess
      };
    case FAVORITE_MEDIA_ITEM_FAILED:
      const modalMediaItemAfterFavoriteFailed = state.modalMediaItem ? {
        ...state.modalMediaItem,
        isFavorited: false
      } : null;

      return {
        ...state,
        modalMediaItem: modalMediaItemAfterFavoriteFailed
      };
    case UNFAVORITE_MEDIA_ITEM:
      const modalMediaItemAfterUnFavorite = state.modalMediaItem ? {
        ...state.modalMediaItem,
        isFavorited: false
      } : null;

      return {
        ...state,
        modalMediaItem: modalMediaItemAfterUnFavorite
      };
    case UNFAVORITE_MEDIA_ITEM_SUCCESS:
      const unfavoritedActionResult = action.result;
      const unfavoritedTweetIdStr = unfavoritedActionResult.tweetIdStr;
      const updatedMediaArrWithUnFavoritedTweetIdStr = state.mediaArr.map((mediaItem) => {
        let tweetIdStr;
        let mediaItemSource;

        if (mediaItem.isRetweeted) {
          tweetIdStr = mediaItem.retweetedTweetIdStr;
        } else {
          tweetIdStr = mediaItem.tweetIdStr;
        }

        if (mediaItem.isFromQuotedStatus) {
          mediaItemSource = mediaItem.quotedStatus;
          tweetIdStr = mediaItemSource.tweetIdStr;
        } else {
          mediaItemSource = mediaItem;
        }

        if (tweetIdStr === unfavoritedTweetIdStr) {
          mediaItemSource.isFavorited = false;
          mediaItemSource.favoriteCount = unfavoritedActionResult.favoriteCount;
        }
        return mediaItem;
      });
      const modalMediaItemAfterUnFavoriteSuccess = state.modalMediaItem ? {
        ...state.modalMediaItem,
        favoriteCount: unfavoritedActionResult.favoriteCount
      } : null;

      return {
        ...state,
        mediaArr: updatedMediaArrWithUnFavoritedTweetIdStr,
        modalMediaItem: modalMediaItemAfterUnFavoriteSuccess
      };
    case UNFAVORITE_MEDIA_ITEM_FAILED:
      const modalMediaItemAfterUnFavoriteFailed = state.modalMediaItem ? {
        ...state.modalMediaItem,
        isFavorited: true
      } : null;

      return {
        ...state,
        modalMediaItem: modalMediaItemAfterUnFavoriteFailed
      };
    default:
      return state;
  }
}

export function initMedia() {
  return {
    type: INIT
  };
}

export function initMediaArr(mediaArr = [], lastTweetId = '') {
  return {
    type: INITED,
    mediaArr,
    lastTweetId
  };
}

export function initMediaFailed(error) {
  return {
    type: INIT_FAILED,
    error
  };
}

export function unshiftMediaArr(mediaArr = []) {
  return {
    type: UNSHIFT,
    mediaArr
  };
}

export function emptyMediaArr() {
  return {
    type: EMPTY
  };
}

export function appendMedia() {
  return {
    type: APPEND
  };
}

export function appendMediaArr(mediaArr = [], lastTweetId) {
  return {
    type: PUSH,
    mediaArr,
    lastTweetId
  };
}

export function removeFromMediaArr(tweetIdStr) {
  return {
    type: REMOVE,
    tweetIdStr
  };
}

export function displayMediaModal(mediaItem, mediaIndex) {
  return {
    type: DISPLAY_MODAL,
    mediaItem,
    mediaIndex
  };
}

export function hideMediaModal() {
  return {
    type: HIDE_MODAL
  };
}

export function displayModalPreviousMedia() {
  return {
    type: DISPLAY_MODAL_PREVIOUS_MEDIUM
  };
}

export function displayModalNextMedia() {
  return {
    type: DISPLAY_MODAL_NEXT_MEDIUM
  };
}

export function favoriteMediaItem(tweetIdStr) {
  return {
    types: [
      FAVORITE_MEDIA_ITEM,
      FAVORITE_MEDIA_ITEM_SUCCESS,
      FAVORITE_MEDIA_ITEM_FAILED
    ],
    promise: (client) => client.post('/createFavoriteTweet', {
      data: {
        tweetIdStr
      }
    })
  };
}

export function unFavoriteMediaItem(tweetIdStr) {
  return {
    types: [
      UNFAVORITE_MEDIA_ITEM,
      UNFAVORITE_MEDIA_ITEM_SUCCESS,
      UNFAVORITE_MEDIA_ITEM_FAILED
    ],
    promise: (client) => client.post('/destroyFavoriteTweet', {
      data: {
        tweetIdStr
      }
    })
  };
}
