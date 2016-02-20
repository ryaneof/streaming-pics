import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { setAppTitle } from 'redux/modules/appTitle';
import ga from 'react-ga';
import Helmet from 'react-helmet';
import {
  TwitterListsView,
  TwitterUserProfileView
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

export default class Lists extends Component {
  static propTypes = {
    user: PropTypes.object,
    setAppTitle: PropTypes.func,
    location: PropTypes.object,
    params: PropTypes.object
  };

  componentDidMount() {
    this.props.setAppTitle(`Lists of @${ this.props.params.userScreenName }`);

    ga.pageview(`${ this.props.location.pathname }${ this.props.location.search }`);
  }

  shouldComponentUpdate = (nextProps) => {
    const authChanged = (nextProps.user.username !== this.props.user.username);
    const screenNameChanged = (nextProps.params.userScreenName !== this.props.params.userScreenName);
    const listRelationChanged = (nextProps.params.listRelation !== this.props.params.listRelation);
    return (authChanged || screenNameChanged || listRelationChanged);
  }

  componentDidUpdate() {
    ga.pageview(`${ this.props.location.pathname }${ this.props.location.search }`);
  }

  render = () => {
    const styles = require('./Lists.scss');
    const { user, params } = this.props;
    const { userScreenName, listRelation } = params;
    const highlight = (listRelation === 'listed') ? 'listed' : '';

    return (
      <div className={ styles.user }>
        <Helmet title={ `Lists of @${ userScreenName }` } />
        { user &&
          <TwitterUserProfileView
            userScreenName={ userScreenName }
            highlight={ highlight }
          />
        }
        { user &&
          <TwitterListsView
            userScreenName={ userScreenName }
            listRelation={ listRelation }
          />
        }
      </div>
    );
  }
}
