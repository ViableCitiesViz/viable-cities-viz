import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './MatrixTooltip.css';

const topOffset = 10;

class MatrixTooltip extends Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.project !== this.props.project) return true;
    return false;
  }

  render() {
    if (!this.props.project) return null;

    return (
      <div
        className="matrix-tooltip"
        style={{
          top: this.props.project.y + this.props.margin.top - this.props.project.r - topOffset + this.props.offset.y,
          left: this.props.project.x + this.props.margin.left + this.props.offset.x
        }}>
        {this.props.project.survey_answers.project_title}
      </div>
    );
  }
}

MatrixTooltip.propTypes = {
  project: PropTypes.object,
  margin: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number
  }).isRequired,
  offset: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  }).isRequired
};

export default MatrixTooltip;
