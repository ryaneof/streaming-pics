import React, { Component, PropTypes } from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';
import ga from 'react-ga';
import Helmet from 'react-helmet';
import moment from 'moment';
import { SVGIcon } from 'components';
import {
  hideMediaModal,
  displayModalPreviousMedia,
  displayModalNextMedia,
  favoriteMediaItem,
  unFavoriteMediaItem
} from 'redux/modules/media';

@connect(
  state => ({
    media: state.media
  }),
  {
    hideMediaModal,
    displayModalPreviousMedia,
    displayModalNextMedia,
    favoriteMediaItem,
    unFavoriteMediaItem,
    pushState: routeActions.push
  }
)

export default class TwitterMediaModal extends Component {
  static propTypes = {
    mediaItem: PropTypes.object,
    mediaIndex: PropTypes.number,
    showModal: PropTypes.bool,
    hideMediaModal: PropTypes.func,
    displayModalPreviousMedia: PropTypes.func,
    displayModalNextMedia: PropTypes.func,
    favoriteMediaItem: PropTypes.func,
    unFavoriteMediaItem: PropTypes.func,
    pushState: PropTypes.func
  }

  componentDidMount() {
    global.addEventListener('keydown', this.handleKeydownEvent);
  }

  shouldComponentUpdate = (nextProps) => {
    const currentMediaItem = this.props.mediaItem;
    const upcomingMediaItem = nextProps.mediaItem;

    if ((currentMediaItem && !upcomingMediaItem) ||
        (!currentMediaItem && upcomingMediaItem)) {
      return true;
    }

    if (!currentMediaItem && !upcomingMediaItem) {
      return false;
    }

    return (currentMediaItem.tweetIdStr !== upcomingMediaItem.tweetIdStr ||
      currentMediaItem.mediumIdStr !== upcomingMediaItem.mediumIdStr ||
      currentMediaItem.isFavorited !== upcomingMediaItem.isFavorited ||
      currentMediaItem.favoriteCount !== upcomingMediaItem.favoriteCount);
  }

  componentDidUpdate = () => {
    const { mediaItem, mediaIndex } = this.props;

    if (global.history && mediaItem && mediaIndex >= 0) {
      this.historyOffset--;
      global.history.pushState(
        null,
        `Picture | @${ mediaItem.tweetIdStr }`,
        `/${ mediaItem.tweetUserScreenName }/status/${ mediaItem.tweetIdStr }/photo/${ mediaItem.mediumIdStr }`
      );

      ga.modalview(`/${ mediaItem.tweetUserScreenName }/status/${ mediaItem.tweetIdStr }/photo/${ mediaItem.mediumIdStr }`);
    }
  }

  componentWillUnmount() {
    global.removeEventListener('keydown', this.handleKeydownEvent);
  }

  historyOffset = 0;

  handleKeydownEvent = (event) => {
    const { keyCode } = event;

    switch (keyCode) {
      case 37:
        this.props.displayModalPreviousMedia();
        return;
      case 39:
        this.props.displayModalNextMedia();
        return;
      default:
        return;
    }
  }

  handleDisplayModalPreviousMedia = (event) => {
    event.stopPropagation();
    this.props.displayModalPreviousMedia();
  }

  handleDisplayModalNextsMedia = (event) => {
    event.stopPropagation();
    this.props.displayModalNextMedia();
  }

  handleOpenUserRoute = (event) => {
    const { mediaItem: { userScreenName }} = this.props;
    event.stopPropagation();
    event.preventDefault();

    if (global.history) {
      global.history.pushState(
        null,
        `Media by @${ userScreenName }`,
        `/${ userScreenName }`
      );
    }

    this.props.hideMediaModal();
    this.props.pushState(`/${ userScreenName }`);
  }

  handleClickedModalLikeIcon = (event) => {
    const { mediaItem: { isFavorited, tweetIdStr }} = this.props;
    event.stopPropagation();

    if (!isFavorited) {
      this.props.favoriteMediaItem(tweetIdStr);
    } else {
      this.props.unFavoriteMediaItem(tweetIdStr);
    }
  }

  close = () => {
    this.props.hideMediaModal();

    if (global.history) {
      global.history.go(this.historyOffset);
      this.historyOffset = 0;
    }
  }

