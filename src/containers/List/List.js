import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { setAppTitle } from 'redux/modules/appTitle';
import ga from 'react-ga';
import config from '../../config';
import Helmet from 'react-helmet';
import {
  TwitterMediaView,
  TwitterListInformationView
} from 'components';

@connect(
  state => ({
    user: state.auth.user,
    location: state.routing.location
  }),
  {
    setAppTitle
  }
)

export default class List extends Component {
  static propTypes = {
    user: PropTypes.object,
    setAppTitle: PropTypes.func,
    location: PropTypes.object,
    params: PropTypes.object
  };

  componentDidMount() {
    this.props.setAppTitle(`List: @${ this.props.params.userScreenName }/${ this.props.params.listSlug }`);

    ga.initialize(config.gaTrackId);
    ga.pageview(`${ this.props.location.pathname }${ this.props.location.search }`);
  }

  shouldComponentUpdate = (nextProps) => {
    const authChanged = (nextProps.user.username !== this.props.user.username);
    const screenNameChanged = (nextProps.params.userScreenName !== this.props.params.userScreenName);
    const listSlugChanged = (nextProps.params.listSlug !== this.props.params.listSlug);
    return (authChanged || screenNameChanged || listSlugChanged);
  }

  render = () => {
    const styles = require('./List.scss');
    const { user, params } = this.props;
    const { userScreenName, listSlug } = params;

    return (
      <div className={ styles.user }>
        <Helmet title={ `List: @${ userScreenName }/${ listSlug }` } />
        { user &&
          <TwitterListInformationView
            userScreenName={ userScreenName }
            listSlug={ listSlug }
          />
        }
        { user &&
          <TwitterMediaView
            disconnectTrigger="disconnectListStatuses"
            mediaInitTrigger="initListStatuses"
            mediaInitedListener="listStatusesInited"
            previousMediaLoadTrigger="loadPreviousListStatuses"
            previousMediaLoadedListener="previousListStatusesLoaded"
            mediaViewParams={{
              userScreenName,
              listSlug
            }}
          />
        }
      </div>
    );
  }
}
