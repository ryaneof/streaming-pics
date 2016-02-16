import React, { Component } from 'react';
import ReactIconSVGSymbol from 'react-icon-svg-symbol';

export default class LoadingIcon extends Component {
  render() {
    const styles = require('./LoadingIcon.scss');

    return (
      <div className={ styles.loadingIconWrapper }>
        <div className={ styles.loadingIconInner }>
          <ReactIconSVGSymbol symbolId="icon-spinner" fileURL="/icon-svg-symbol.svg" />
        </div>
      </div>
    );
  }
}

