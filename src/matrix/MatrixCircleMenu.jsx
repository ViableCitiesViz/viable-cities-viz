import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropdownList } from 'react-widgets'
import { circleSizes } from './MatrixUtility';
import './MatrixCircleMenu.css';

class MatrixCircleMenu extends Component {
  /**
   * ALT POLYGONS FOR ARROWS:
   *  <polygon points={`${offset} ${r}, ${t + offset} ${r + t}, ${t + offset} ${r - t}`} />
   *  <polygon points={`${r * 2 - offset} ${r}, ${r * 2 - t - offset} ${r + t}, ${r * 2 - t - offset} ${r - t}`} />
   */

  render() {
    const r = 10;
    const t = 3;
    const offset = 2;

    return (
      <div className="matrix-circle-menu">
        <svg width={r * 2 + 2} height={r * 2 + 2}>
          <circle cx={r + 1} cy={r + 1} r={r} />
          <line x1={offset + 1} x2={r * 2 - offset + 1} y1={r + 1} y2={r + 1} />
          <path d={`M ${t + offset + 1} ${r + t + 1} L ${offset + 1} ${r + 1} L ${t + offset + 1} ${r - t + 1}`} />
          <path d={`M ${r * 2 - t - offset + 1} ${r + t + 1} L ${r * 2 - offset + 1} ${r + 1} L ${r * 2 - t - offset + 1} ${r - t + 1}`} />
        </svg>
        <DropdownList
          filter={false}
          data={Object.keys(circleSizes)}
          value={this.props.circleSize}
          onChange={this.props.updateCircleSize} />
      </div>
    );
  }  
}

MatrixCircleMenu.propTypes = {
  circleSize: PropTypes.string.isRequired,
  updateCircleSize: PropTypes.func.isRequired
}

export default MatrixCircleMenu;
