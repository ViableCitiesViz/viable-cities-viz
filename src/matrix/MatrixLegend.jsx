import React from 'react';
import PropTypes from 'prop-types';

function MatrixLegend({ domain, scale }) {
  console.dir(scale);

  let items = domain.map(d => 
    <li>
      <div className="legend-box" style={`background: ${scale(d)}`} />
      <span className="legend-text"></span>
    </li>
  );

  return (
    <div>
      <ul>
        <li></li>
      </ul>
    </div>
  );
}

MatrixLegend.propTypes = {
  domain: PropTypes.arrayOf(PropTypes.number).isRequired,
  scale: PropTypes.func.isRequired
};

export default MatrixLegend;