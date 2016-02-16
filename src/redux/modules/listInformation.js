const LOAD = 'StreamingPics/listInformation/LOAD';
const LOADED = 'StreamingPics/listInformation/LOADED';
const LOAD_FAILED = 'StreamingPics/listInformation/LOAD_FAILED';
const RESET = 'StreamingPics/listInformation/RESET';

const initialState = {
  listDetail: {},
  loading: false,
  error: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        listDetail: {},
        loading: true
      };
    case LOADED:
      return {
        listDetail: action.result,
        loading: false
      };
    case LOAD_FAILED:
      return {
        listDetail: {},
        loading: false,
        error: action.error
      };
    case RESET:
      return {
        listDetail: {},
        loading: true
      };
    default:
      return state;
  }
}

export function load(listInformationParams) {
  const { userScreenName, listSlug } = listInformationParams;
  return {
    types: [
      LOAD,
      LOADED,
      LOAD_FAILED
    ],
    promise: (client) => client.post('/showListInformation', {
      data: {
        userScreenName,
        listSlug
      }
    })
  };
}

export function reset() {
  return {
    type: RESET
  };
}
