const INIT = 'StreamingPics/lists/INIT';
const INITED = 'StreamingPics/lists/INITED';
const INIT_FAILED = 'StreamingPics/lists/INIT_FAILED';
const RESET = 'StreamingPics/lists/RESET';
const APPEND = 'StreamingPics/lists/APPEND';
const PUSH = 'StreamingPics/lists/PUSH';
const APPEND_FAILED = 'StreamingPics/lists/APPEND_FAILED';

const initialState = {
  loading: true,
  listsArr: [],
  error: null,
  nextCursorStr: '-1'
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case INIT:
      return {
        ...state,
        listsArr: [],
        loading: true
      };
    case INITED:
      const initedResult = action.result || {};
      return {
        ...state,
        listsArr: initedResult.listsArr,
        nextCursorStr: initedResult.nextCursorStr,
        loading: false
      };
    case INIT_FAILED:
      return {
        ...state,
        listsArr: [],
        loading: false,
        error: action.error
      };
    case RESET:
      return {
        ...state,
        listsArr: [],
        nextCursorStr: '-1',
        loading: false
      };
    case APPEND:
      return {
        ...state,
        listsArr: state.listsArr,
        nextCursorStr: state.nextCursorStr,
        loading: true
      };
    case PUSH:
      const appendResult = action.result || {};
      return {
        ...state,
        listsArr: state.listsArr.concat(appendResult.listsArr),
        nextCursorStr: appendResult.nextCursorStr,
        loading: false
      };
    case APPEND_FAILED:
      return {
        ...state,
        listsArr: state.listsArr,
        loading: false,
        nextCursorStr: state.nextCursorStr,
        error: action.error
      };
    default:
      return state;
  }
}

export function initLists(listRelation, listItemsParams) {
  return {
    types: [
      INIT,
      INITED,
      INIT_FAILED
    ],
    promise: (client) => client.post('/loadListItems', {
      data: {
        listRelation: listRelation,
        userScreenName: listItemsParams.userScreenName,
        nextCursorStr: listItemsParams.nextCursorStr
      }
    })
  };
}

export function resetLists() {
  return {
    type: RESET
  };
}

export function appendLists(listRelation, listItemsParams) {
  return {
    types: [
      APPEND,
      PUSH,
      APPEND_FAILED
    ],
    promise: (client) => client.post('/loadListItems', {
      data: {
        listRelation: listRelation,
        userScreenName: listItemsParams.userScreenName,
        nextCursorStr: listItemsParams.nextCursorStr
      }
    })
  };
}
