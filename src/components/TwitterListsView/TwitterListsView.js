import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import {
  initLists,
  appendLists,
  resetLists
} from 'redux/modules/lists';
import { LoadingIcon } from 'components';
import TwitterListItem from './TwitterListItem';

@connect(
  state => ({
    lists: state.lists,
    locationPathName: state.router.location.pathname
  }),
  {
    initLists,
    appendLists,
    resetLists
  }
)

export default class TwitterListsView extends Component {
  static propTypes = {
    lists: PropTypes.object,
    userScreenName: PropTypes.string,
    listRelation: PropTypes.string,
    locationPathName: PropTypes.string,
    initLists: PropTypes.func,
    appendLists: PropTypes.func,
    resetLists: PropTypes.func
  }

  componentDidMount = () => {
    this.props.initLists(this.props.listRelation, {
      userScreenName: this.props.userScreenName,
      nextCursorStr: '-1'
    });
    this.initScrollListener();
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.userScreenName === nextProps.userScreenName &&
        this.props.listRelation === nextProps.listRelation) {
      return;
    }

    global.removeEventListener('scroll', this.handleScroll);

    this.props.resetLists();
    this.initScrollListener();

    this.props.initLists(nextProps.listRelation, {
      userScreenName: nextProps.userScreenName,
      nextCursorStr: '-1'
    });
  }

  shouldComponentUpdate = (nextProps) => {
    const upcomingLists = nextProps.lists;
    const currentLists = this.props.lists;
    const listsArrChanged = (upcomingLists.listsArr.length !== currentLists.listsArr.length);
    const listsStateChanged = (upcomingLists.loading !== currentLists.loading);
    return (listsArrChanged || listsStateChanged);
  }

  componentWillUnmount = () => {
    global.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll = () => {
    const scrollTop = document.body.scrollTop;
    const innerHeight = global.innerHeight;
    const scrollHeight = document.body.scrollHeight;
    const shouldLoadMoreDistanceToBottom = 40;
    const { lists, listRelation, userScreenName } = this.props;
    const { loading, nextCursorStr } = lists;

    if (loading || !nextCursorStr || nextCursorStr === '0') {
      // console.log('you scrolled but i\'m busy loading, just walk away please.');
      return;
    }

    if (scrollTop + innerHeight + shouldLoadMoreDistanceToBottom >= scrollHeight) {
      this.props.appendLists(listRelation, {
        userScreenName,
        nextCursorStr
      });
    }
  }

  initScrollListener = () => {
    global.addEventListener('scroll', this.handleScroll);
  }

  render() {
    const { userScreenName, listRelation, lists } = this.props;
    const { listsArr, loading, error, nextCursorStr } = lists; // eslint-disable-line no-unused-vars
    const styles = require('./TwitterListsView.scss');

    // console.log(lists);

    return (
      <div className="container">
        <ul className={ styles.twitterListsViewNavigation }>
          <li className={ listRelation === 'created' ? styles.highlight : '' }>
            <Link to={ `/${ userScreenName }/lists/created` }>
              Created
            </Link>
          </li>
          <li className={ listRelation === 'listed' ? styles.highlight : '' }>
            <Link to={ `/${ userScreenName }/lists/listed` }>
              Listed
            </Link>
          </li>
          <li className={ listRelation === 'subscribed' ? styles.highlight : '' }>
            <Link to={ `/${ userScreenName }/lists/subscribed` }>
              Subscribed
            </Link>
          </li>
        </ul>
        <div className={ styles.twitterListsViewContainer }>
        { listsArr.map((listItem) => {
          return (
            <TwitterListItem
              key={ `list-${ listItem.listIdStr }` }
              listItem={ listItem }
            />
          );
        })}
        </div>
        { loading &&
          <div className={ styles.twitterListsViewLoadingWrapper }>
            <LoadingIcon />
          </div>
        }
        { error &&
          <div className={ styles.twitterListsViewErrorWrapper }>
            <p>{ error }</p>
          </div>
        }
      </div>
    );
  }
}
