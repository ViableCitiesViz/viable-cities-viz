import React from 'react';
import PropTypes from 'prop-types';
import './ColorLegendItem.css';

function ColorLegendItem({ text, color }) {
  return (
    <div className="color-legend-item">
      <div className="color-legend-item__box" style={{background: color}} />
      <span className="color-legend-item__text">{text}</span>
    </div>
  );
}

ColorLegendItem.propTypes = {
  text: PropTypes.string.isRequired,
  color: PropTypes.any.isRequired
}

export default ColorLegendItem;
