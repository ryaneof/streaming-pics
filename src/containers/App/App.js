import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { IndexLink } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import Helmet from 'react-helmet';
import { isLoaded as isAuthLoaded, load as loadAuth, signOut } from 'redux/modules/auth';
import { pushState } from 'redux-router';
import connectData from 'helpers/connectData';
import config from '../../config';

function fetchData(getState, dispatch) {
  const promises = [];
  if (!isAuthLoaded(getState())) {
    promises.push(dispatch(loadAuth()));
  }
  return Promise.all(promises);
}

@connectData(fetchData)
@connect(
  state => ({
    user: state.auth.user,
    appTitle: state.appTitle
  }),
  {
    signOut,
    pushState
  }
)

export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    user: PropTypes.object,
    appTitle: PropTypes.object,
    signOut: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  componentWillReceiveProps(nextProps) {
    if (!this.props.user && nextProps.user) {
      // signed in, redirect to home
      this.props.pushState(null, '/home');
    } else if (this.props.user && !nextProps.user) {
      // signed out, redirect to landing page
      this.props.pushState(null, '/');
    }
  }

  handleSignOut = (event) => {
    event.preventDefault();
    this.props.signOut();
  }

  render() {
    const { user } = this.props;
    const styles = require('./App.scss');

    return (
      <div className={ styles.app }>
        <Helmet { ...config.app.head }/>
        <p className={ styles.appTitle }>
          { this.props.appTitle.current }
        </p>
        <Navbar fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <IndexLink to="/" activeStyle={{ color: '#33e0ff' }}>
                <div className={ styles.brand }/>
              </IndexLink>
            </Navbar.Brand>
            <Navbar.Toggle/>
          </Navbar.Header>

          <Navbar.Collapse eventKey={0}>
          { !user &&
            <Nav navbar pullRight>
              <LinkContainer to="/about">
                <NavItem eventKey={1}>About</NavItem>
              </LinkContainer>
            </Nav>
          }
          { user &&
            <Nav navbar pullRight>
              <NavDropdown
                id="app-nav-profile-dropdown"
                title={ user.displayName }
                className={ styles.navDropdown }
                eventKey={1}
                style={{ 'backgroundImage': `url('${ user.profileImageURL }')` }}
              >
                <LinkContainer to={ `/${ user.username }` }>
                  <MenuItem eventKey={1.1}>Profile</MenuItem>
                </LinkContainer>
                <LinkContainer to={ `/${ user.username }/lists/created` }>
                  <MenuItem eventKey={1.2}>Lists</MenuItem>
                </LinkContainer>
                <MenuItem divider />
                <LinkContainer to={ `/about` }>
                  <MenuItem eventKey={1.4}>About</MenuItem>
                </LinkContainer>
                <MenuItem eventKey={1.4} onClick={ this.handleSignOut }>Sign Out</MenuItem>
              </NavDropdown>
            </Nav>
          }
          </Navbar.Collapse>
        </Navbar>

        <div className={ styles.appContent }>
          { this.props.children }
        </div>
      </div>
    );
  }
}
