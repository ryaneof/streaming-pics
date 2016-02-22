import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import moment from 'moment';
import { SVGIcon } from 'components';
import {
  displayMediaModal,
  favoriteMediaItem,
  unFavoriteMediaItem
} from 'redux/modules/media';

@connect(
  state => ({
    media: state.media
  }),
  {
    displayMediaModal,
    favoriteMediaItem,
    unFavoriteMediaItem
  }
)

export default class TwitterMediaItem extends Component {
  static propTypes = {
    mediaItem: PropTypes.object,
    mediaIndex: PropTypes.number,
    displayMediaModal: PropTypes.func,
    favoriteMediaItem: PropTypes.func,
    unFavoriteMediaItem: PropTypes.func
  }

  handleOpenUserRoute = (event) => {
    event.stopPropagation();
  }

  handleClickMediaItem = (event) => {
    event.stopPropagation();
    event.preventDefault();
    this.props.displayMediaModal(this.props.mediaItem, this.props.mediaIndex);
  }

  handleClickedLikeIcon = (event) => {
    const { mediaItem: { isFavorited, tweetIdStr }} = this.props;
    event.stopPropagation();

    if (!isFavorited) {
      this.props.favoriteMediaItem(tweetIdStr);
    } else {
      this.props.unFavoriteMediaItem(tweetIdStr);
    }
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
          { (['animated_gif', 'video'].indexOf(mediaItem.mediumType) > -1 ) &&
          <div className={ styles.twitterMediaItemPlayButton }>
            <SVGIcon iconName="play" iconClass="iconPlay" />
          </div>
          }
          <p className={ styles.twitterMediaItemTip }>
            <Link
              className={ styles.twitterMediaItemUserLink }
              to={ `/${ mediaItem.userScreenName }` }
              onClick={ this.handleOpenUserRoute }
            >
              <img src={ mediaItem.userProfileImageURL } />
              <span>{ mediaItem.userName }</span>
            </Link>
            <span className={ styles.twitterMediaItemFavoriteCount } onClick={ this.handleClickedLikeIcon }>
              <SVGIcon iconName={ mediaItem.isFavorited ? 'like-pink' : 'like' } iconClass="iconLike" />
              { mediaItem.favoriteCount }
            </span>
          </p>
        </div>
        { (mediaItem.mediumType === 'animated_gif') &&
        <div className={ styles.twitterMediaItemSpecialMediaType }>
          <p>
            <strong>GIF</strong>
          </p>
        </div>
        }
        { (mediaItem.mediumType === 'video') &&
        <div className={ styles.twitterMediaItemSpecialMediaType }>
          <p>
            <strong>VIDEO</strong>
            <span>{ `${ moment.utc(mediaItem.mediumVideoDurationMillis).format('mm:ss') }` }</span>
          </p>
        </div>
        }
      </div>
    );
  }
}
