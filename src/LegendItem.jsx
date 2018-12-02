import React from 'react';
import PropTypes from 'prop-types';
import './LegendItem.css';

function LegendItem({ text, color }) {
  return (
    <div className="legend-item">
      <div className="legend-item__box" style={{background: color}} />
      <span className="legend-item__text">{text}</span>
    </div>
  );
}

LegendItem.propTypes = {
  text: PropTypes.string.isRequired,
  color: PropTypes.any.isRequired
}

export default LegendItem;
