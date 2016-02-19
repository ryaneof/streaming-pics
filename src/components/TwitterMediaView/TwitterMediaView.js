import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import { connect } from 'react-redux';
import {
  initMedia,
  initMediaFailed,
  initMediaArr,
  appendMedia,
  appendMediaArr,
  emptyMediaArr,
  unshiftMediaArr,
  removeFromMediaArr
} from 'redux/modules/media';
import { LoadingIcon } from 'components';
import TwitterMediaContainer from './TwitterMediaContainer';

@connect(
  state => ({
    media: state.media,
    locationPathName: state.routing.location.pathname
  }),
  {
    initMedia,
    initMediaFailed,
    initMediaArr,
    appendMedia,
    appendMediaArr,
    emptyMediaArr,
    unshiftMediaArr,
    removeFromMediaArr
  }
)

export default class TwitterMediaView extends Component {
  static propTypes = {
    mediaViewParams: PropTypes.object,
    deleteMessageReceivedListener: PropTypes.string,
    disconnectTrigger: PropTypes.string,
    mediaInitTrigger: PropTypes.string,
    mediaInitedListener: PropTypes.string,
    newMediaReceivedListener: PropTypes.string,
    previousMediaLoadTrigger: PropTypes.string,
    previousMediaLoadedListener: PropTypes.string,
    removeFromMediaArr: PropTypes.func.isRequired,
    media: PropTypes.object,
    locationPathName: PropTypes.string,
    initMedia: PropTypes.func.isRequired,
    initMediaFailed: PropTypes.func.isRequired,
    initMediaArr: PropTypes.func.isRequired,
    appendMedia: PropTypes.func.isRequired,
    appendMediaArr: PropTypes.func.isRequired,
    emptyMediaArr: PropTypes.func.isRequired,
    unshiftMediaArr: PropTypes.func.isRequired,
  };

  defaultProps = {
    mediaViewParams: {}
  };

  componentDidMount = () => {
    this.initSocketClient(this.props.mediaViewParams);
    this.initScrollListener();
  }

  componentWillReceiveProps = (nextProps) => {
    const currentMediaViewParams = this.props.mediaViewParams || {};
    const upcomingMediaViewParams = nextProps.mediaViewParams || {};
    const currentMediaViewParamsKeys = Object.keys(currentMediaViewParams);
    const upcomingMediaViewParamsKeys = Object.keys(upcomingMediaViewParams);
    const keysChanged = (currentMediaViewParamsKeys.length !== upcomingMediaViewParamsKeys.length);
    let paramsChanged = false;
    let mediaViewParamKey;

    for (mediaViewParamKey in upcomingMediaViewParams) {
      if (upcomingMediaViewParams[mediaViewParamKey] !== currentMediaViewParams[mediaViewParamKey]) {
        paramsChanged = true;
      }
    }

    if (!keysChanged && !paramsChanged) {
      return;
    }

    this.props.emptyMediaArr();
    this.loadPreviousMediaAttempt = 3;

    global.removeEventListener('scroll', this.handleScroll);

    if (this.socketClient) {
      this.socketClient.emit(this.props.disconnectTrigger);
      this.socketClient = null;
    }

    // console.log(this.props.mediaViewParams, nextProps.mediaViewParams);
    // console.log('init socket client, ', this.props.mediaViewParams, nextProps.mediaViewParams);

    this.initSocketClient(nextProps.mediaViewParams);
    this.initScrollListener();
  }

  shouldComponentUpdate = (nextProps) => {
    const upcomingMedia = nextProps.media;
    const currentMedia = this.props.media;
    const pathNameChanged = (this.props.locationPathName !== nextProps.locationPathName);
    const mediaArrChanged = (upcomingMedia.mediaArr.length !== currentMedia.mediaArr.length ||
      upcomingMedia.lastTweetId !== currentMedia.lastTweetId);
    const mediaStateChanged = (upcomingMedia.loading !== currentMedia.loading);
    const modalStateChanged = (upcomingMedia.showModal !== currentMedia.showModal);
    const modalMediaItemChanged = (upcomingMedia.showModal && currentMedia.showModal &&
      (upcomingMedia.modalMediaItem.mediumIdStr !== currentMedia.modalMediaItem.mediumIdStr ||
        upcomingMedia.modalMediaItem.tweetIdStr !== currentMedia.modalMediaItem.tweetIdStr));
    // console.log(pathNameChanged, mediaArrChanged, mediaStateChanged, modalStateChanged, modalMediaItemChanged);
    return (pathNameChanged || mediaArrChanged || mediaStateChanged || modalStateChanged || modalMediaItemChanged);
  }

