import React from 'react';
import { projectTypes } from './MatrixUtility'
import MatrixLegendItem from './MatrixLegendItem';
import './MatrixLegend.css';

function MatrixLegend() {
  let items = projectTypes.map(d => 
    <li key={d}>
      <MatrixLegendItem type={d} />
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