import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { SVGIcon } from 'components';
import {
  displayMediaModal
} from 'redux/modules/media';

@connect(
  state => ({
    media: state.media
  }),
  {
    displayMediaModal
  }
)

export default class TwitterMediaItem extends Component {
  static propTypes = {
    mediaItem: PropTypes.object,
    mediaIndex: PropTypes.number,
    displayMediaModal: PropTypes.func
  }

  handleOpenUserRoute = (event) => {
    event.stopPropagation();
  }

  handleClickMediaItem = (event) => {
    event.stopPropagation();
    event.preventDefault();
    this.props.displayMediaModal(this.props.mediaItem, this.props.mediaIndex);
  }

  render() {
    const { mediaItem } = this.props;
    const styles = require('./TwitterMediaItem.scss');
    const style = {
      backgroundImage: `url("${ mediaItem.mediumURL }")`
    };

    return (
      <div
        className={ styles.twitterMediaItem + ' twitterMediaListItem' }
        style={ style }
        onClick={ this.handleClickMediaItem }
      >
        <div className={ styles.twitterMediaItemOverlay }>
          <p className={ styles.twitterMediaItemTip }>
            <Link
              className={ styles.twitterMediaItemUserLink }
              to={ `/${ mediaItem.userScreenName }` }
              onClick={ this.handleOpenUserRoute }
            >
              <img src={ mediaItem.userProfileImageURL } />
              <span>{ mediaItem.userName }</span>
            </Link>
            <span className={ styles.twitterMediaItemFavoriteCount }>
              <SVGIcon iconName="like" iconClass="iconLike" />
              { mediaItem.favoriteCount }
            </span>
          </p>
        </div>
      </div>
    );
  }
}
