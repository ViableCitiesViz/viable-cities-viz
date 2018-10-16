import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'd3';

function MatrixDetails({project}) {
  if (!project) return (<div className="matrix-details matrix-details--empty" />);

  const { title, organization, budget } = project;

  return (
    <div className="matrix-details">
      <h2>{title}</h2>
      <h3>{organization}</h3>
      <h4>{`${format(',')(budget.funded).replace(/,/g, ' ')} kr`}</h4>
    </div>
  );
}

MatrixDetails.propTypes = {
  project: PropTypes.shape({
    title: PropTypes.string,
    organization: PropTypes.string,
    budget: PropTypes.object
  })
};

export default MatrixDetails;