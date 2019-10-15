import React, { Component } from "react";
import PropTypes from "prop-types";
import { DropdownList } from "react-widgets";
import { circleSizes } from "./MatrixUtility";
import "./MatrixCircleMenu.css";

class MatrixCircleMenu extends Component {
  /**
   * ALT POLYGONS FOR ARROWS:
   *  <polygon points={`${offset} ${r}, ${t + offset} ${r + t}, ${t + offset} ${r - t}`} />
   *  <polygon points={`${r * 2 - offset} ${r}, ${r * 2 - t - offset} ${r + t}, ${r * 2 - t - offset} ${r - t}`} />
   */

  render() {
    const r = 12;
    const t = 3;
    const offset = 2;

    return (
      <div className="matrix-circle-menu">
        <div
          className="matrix-circle-menu__svg-wrapper"
          style={{ width: r * 2 + 2, height: r * 2 + 2 }}
        >
          <svg width="100%" height="100%">
            <g transform="translate(1, 1)">
              <circle cx={r} cy={r} r={r} />
              <g
                transform={`translate(${r}, ${r})rotate(45)translate(${-r}, ${-r})`}
              >
                <line x1={offset} x2={r * 2 - offset} y1={r} y2={r} />
                <path
                  d={`M ${t + offset} ${r + t} L ${offset} ${r} L ${t +
                    offset} ${r - t}`}
                />
                <path
                  d={`M ${r * 2 - t - offset} ${r + t} L ${r * 2 -
                    offset} ${r} L ${r * 2 - t - offset} ${r - t}`}
                />
              </g>
            </g>
          </svg>
        </div>
        <div className="matrix-circle-menu__dropdown-wrapper">
          <DropdownList
            filter={false}
            data={Object.values(circleSizes)}
            valueField="key"
            textField="display"
            value={this.props.circleSize}
            onChange={this.props.updateCircleSize}
          />
        </div>
      </div>
    );
  }
}

MatrixCircleMenu.propTypes = {
  circleSize: PropTypes.object.isRequired,
  updateCircleSize: PropTypes.func.isRequired
};

export default MatrixCircleMenu;
