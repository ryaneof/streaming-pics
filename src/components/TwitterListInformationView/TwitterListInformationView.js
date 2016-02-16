import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import {
  load as loadListInformation,
  reset as resetListInformation
} from 'redux/modules/listInformation';

@connect(
  state => ({
    listDetail: state.listInformation.listDetail
  }),
  {
    loadListInformation,
    resetListInformation
  }
)

export default class TwitterListInformationView extends Component {
  static propTypes = {
    listDetail: PropTypes.object,
    highlight: PropTypes.string,
    userScreenName: PropTypes.string,
    listSlug: PropTypes.string,
    loadListInformation: PropTypes.func.isRequired,
    resetListInformation: PropTypes.func.isRequired
  }

  componentDidMount = () => {
    this.props.loadListInformation({
      userScreenName: this.props.userScreenName,
      listSlug: this.props.listSlug
    });
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.userScreenName === nextProps.userScreenName &&
        this.props.listSlug === nextProps.listSlug) {
      return;
    }

    this.props.loadListInformation({
      userScreenName: nextProps.userScreenName,
      listSlug: nextProps.listSlug
    });
  }

  shouldComponentUpdate = (nextProps) => {
    const userScreenNameChanged = (nextProps.listDetail.userScreenName !== this.props.listDetail.userScreenName);
    const listSlugChanged = (nextProps.listDetail.listSlug !== this.props.listDetail.listSlug);
    return (userScreenNameChanged || listSlugChanged);
  }

  componentWillUnmount = () => {
    this.props.resetListInformation();
  }

  render() {
    const styles = require('./TwitterListInformationView.scss');
    const { listDetail, highlight } = this.props;

    if (!listDetail.userName) {
      return (
        <div className="container">
          <div className={ styles.twitterListInformation }></div>
        </div>
      );
    }

    return (
      <div className="container">
        <div className={ styles.twitterListInformation }>
          <p className={ styles.twitterListInformationOwner }>
            <span>{ `${ listDetail.listMode } list by` }</span>
            <Link to={ `/${ listDetail.userScreenName }` }>
              <img src={ listDetail.userProfileImageURL } />
              <strong>{ listDetail.userName }</strong>
            </Link>
          </p>
          <p className={ styles.twitterListInformationName }>
            { listDetail.listName }
          </p>
          <p className={ styles.twitterListInformationFullName }>
            <span>{ `@${ listDetail.userScreenName }/${ listDetail.listSlug }` }</span>
          </p>
          <p className={ styles.twitterListInformationMeta }>
            <span className={ highlight === 'subscribers' ? styles.highlight : '' }>
              <strong>{ listDetail.subscriberCount }</strong>
              <small>Subscribers</small>
            </span>
            <span className={ highlight === 'members' ? styles.highlight : '' }>
              <strong>{ listDetail.memberCount }</strong>
              <small>Members</small>
            </span>
          </p>
        </div>
      </div>
    );
  }
}
