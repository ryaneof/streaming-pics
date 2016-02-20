import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import ga from 'react-ga';
import { connect } from 'react-redux';
import config from '../../config';
import Helmet from 'react-helmet';
import {
  resetAppTitle
} from 'redux/modules/appTitle';
import { SVGIcon } from 'components';

@connect(
  state => ({
    user: state.auth.user,
    appTitle: state.appTitle,
    location: state.routing.location
  }),
  {
    resetAppTitle
  }
)

export default class Landing extends Component {
  static propTypes = {
    user: PropTypes.object,
    appTitle: PropTypes.object,
    location: PropTypes.object,
    resetAppTitle: PropTypes.func
  };

  componentDidMount() {
    const elLandingWrapper = ReactDOM.findDOMNode(this.refs.landingWrapper);

    elLandingWrapper.style.height = window.innerHeight.toString() + 'px';

    this.elVideo = ReactDOM.findDOMNode(this.refs.landingVideo);
    this.elVideo.addEventListener('timeupdate', this.onVideoTimeUpdate);

    this.props.resetAppTitle();

    ga.pageview(`${ this.props.location.pathname }${ this.props.location.search }`);
  }

  onVideoTimeUpdate = () => {
    if (this.elVideo.currentTime > 0) {
      this.elVideo.pause();
      this.elVideo.muted = false;
      this.elVideo.currentTime = 0;

      this.elVideo.removeEventListener('timeupdate', this.onVideoTimeUpdate);
      this.elVideo.addEventListener('progress', this.onVideoBufferProgress);
    }
  }

  onVideoBufferProgress = () => {
    if (Math.round(this.elVideo.buffered.end(0)) / Math.round(this.elVideo.seekable.end(0)) === 1) {
      this.elVideo.play();
      this.elVideo.removeEventListener('progress', this.onVideoBufferProgress);
    }
  }

  render() {
    const styles = require('./Landing.scss');
    return (
      <div className={ styles.landing }>
        <Helmet title="Home" />
        <div className={ styles.landingWrapper } ref="landingWrapper">
          <video className={ styles.landingVideo } ref="landingVideo" autoPlay loop muted>
            <source src="https://assets.streaming.pics/streaming-pics-preview.mp4" type="video/mp4" />
          </video>
          <div className={ styles.landingInfo }>
            <div className="container">
              <h1>Streaming Pics</h1>
              <h2>{ config.app.description }</h2>
              <p className={ styles.signInWithTwitterButton }>
                <a href="/api/auth/twitter">
                  <SVGIcon iconName="twitter" iconClass="iconTwitter" />
                  <span>Sign In With Twitter</span>
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="container">
        </div>
      </div>
    );
  }
}
