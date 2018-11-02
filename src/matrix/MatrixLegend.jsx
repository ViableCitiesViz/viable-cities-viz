import React from 'react';
import { projectTypes, projectTypeColors } from './MatrixUtility'
import './MatrixLegend.css';

function MatrixLegend() {
  let items = projectTypes.map(d => 
    <li key={d}>
      <div className="matrix-legend__box" style={{background: projectTypeColors(d)}} />
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

export default MatrixLegend;