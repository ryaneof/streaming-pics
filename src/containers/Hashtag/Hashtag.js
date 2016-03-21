import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ga from 'react-ga';
// import config from '../../config';
import Helmet from 'react-helmet';
import { setAppTitle } from 'redux/modules/appTitle';
import { TwitterMediaView } from 'components';

@connect(
  state => ({
    user: state.auth.user,
    location: state.routing.location
  }),
  {
    setAppTitle
  }
)

export default class Hashtag extends Component {
  static propTypes = {
    user: PropTypes.object,
    location: PropTypes.object,
    setAppTitle: PropTypes.func.isRequired,
    params: PropTypes.object
  };

  componentDidMount = () => {
    this.props.setAppTitle('Hashtag');

    ga.pageview(`${ this.props.location.pathname }${ this.props.location.search }`);
  }

  render = () => {
    const styles = require('./Hashtag.scss');
    const { user } = this.props;
    const { hashtag } = this.props.params;

    return (
      <div className={ styles.hashtag }>
        <Helmet title="Hashtag" />
        { user &&
          <TwitterMediaView
            deleteMessageReceivedListener="searchStreamDeletedMessage"
            disconnectTrigger="disconnectSearchStream"
            mediaInitTrigger="getSearchStream"
            mediaInitedListener="searchStreamSetSearchTimeline"
            newMediaReceivedListener="searchStreamGotNewTweetMedia"
            previousMediaLoadTrigger="loadPreviousSearchTimelineStatus"
            previousMediaLoadedListener="previousSearchTimelineStatusesLoaded"
            mediaViewParams={{
              hashtag
            }}
          />
        }
      </div>
    );
  }
}
