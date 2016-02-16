import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { setAppTitle } from 'redux/modules/appTitle';
import ga from 'react-ga';
import config from '../../config';
import Helmet from 'react-helmet';
import {
  TwitterMediaView,
  TwitterUserProfileView
} from 'components';

@connect(
  state => ({
    user: state.auth.user,
    location: state.router.location
  }),
  {
    setAppTitle
  }
)

export default class User extends Component {
  static propTypes = {
    user: PropTypes.object,
    setAppTitle: PropTypes.func,
    location: PropTypes.object,
    params: PropTypes.object
  };

  componentDidMount() {
    this.props.setAppTitle(`Media by @${ this.props.params.userScreenName }`);

    ga.initialize(config.gaTrackId);
    ga.pageview(`${ this.props.location.pathname }${ this.props.location.search }`);
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.params.userScreenName === nextProps.params.userScreenName) {
      return;
    }

    this.props.setAppTitle(`Media by @${ nextProps.params.userScreenName }`);
  }

  shouldComponentUpdate = (nextProps) => {
    const authChanged = (!nextProps.user || nextProps.user.username !== this.props.user.username);
    const screenNameChanged = (nextProps.params.userScreenName !== this.props.params.userScreenName);
    return (authChanged || screenNameChanged);
  }

  render = () => {
    const styles = require('./User.scss');
    const { user } = this.props;

    return (
      <div className={ styles.user }>
        <Helmet title={ `Media by @${ this.props.params.userScreenName }` } />
        { user &&
          <TwitterUserProfileView
            userScreenName={ this.props.params.userScreenName }
            highlight="tweets"
          />
        }
        { user &&
          <TwitterMediaView
            disconnectTrigger="disconnectUserStatuses"
            mediaInitTrigger="initUserTimelineStatuses"
            mediaInitedListener="userTimelineStatusesInited"
            previousMediaLoadTrigger="loadPreviousUserTimelineStatuses"
            previousMediaLoadedListener="previousUserTimelineStatusesLoaded"
            mediaViewParams={{
              userScreenName: this.props.params.userScreenName
            }}
          />
        }
      </div>
    );
  }
}
