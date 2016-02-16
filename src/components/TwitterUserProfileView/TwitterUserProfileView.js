import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {
  load as loadUserProfile,
  reset as resetUserProfile
} from 'redux/modules/userProfile';
import TwitterUserProfile from './TwitterUserProfile';

@connect(
  state => ({
    profile: state.userProfile.profile
  }),
  {
    loadUserProfile,
    resetUserProfile
  }
)

export default class TwitterUserProfileView extends Component {
  static propTypes = {
    profile: PropTypes.object,
    highlight: PropTypes.string,
    userScreenName: PropTypes.string,
    loadUserProfile: PropTypes.func.isRequired,
    resetUserProfile: PropTypes.func.isRequired
  }

  componentDidMount = () => {
    this.props.loadUserProfile({
      screenName: this.props.userScreenName
    });
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.userScreenName === nextProps.userScreenName) {
      return;
    }

    this.props.loadUserProfile({
      screenName: nextProps.userScreenName
    });
  }

  shouldComponentUpdate = (nextProps) => {
    const profileChanged = (nextProps.profile.userScreenName !== this.props.profile.userScreenName);
    return profileChanged;
  }

  componentWillUnmount = () => {
    this.props.resetUserProfile();
  }

  render() {
    const { profile, highlight } = this.props;

    if (!profile) {
      return null;
    }

    return (
      <div className="container">
        <TwitterUserProfile
          profile={ profile }
          highlight={ highlight }
        />
      </div>
    );
  }
}
