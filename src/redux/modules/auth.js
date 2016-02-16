const LOAD = 'StreamingPics/auth/LOAD';
const LOAD_SUCCESS = 'StreamingPics/auth/LOAD_SUCCESS';
const LOAD_FAIL = 'StreamingPics/auth/LOAD_FAIL';
const SIGN_OUT = 'StreamingPics/auth/SIGN_OUT';
const SIGN_OUT_SUCCESS = 'StreamingPics/auth/SIGN_OUT_SUCCESS';
const SIGN_OUT_FAIL = 'StreamingPics/auth/SIGN_OUT_FAIL';

const initialState = {
  loaded: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        user: action.result
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case SIGN_OUT:
      return {
        ...state,
        signingOut: true
      };
    case SIGN_OUT_SUCCESS:
      return {
        ...state,
        signingOut: false,
        user: null
      };
    case SIGN_OUT_FAIL:
      return {
        ...state,
        signingOut: false,
        signOutError: action.error
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.auth && globalState.auth.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/loadAuth')
  };
}

export function signOut() {
  return {
    types: [SIGN_OUT, SIGN_OUT_SUCCESS, SIGN_OUT_FAIL],
    promise: (client) => client.get('/signOut')
  };
}
