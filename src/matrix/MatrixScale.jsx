import React from 'react';
import { format } from 'd3';
import PropTypes from 'prop-types';
import { circleRadius } from './MatrixUtility';
import './MatrixScale.css';


function MatrixScale(props) {
  if (!props.scaleData) return (<div></div>);

  const labelNumbers = [];
  const circleRadii = [];

  labelNumbers[0] = Number.parseInt(props.scaleData.maxBudget).toPrecision(1);
  labelNumbers[1] = Number.parseInt(props.scaleData.maxBudget / 2).toPrecision(1);
  labelNumbers[2] = Number.parseInt(props.scaleData.maxBudget / 10).toPrecision(1);

  circleRadii[0] = circleRadius(labelNumbers[0]) * props.scaleData.rScale;
  circleRadii[1] = circleRadius(labelNumbers[1]) * props.scaleData.rScale;
  circleRadii[2] = circleRadius(labelNumbers[2]) * props.scaleData.rScale;

  const margin = { top: 20, right: 10, bottom: 10, left: 20};
  const lineWidth = 10;
  const labelWidth = 60; // hard-coded approximation of label width for centering

  return (
    <div className="matrix-scale" style={{width: circleRadii[0] * 2 + margin.left + margin.right + lineWidth + labelWidth}}>
      <div className="matrix-scale__labels" style={{paddingTop: margin.top, paddingLeft: margin.left}}>
        <div className="matrix-scale__label"
          style={{left: circleRadii[0] + margin.left, top: 0 + margin.top}}
        >
          <div className="matrix-scale__label-line" style={{width: circleRadii[0] + lineWidth}} />
          <span className="matrix-scale__label-text">{`${format(',')(labelNumbers[0]).replace(/,/g, ' ')} kr`}</span>
        </div>
        <div className="matrix-scale__label"
          style={{left: circleRadii[0] + margin.left, top: circleRadii[0] * 2 - circleRadii[1] * 2 + margin.top}}
        >
          <div className="matrix-scale__label-line" style={{width: circleRadii[0] + lineWidth}} />
          <span className="matrix-scale__label-text">{`${format(',')(labelNumbers[1]).replace(/,/g, ' ')} kr`}</span>
        </div>
        <div className="matrix-scale__label"
          style={{left: circleRadii[0] + circleRadii[2] + margin.left, top: circleRadii[0] * 2 - circleRadii[2] + margin.top}}
        >
          <div className="matrix-scale__label-line" style={{width: circleRadii[0] + lineWidth - circleRadii[2]}} />
          <span className="matrix-scale__label-text">{`${format(',')(labelNumbers[2]).replace(/,/g, ' ')} kr`}</span>
        </div>
      </div>
      <svg height={circleRadii[0] * 2 + margin.top + margin.bottom} width={circleRadii[0] * 2 + margin.left + margin.right}>
        <circle
          r={circleRadii[0]}
          cx={circleRadii[0] + margin.left}
          cy={circleRadii[0] + margin.top}
        />
        <circle
          r={circleRadii[1]}
          cx={circleRadii[0] + margin.left}
          cy={circleRadii[0] * 2 - circleRadii[1] + margin.top}
        />
        <circle
          r={circleRadii[2]}
          cx={circleRadii[0] + margin.left}
          cy={circleRadii[0] * 2 - circleRadii[2] + margin.top}
        />
      </svg>
    </div>
  );
}

MatrixScale.propTypes = {
  scaleData: PropTypes.shape({
    rScale: PropTypes.number,
    minBudget: PropTypes.number,
    maxBudget: PropTypes.number
  })
};

export default MatrixScale;