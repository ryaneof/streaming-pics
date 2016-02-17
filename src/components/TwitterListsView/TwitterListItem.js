import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';

@connect(
  state => ({
    lists: state.lists
  }),
  {
    pushState: routeActions.push
  }
)

export default class TwitterListItem extends Component {
  static propTypes = {
    listItem: PropTypes.object,
    pushState: PropTypes.func
  }

  handleClickListItem = (event) => {
    const { listItem } = this.props;
    event.stopPropagation();
    event.preventDefault();
    this.props.pushState(`/${ listItem.ownerScreenName }/list/${ listItem.listSlug }`);
  }

  render() {
    const { listItem } = this.props;
    const styles = require('./TwitterListItem.scss');

    return (
      <div className={ styles.twitterListItem } onClick={ this.handleClickListItem }>
        <div className={ styles.twitterListItemNameContainer }>
          <p className={ styles.twitterListItemLinkToList }>
            <Link to={ `/${ listItem.ownerScreenName }/list/${ listItem.listSlug }` }>{ listItem.listName }</Link>
          </p>
          <p className={ styles.twitterListItemFullName }>
            { `@${ listItem.ownerScreenName }/${ listItem.listSlug }` }
          </p>
        </div>
        <div className={ styles.twitterListItemMetaContainer }>
          <p className={ styles.twitterListItemLinkToUser }>
            <Link to={ `/${ listItem.ownerScreenName }` }>
              <img src={ listItem.ownerProfileImageURL } />
              <span>{ listItem.ownerName }</span>
            </Link>
          </p>
          <p className={ styles.twitterListItemMeta }>
            <span>
              <strong>{ listItem.memberCount }</strong>
              <small>Members</small>
            </span>
            <span>
              <strong>{ listItem.subscriberCount }</strong>
              <small>Subscribers</small>
            </span>
          </p>
        </div>
      </div>
    );
  }
}
