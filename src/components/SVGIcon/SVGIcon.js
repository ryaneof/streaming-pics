import React, { Component, PropTypes } from 'react';
import ReactIconSVGSymbol from 'react-icon-svg-symbol';

export default class SVGIcon extends Component {
  static propTypes = {
    iconName: PropTypes.string,
    iconClass: PropTypes.string
  }

  render() {
    const { iconName, iconClass } = this.props;
    const styles = require('./SVGIcon.scss');

    return (
      <span className={ styles.icon + ' ' + styles[iconClass] }>
        <ReactIconSVGSymbol
          symbolId={ `icon-${ iconName }` }
          fileURL="/icon-svg-symbol.svg"
        />
      </span>
    );
  }
}
