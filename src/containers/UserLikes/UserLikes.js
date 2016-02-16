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

export default class UserLikes extends Component {
  static propTypes = {
    user: PropTypes.object,
    setAppTitle: PropTypes.func,
    location: PropTypes.object,
    params: PropTypes.object
  };

  componentDidMount() {
    this.props.setAppTitle(`Liked media by @${ this.props.params.userScreenName }`);

    ga.initialize(config.gaTrackId);
    ga.pageview(`${ this.props.location.pathname }${ this.props.location.search }`);
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.params.userScreenName === nextProps.params.userScreenName) {
      return;
    }

    this.props.setAppTitle(`Liked media by @${ nextProps.params.userScreenName }`);
  }

  shouldComponentUpdate = (nextProps) => {
    const authChanged = (nextProps.user.username !== this.props.user.username);
    const screenNameChanged = (nextProps.params.userScreenName !== this.props.params.userScreenName);
    return (authChanged || screenNameChanged);
  }

  render = () => {
    const styles = require('./UserLikes.scss');
    const { user } = this.props;

    return (
      <div className={ styles.user }>
        <Helmet title={ `Liked media by @${ this.props.params.userScreenName }` } />
        { user &&
          <TwitterUserProfileView
            userScreenName={ this.props.params.userScreenName }
            highlight="likes"
          />
        }
        { user &&
          <TwitterMediaView
            disconnectTrigger="disconnectFavoriteStatuses"
            mediaInitTrigger="initFavoriteStatuses"
            mediaInitedListener="favoriteStatusesInited"
            previousMediaLoadTrigger="loadPreviousFavoriteStatuses"
            previousMediaLoadedListener="previousFavoriteStatusesLoaded"
            mediaViewParams={{
              userScreenName: this.props.params.userScreenName
            }}
          />
        }
      </div>
    );
  }
}
