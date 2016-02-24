import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import ga from 'react-ga';
import { connect } from 'react-redux';

@connect(
  state => ({
    location: state.routing.location
  })
)

export default class About extends Component {

  static propTypes = {
    location: PropTypes.object
  };

  componentDidMount() {
    ga.pageview(`${ this.props.location.pathname }${ this.props.location.search }`);
  }

  render() {
    const styles = require('./About.scss');
    const logoImage = require('./logo-black-transparent.png');
    return (
      <div className="container">
        <Helmet title="About" />
        <div className={ styles.aboutPageWrapper }>
          <div className={ styles.aboutContentWrapper }>
            <p className={ styles.aboutLogoWrapper }>
              <img src={ logoImage } />
            </p>
            <p>
              Streaming Pics is built to make tracking media on Twitter more simple.
              To get started, you have to sign in with your Twitter account.
              We won't store any pictures or your Twitter information on our server.
              You can check out the source code any time.
            </p>
            <p>
              Streaming Pics is open source software, released under the
              <a href="https://github.com/ryaneof/streaming-pics/blob/master/LICENSE">GPL-2.0 License</a>. It is
              <a href="https://github.com/ryaneof/streaming-pics">hosted on GitHub</a>.
            </p>
            <p>Streaming Pics is still in beta. Here're some available features:</p>
            <ul>
              <li>Display media from authenticated user's timeline (realtime).</li>
              <li>Display media from posted or liked tweets by a Twitter user.</li>
              <li>Display media from tweets in a public Twitter list.</li>
              <li>Display media from others' retweeted or quoted tweets.</li>
              <li>Display photos from tweets which contain an Instagram photo link.</li>
              <li>Like & Unlike a tweet.</li>
              <li>Support images, GIFs and videos uploaded from Twitter official clients.</li>
            </ul>
            <p>
              If you have any questions, feel free to contact
              <a href="https://twitter.com/streamingpics">@streamingpics</a>
              on Twitter. Enjoy :D
            </p>
          </div>
        </div>
      </div>
    );
  }
}
