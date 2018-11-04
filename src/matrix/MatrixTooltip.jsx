import React from 'react';
import PropTypes from 'prop-types';
import './MatrixTooltip.css';

const topOffset = 10;

function MatrixTooltip({ hoveredProject, margin }) {
  if (!hoveredProject) return (<div className="matrix-tooltip" />);

  return (
    <div
      className="matrix-tooltip matrix-tooltip--visible"
      style={{
        top: hoveredProject.y + margin.top - hoveredProject.r - topOffset,
        left: hoveredProject.x + margin.left
      }}
    >
      {hoveredProject.survey_answers.project_title}
    </div>
  );
}

MatrixTooltip.propTypes = {
  hoveredProject: PropTypes.object,
  margin: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number
  }).isRequired
};

export default MatrixTooltip;
