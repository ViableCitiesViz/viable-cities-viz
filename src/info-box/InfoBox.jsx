import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { format } from 'd3';
import './InfoBox.css';
import MatrixLegendItem from '../matrix/MatrixLegendItem';

class InfoBox extends Component {
  constructor(props) {
    super(props);

    this.lastProject = null;
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.project !== this.props.project) return true;
    return false;
  } 

  render() {
    if (!this.props.project && !this.lastProject) return null;

    const project = this.props.project || this.lastProject;
    if (this.props.project !== null)
      this.lastProject = this.props.project;

    const {
      project_title,
      project_organization,
      budget,
      project_manager,
      dates,
      keywords,
      //other_financiers,
      //other_recipients,
      description,
      project_type,
      location
    } = project.survey_answers;

    //const partners = [...new Set([...other_financiers, ...other_recipients])].sort();

    return (
      <div className="info-box">
        <h2 className="info-box__title">{project_title}</h2>
        <h3 className="info-box__subtitle">{location}</h3>
        <dl>
          <dt>Typ av projekt</dt>
          <dd>
            <MatrixLegendItem type={project_type} />
          </dd>

          <dt>Projektorganisation</dt>
          <dd>{project_organization}</dd>

          <dt>Projektledare</dt>
          <dd>{project_manager}</dd>

          <dt>Total projektbudget</dt>
          <dd>{`${format(',')(budget.total_cost).replace(/,/g, ' ')} kr`}</dd>

          <dt>Sökt bidrag</dt>
          <dd>{`${format(',')(budget.funded).replace(/,/g, ' ')} kr`}</dd>

          <dt>Projekttid</dt>
          <dd>{`${dates.start} - ${dates.end}`}</dd>

          <dt>Nyckelord</dt>
          <dd>{keywords.join(', ')}</dd>

          <dt>På kartan</dt>
          <dd><em>Klickbar länk/ikon till kartan</em></dd>
        </dl>
        <p>
          {description.split('\n').map((item, key) => {
            return <Fragment key={key}>{item}<br/></Fragment>
          })}
        </p>
      </div>
    );
  }
}

InfoBox.propTypes = {
  project: PropTypes.object
};

export default InfoBox;