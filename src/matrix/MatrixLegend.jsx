import React from 'react';
import PropTypes from 'prop-types';
import './MatrixLegend.css';

function MatrixLegend({ domain, scale }) {
  let items = domain.map(d => 
    <li key={d}>
      <div className="matrix-legend__box" style={{background: scale(d)}} />
      <span className="matrix-legend__text">{d}</span>
    </li>
  );

  return (
    <div className="matrix-legend">
      <ul>
        {items}
      </ul>
    </div>
  );
}

MatrixLegend.propTypes = {
  domain: PropTypes.arrayOf(PropTypes.string).isRequired,
  scale: PropTypes.func.isRequired
};

export default MatrixLegend;