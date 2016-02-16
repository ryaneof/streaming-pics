const LOAD = 'StreamingPics/userProfile/LOAD';
const LOADED = 'StreamingPics/userProfile/LOADED';
const LOAD_FAILED = 'StreamingPics/userProfile/LOAD_FAILED';
const RESET = 'StreamingPics/userProfile/RESET';

const initialState = {
  profile: {},
  loading: false,
  error: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        profile: {},
        loading: true
      };
    case LOADED:
      return {
        profile: action.result,
        loading: false
      };
    case LOAD_FAILED:
      return {
        profile: {},
        loading: false,
        error: action.error
      };
    case RESET:
      return {
        profile: {},
        loading: true
      };
    default:
      return state;
  }
}

export function load(userInfo) {
  return {
    types: [
      LOAD,
      LOADED,
      LOAD_FAILED
    ],
    promise: (client) => client.post('/showUserProfile', {
      data: {
        screenName: userInfo.screenName
      }
    })
  };
}

export function reset() {
  return {
    type: RESET
  };
}
