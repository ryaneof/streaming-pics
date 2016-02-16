import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export default class TwitterUserProfile extends Component {
  static propTypes = {
    profile: PropTypes.object,
    highlight: PropTypes.string
  }

  render() {
    const { profile, highlight } = this.props;
    const styles = require('./TwitterUserProfile.scss');

    if (!profile.userName) {
      return <div className={ styles.twitterUserProfile }></div>;
    }

    return (
      <div className={ styles.twitterUserProfile }>
        <p className={ styles.twitterUserProfileAvatar }>
          <img src={ profile.profileImageURL } />
        </p>
        <p className={ styles.twitterUserProfileName }>
          { profile.userName }
        </p>
        <p className={ styles.twitterUserScreenName }>
          <a href={ `https://twitter.com/${ profile.userScreenName }` } target="_blank">@{ profile.userScreenName }</a>
        </p>
        <p className={ styles.twitterUserProfileMeta }>
          <span className={ highlight === 'tweets' ? styles.highlight : '' }>
            <Link to={ `/${ profile.userScreenName }` }>
              <strong>{ profile.statusCount }</strong>
              <small>Tweets</small>
            </Link>
          </span>
          <span className={ highlight === 'following' ? styles.highlight : '' }>
            <strong>{ profile.followingCount }</strong>
            <small>Following</small>
          </span>
          <span className={ highlight === 'followers' ? styles.highlight : '' }>
            <strong>{ profile.followerCount }</strong>
            <small>Followers</small>
          </span>
          <span className={ highlight === 'likes' ? styles.highlight : '' }>
            <Link to={ `/${ profile.userScreenName }/likes` }>
              <strong>{ profile.favoriteCount }</strong>
              <small>Likes</small>
            </Link>
          </span>
          <span className={ highlight === 'listed' ? styles.highlight : '' }>
            <Link to={ `/${ profile.userScreenName }/lists/listed` }>
              <strong>{ profile.listedCount }</strong>
              <small>Listed</small>
            </Link>
          </span>
        </p>
      </div>
    );
  }
}