  render() {
    const { mediaItem, mediaIndex } = this.props;

    if (!mediaItem || mediaIndex < 0) {
      return null;
    }

    const styles = require('./TwitterMediaModal.scss');
    const tweetCreatedTime = moment(mediaItem.tweetCreatedTime);
    const twitterMediaModalFavoriteClassName = mediaItem.isFavorited ?
    `${ styles.twitterMediaModalFavoriteCount } ${ styles.twitterFavoritedColor }` :
      styles.twitterMediaModalFavoriteCount;

    const modalImageWrapperStyle = global.innerHeight ? {
      minHeight: global.innerHeight * 0.86
    } : {};

    const videoStyle = global.innerHeight ? {
      maxHeight: global.innerHeight * 0.86 * 0.86
    } : {};

    return (
      <Modal className="modal-outer-close-button" show={ this.props.showModal } bsSize="large" onHide={ this.close }>
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body className={ styles.twitterMediaModalBody }>
          <Helmet title={ `Picture by @${ mediaItem.userScreenName }` }/>
          <div className={ styles.twitterMediaModalContent }>
            <div className={ styles.twitterMediaModalImageWrapper } style={ modalImageWrapperStyle }>
            { mediaItem.mediumType === 'animated_gif' &&
              <video ref="mediumAnimatedGIF" autoPlay loop muted style={ videoStyle }>
                <source src={ mediaItem.mediumVideoURL } type="video/mp4" />
              </video>
            }
            { mediaItem.mediumType === 'video' &&
              <video ref="mediumVideo" autoPlay controls style={ videoStyle }>
                <source src={ mediaItem.mediumVideoURL } type="video/mp4" />
              </video>
            }
            { !mediaItem.mediumVideoURL &&
              <img src={ mediaItem.mediumURL } />
            }
            </div>
            <div className={ styles.twitterMediaModalInfoWrapper } style={ modalImageWrapperStyle }>
              <div className={ styles.twitterMediaModalUserInfoWrapper }>
                <p className={ styles.twitterMediaModalUserAvatarWrapper }>
                  <img src={ mediaItem.userProfileImageURL } />
                </p>
                <p className={ styles.twitterMediaModalUserNameWrapper }>
                  <a href={ `/${ mediaItem.userScreenName }` } onClick={ this.handleOpenUserRoute }>
                    <span className={ styles.twitterMediaModalUserName }>{ mediaItem.userName }</span>
                  </a>
                  <span className={ styles.twitterMediaModalUserScreenName }>@{ mediaItem.userScreenName }</span>
                </p>
              </div>
              <p className={ styles.twitterMediaModalTweetText }>
                { mediaItem.tweetText }
              </p>
              <p className={ styles.twitterMediaModalTweetMeta }>
                <span className={ twitterMediaModalFavoriteClassName } onClick={ this.handleClickedModalLikeIcon }>
                  <SVGIcon
                    iconName={ mediaItem.isFavorited ? 'like-pink' : 'like-dark' }
                    iconClass="iconLike"
                  />
                  { mediaItem.favoriteCount }
                </span>
                <a
                  className={ styles.twitterMediaModalCreatedTime }
                  href={ mediaItem.tweetURL }
                  target="_blank"
                  title={ tweetCreatedTime.format('LL LTS') }
                >
                  { tweetCreatedTime.fromNow() }
                </a>
              </p>
              <p className={ styles.twitterMediaModalExternalLink }>
                <a
                  href={ mediaItem.mediumExternalURL }
                  target="_blank"
                >
                  <SVGIcon iconName={ mediaItem.mediumSource.toLowerCase() } iconClass={ `icon${ mediaItem.mediumSource }` } />
                  <span>View on <strong>{ mediaItem.mediumSource }</strong></span>
                </a>
              </p>
            </div>
          </div>
          <div className={ styles.twitterMediaModalPrev } onClick={ this.handleDisplayModalPreviousMedia }>
            <SVGIcon iconName="previous" iconClass="iconPrevious" />
          </div>
          <div className={ styles.twitterMediaModalNext } onClick={ this.handleDisplayModalNextsMedia }>
            <SVGIcon iconName="next" iconClass="iconNext" />
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
