import React from 'react';
import { IndexRoute, Route } from 'react-router';
import {
  isLoaded as isAuthLoaded,
  load as loadAuth
} from 'redux/modules/auth';
import {
  About,
  App,
  Hashtag,
  Home,
  Landing,
  List,
  Lists,
  Tweet,
  User,
  UserLikes
} from 'containers';

export default (store) => {
  const requireSignedIn = (nextState, replace, cb) => {
    function checkAuth() {
      const { auth: { user }} = store.getState();
      if (!user) {
        replace('/');
      }
      cb();
    }

    if (!isAuthLoaded(store.getState())) {
      store.dispatch(loadAuth()).then(checkAuth);
    } else {
      checkAuth();
    }
  };

  return (
    <Route path="/" component={ App }>
      <IndexRoute component={ Landing } />
      <Route path="about" component={ About }/>

      { /* Routes requiring signed in */ }
      <Route onEnter={ requireSignedIn }>
        <Route path="home" component={ Home }/>
        <Route path="hashtag/:hashtag" component={ Hashtag } />
        <Route path=":userScreenName" component={ User } />
        <Route path=":userScreenName/likes" component={ UserLikes } />
        <Route path=":userScreenName/list/:listSlug" component={ List } />
        <Route path=":userScreenName/lists/:listRelation" component={ Lists } />
        <Route path=":userScreenName/status/:tweetIdStr" component={ Tweet } />
        <Route path=":userScreenName/status/:tweetIdStr/photo/:mediumIdStr" component={ Tweet } />
      </Route>
    </Route>
  );
};
