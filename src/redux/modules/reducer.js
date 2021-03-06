import { combineReducers } from 'redux';
import { routeReducer as routing } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-async-connect';
import { reducer as form } from 'redux-form';
import appTitle from './appTitle';
import auth from './auth';
import listInformation from './listInformation';
import lists from './lists';
import media from './media';
import tweetInformation from './tweetInformation';
import userProfile from './userProfile';

export default combineReducers({
  appTitle,
  auth,
  form,
  listInformation,
  lists,
  media,
  reduxAsyncConnect,
  routing,
  tweetInformation,
  userProfile
});
