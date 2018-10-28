import React, { Component } from 'react';
import { format } from 'd3';
import PropTypes from 'prop-types';
import './MatrixScale.css';


class MatrixScale extends Component {
  constructor(props) {
    super(props);

    this.data = null;
    this.labelNumbers = [];
    this.circleRadii = [];
  }

  render() {
    if (!this.props.data || !this.props.data.length) return (<div></div>);

    // this is ugly, but it should work
    if (this.props.data !== this.data) {
      this.data = this.props.data;

      const rScale = this.props.data[0].rScale;
      let minBudget = Number.MAX_VALUE;
      let maxBudget = 0;
      this.props.data.forEach(d => {
        minBudget = Math.min(minBudget, d.budget.funded);
        maxBudget = Math.max(maxBudget, d.budget.funded);
      });

      this.labelNumbers[0] = Number.parseInt(maxBudget).toPrecision(1);
      this.labelNumbers[1] = Number.parseInt(maxBudget / 2).toPrecision(1);
      this.labelNumbers[2] = Number.parseInt(maxBudget / 12).toPrecision(1);

      this.circleRadii[0] = Math.sqrt(this.labelNumbers[0] / Math.PI) * rScale;
      this.circleRadii[1] = Math.sqrt(this.labelNumbers[1] / Math.PI) * rScale;
      this.circleRadii[2] = Math.sqrt(this.labelNumbers[2] / Math.PI) * rScale;

      const max = format(",.1s")(maxBudget);

      console.log(`rScale: ${rScale}, min: ${maxBudget}, max: ${maxBudget}, formatted: ${max}`);
      console.log(`radius 1: ${this.circleRadii[0]}`);
    }

    const margin = { top: 20, right: 0, bottom: 0, left: 20};

    return (
      <div className="matrix-scale">
        <div className="matrix-scale__labels" style={{paddingTop: margin.top, paddingLeft: margin.left}}>
          <div className="matrix-scale__label"
            style={{left: this.circleRadii[0] + margin.left, top: 0 + margin.top}}
          >
            <div className="matrix-scale__label-line" />
            <span className="matrix-scale__label-text">{`${format(',')(this.labelNumbers[0]).replace(/,/g, ' ')} kr`}</span>
          </div>
          <div className="matrix-scale__label"
            style={{left: this.circleRadii[0] + margin.left, top: this.circleRadii[0] * 2 - this.circleRadii[1] * 2 + margin.top}}
          >
            <div className="matrix-scale__label-line" />
            <span className="matrix-scale__label-text">{`${format(',')(this.labelNumbers[1]).replace(/,/g, ' ')} kr`}</span>
          </div>
          <div className="matrix-scale__label"
            style={{left: this.circleRadii[0] + margin.left, top: this.circleRadii[0] * 2 + margin.top}}
          >
            <div className="matrix-scale__label-line" />
            <span className="matrix-scale__label-text">{`${format(',')(this.labelNumbers[2]).replace(/,/g, ' ')} kr`}</span>
          </div>
        </div>
        <svg>
          <circle
            r={this.circleRadii[0]}
            cx={this.circleRadii[0] + margin.left}
            cy={this.circleRadii[0] + margin.top}
          />
          <circle
            r={this.circleRadii[1]}
            cx={this.circleRadii[0] + margin.left}
            cy={this.circleRadii[0] * 2 - this.circleRadii[1] + margin.top}
          />
          <circle
            r={this.circleRadii[2]}
            cx={this.circleRadii[0] + margin.left}
            cy={this.circleRadii[0] * 2 - this.circleRadii[2] + margin.top}
          />
        </svg>
      </div>
    );
  }
}

MatrixScale.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object)
};

export default MatrixScale;