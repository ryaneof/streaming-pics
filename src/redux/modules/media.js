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

const initialState = {
  loading: true,
  mediaArr: [],
  error: null,
  lastTweetId: null,
  showModal: false,
  modalMediaItem: null,
  modalMediaIndex: -1
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
      return {
        ...state,
        mediaArr: action.mediaArr.concat(state.mediaArr),
        lastTweetId: state.lastTweetId,
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

      const filteredMediaArrLastTweetId = (filteredMediaArr.length > 0) ? filteredMediaArr[filteredMediaArr.length - 1].tweetIdStr : null;

      return {
        ...state,
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
