import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ga from 'react-ga';
import config from '../../config';
import Helmet from 'react-helmet';
import { setAppTitle } from 'redux/modules/appTitle';
import { TwitterMediaView } from 'components';

@connect(
  state => ({
    user: state.auth.user,
    location: state.router.location
  }),
  {
    setAppTitle
  }
)

export default class Home extends Component {
  static propTypes = {
    user: PropTypes.object,
    location: PropTypes.object,
    setAppTitle: PropTypes.func.isRequired
  };

  componentDidMount = () => {
    this.props.setAppTitle('Home');

    ga.initialize(config.gaTrackId);
    ga.pageview(`${ this.props.location.pathname }${ this.props.location.search }`);
  }

  render = () => {
    const styles = require('./Home.scss');
    const { user } = this.props;

    return (
      <div className={ styles.home }>
        <Helmet title="Home" />
        { user &&
          <TwitterMediaView
            deleteMessageReceivedListener="userStreamDeletedMessage"
            disconnectTrigger="disconnectUserStream"
            mediaInitTrigger="getUserStream"
            mediaInitedListener="userStreamSetHomeTimeline"
            newMediaReceivedListener="userStreamGotNewTweetMedia"
            previousMediaLoadTrigger="loadPreviousHomeTimelineStatus"
            previousMediaLoadedListener="previousHomeTimelineStatusesLoaded"
          />
        }
      </div>
    );
  }
}
