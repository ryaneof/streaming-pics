const SET = 'StreamingPics/media/SET';
const RESET = 'StreamingPics/media/RESET';

const initialState = {
  current: ''
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET:
      return {
        current: action.appTitle
      };
    case RESET:
      return initialState;
    default:
      return state;
  }
}

export function setAppTitle(appTitle) {
  return {
    type: SET,
    appTitle
  };
}

export function resetAppTitle() {
  return {
    type: RESET
  };
}
