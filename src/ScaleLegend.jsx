import React from 'react';
import PropTypes from 'prop-types';
import './ScaleLegend.css';

function ScaleLegend({ scaleData }) {
  if (!scaleData || !scaleData.length) return null;

  const margin = { top: 20, right: 10, bottom: 10, left: 20};
  const lineWidth = 10;
  const labelWidth = 60; // hard-coded approximation of label width for centering

  const labels = scaleData.map((circle, index) => {
    let left = scaleData[0].r + margin.left;
    let top = scaleData[0].r * 2 - circle.r * 2 + margin.top;
    let width = scaleData[0].r + lineWidth;

    if (index === scaleData.length - 1) {
      left += circle.r;
      top += circle.r;
      width -= circle.r;
    }

    return (
      <div className="scale-legend__label" key={circle.r} style={{left, top}}>
        <div className="scale-legend__label-line" style={{width}} />
        <span className="scale-legend__label-text">{circle.label}</span>
      </div>
    );
  });

  const circles = scaleData.map(circle => (
    <circle
      key={circle.r}
      r={circle.r}
      cx={scaleData[0].r + margin.left}
      cy={scaleData[0].r * 2 - circle.r + margin.top} />
  ));

  return (
    <div className="scale-legend" style={{width: scaleData[0].r * 2 + margin.left + margin.right + lineWidth + labelWidth}}>
      <div className="scale-legend__labels" style={{paddingTop: margin.top, paddingLeft: margin.left}}>
        {labels}
      </div>
      <svg height={scaleData[0].r * 2 + margin.top + margin.bottom} width={scaleData[0].r * 2 + margin.left + margin.right}>
        {circles}
      </svg>
    </div>
  );
}

ScaleLegend.propTypes = {
  scaleData: PropTypes.arrayOf(PropTypes.shape({
    r: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired
  }))
};

export default ScaleLegend;