  componentWillUnmount = () => {
    this.props.emptyMediaArr();

    if (this.socketClient) {
      this.socketClient.removeListener(this.props.mediaInitedListener, this.onMediaInited);
      this.socketClient.removeListener(this.props.previousMediaLoadedListener, this.onPreviousMediaLoaded);
      this.socketClient.removeListener(this.props.newMediaReceivedListener, this.onNewMediaReceived);
      this.socketClient.removeListener(this.props.deleteMessageReceivedListener, this.onDeletedMessageReceived);
      this.socketClient.emit(this.props.disconnectTrigger);

      global.removeEventListener('scroll', this.handleScroll);
      this.socketClient = null;
    }
  }

  onMediaInited = (data) => {
    // console.log('on media inited', data);

    if (data.error) {
      return this.props.initMediaFailed(data.error);
    }

    this.props.initMediaArr(data.media, data.lastTweetId);

    this.loadPreviousMediaIfNeeded(data.lastTweetId);
  }

  onNewMediaReceived = (data) => {
    this.props.unshiftMediaArr(data);
    // console.log('on received media', data);
  }

  onDeletedMessageReceived = (data) => {
    this.props.removeFromMediaArr(data.tweetIdStr);
  }

  onPreviousMediaLoaded = (data) => {
    const previousData = data || {};
    if (!previousData.media || previousData.media.length === 0 || !previousData.lastTweetId) {
      // console.log('previous null');
      this.props.appendMediaArr([], previousData.lastTweetId);
      return;
    }

    this.props.appendMediaArr(previousData.media, previousData.lastTweetId);
    this.loadPreviousMediaIfNeeded(previousData.lastTweetId);
  }

  loadPreviousMedia = (lastTweetId) => {
    this.props.appendMedia();
    this.socketClient.emit(this.props.previousMediaLoadTrigger, lastTweetId);
  }

  loadPreviousMediaIfNeeded = (lastTweetId) => {
    const elMediaContainer = ReactDOM.findDOMNode(this.refs.mediaContainer);
    const profileHeight = 200;

    // inited media tweets height is less than window height
    // load more to make the first screen look better
    if (this.loadPreviousMediaAttempt <= 0 || !lastTweetId || !elMediaContainer) {
      return;
    }

    this.loadPreviousMediaAttempt--;

    if (elMediaContainer.clientHeight + profileHeight < global.innerHeight) {
      setTimeout(() => {
        this.loadPreviousMedia(lastTweetId);
      }, 16);
    }
  }

  loadPreviousMediaAttempt = 3;

  handleScroll = () => {
    const scrollTop = document.body.scrollTop;
    const innerHeight = global.innerHeight;
    const scrollHeight = document.body.scrollHeight;
    const shouldLoadMoreDistanceToBottom = 40;
    const { media } = this.props;
    const { loading, lastTweetId } = media;

    if (loading || !lastTweetId) {
      // console.log('you scrolled but i\'m busy loading, just walk away please.');
      return;
    }

    if (scrollTop + innerHeight + shouldLoadMoreDistanceToBottom >= scrollHeight) {
      this.loadPreviousMedia(lastTweetId);
    }
  }

  initSocketClient = (mediaViewParams) => {
    this.props.initMedia();

    this.socketClient = io('', { path: '/ws', transports: ['polling'] });
    this.socketClient.on(this.props.mediaInitedListener, this.onMediaInited);
    this.socketClient.on(this.props.previousMediaLoadedListener, this.onPreviousMediaLoaded);
    this.socketClient.on(this.props.newMediaReceivedListener, this.onNewMediaReceived);
    this.socketClient.on(this.props.deleteMessageReceivedListener, this.onDeletedMessageReceived);

    this.socketClient.emit(this.props.mediaInitTrigger, mediaViewParams);
  }

  initScrollListener = () => {
    global.addEventListener('scroll', this.handleScroll);
  }

  render() {
    const styles = require('./TwitterMediaView.scss');
    const { media } = this.props;
    const { mediaArr, loading, error, showModal, modalMediaItem, modalMediaIndex } = media; // eslint-disable-line no-unused-vars

    return (
      <div>
        <div className="container" ref="mediaContainer">
          <TwitterMediaContainer
            mediaArr={ mediaArr }
            showModal={ showModal }
            modalMediaItem={ modalMediaItem }
            modalMediaIndex={ modalMediaIndex }
          />
        </div>
        <div className="container">
        { loading &&
          <div className={ styles.twitterMediaViewLoadingWrapper }>
            <LoadingIcon />
          </div>
        }
        { error &&
          <div className={ styles.twitterMediaViewErrorWrapper }>
            <p>{ error }</p>
          </div>
        }
        </div>
      </div>
    );
  }
}
