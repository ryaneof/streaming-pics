import React, { Component, PropTypes } from 'react';
import TwitterMediaItem from './TwitterMediaItem';
import TwitterMediaModal from './TwitterMediaModal';

export default class TwitterMediaContainer extends Component {
  static propTypes = {
    mediaArr: PropTypes.array,
    showModal: PropTypes.bool,
    modalMediaItem: PropTypes.object,
    modalMediaIndex: PropTypes.number
  }

  render() {
    const { mediaArr } = this.props;
    const styles = require('./TwitterMediaContainer.scss');
    return (
      <div>
        <div className={ styles.twitterMediaWrapper }>
        { mediaArr.map((mediaItem, mediaIndex) => {
          return (
            <TwitterMediaItem
              key={ `tweet-${ mediaItem.tweetIdStr }-medium-${ mediaItem.mediumIdStr }` }
              mediaItem={ mediaItem }
              mediaIndex={ mediaIndex }
            />
          );
        })}
        </div>
        <TwitterMediaModal
          showModal={ this.props.showModal }
          mediaItem={ this.props.modalMediaItem }
          mediaIndex={ this.props.modalMediaIndex }
        />
      </div>
    );
  }
}
