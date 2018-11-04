import React from 'react';
import { projectTypeColors } from './MatrixUtility'
import PropTypes from 'prop-types';
import './MatrixLegendItem.css';

function MatrixLegendItem({ type }) {
  return (
    <div className="matrix-legend-item">
      <div className="matrix-legend-item__box" style={{background: projectTypeColors(type)}} />
      <span className="matrix-legend-item__text">{type}</span>
    </div>
  );
}

MatrixLegendItem.propTypes = {
  type: PropTypes.string.isRequired
}

export default MatrixLegendItem;
