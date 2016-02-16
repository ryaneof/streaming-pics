const LOAD = 'StreamingPics/tweetInformation/LOAD';
const LOADED = 'StreamingPics/tweetInformation/LOADED';
const LOAD_FAILED = 'StreamingPics/tweetInformation/LOAD_FAILED';
const DISPLAY_PREVIOUS_MEDIUM = 'StreamingPics/tweetInformation/DISPLAY_PREVIOUS_MEDIUM';
const DISPLAY_NEXT_MEDIUM = 'StreamingPics/tweetInformation/DISPLAY_NEXT_MEDIUM';
const RESET = 'StreamingPics/tweetInformation/RESET';

const initialState = {
  tweet: {},
  loading: false,
  error: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        tweet: {},
        loading: true
      };
    case LOADED:
      return {
        tweet: action.result,
        loading: false
      };
    case LOAD_FAILED:
      return {
        tweet: {},
        loading: false,
        error: action.error
      };
    case DISPLAY_PREVIOUS_MEDIUM:
      const displayPreviousMediumTweet = state.tweet;
      const previousMediumIndex = displayPreviousMediumTweet.currentMediumIndex > 0 ? displayPreviousMediumTweet.currentMediumIndex - 1 : 0;
      displayPreviousMediumTweet.currentMediumIndex = previousMediumIndex;
      displayPreviousMediumTweet.currentMedium = displayPreviousMediumTweet.mediaArr[previousMediumIndex];

      return {
        tweet: displayPreviousMediumTweet,
        loading: false,
        error: null
      };
    case DISPLAY_NEXT_MEDIUM:
      const displayNextMediumTweet = state.tweet;
      const maxMediaIndex = displayNextMediumTweet.mediaArr.length - 1;
      const nextMediumIndex = displayNextMediumTweet.currentMediumIndex < maxMediaIndex ? displayNextMediumTweet.currentMediumIndex + 1 : maxMediaIndex;
      displayNextMediumTweet.currentMediumIndex = nextMediumIndex;
      displayNextMediumTweet.currentMedium = displayNextMediumTweet.mediaArr[nextMediumIndex];

      return {
        tweet: displayNextMediumTweet,
        loading: false,
        error: null
      };
    case RESET:
      return {
        tweet: {},
        loading: true
      };
    default:
      return state;
  }
}

export function load(tweetInformationParams) {
  const { tweetIdStr, mediumIdStr } = tweetInformationParams;
  return {
    types: [
      LOAD,
      LOADED,
      LOAD_FAILED
    ],
    promise: (client) => client.post('/showTweetDetail', {
      data: {
        tweetIdStr,
        mediumIdStr
      }
    })
  };
}

export function reset() {
  return {
    type: RESET
  };
}


export function displayPreviousMedium() {
  return {
    type: DISPLAY_PREVIOUS_MEDIUM
  };
}

export function displayNextMedium() {
  return {
    type: DISPLAY_NEXT_MEDIUM
  };
}
