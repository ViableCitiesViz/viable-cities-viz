import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { format } from 'd3';
import './InfoBox.css';
import MatrixLegendItem from '../matrix/MatrixLegendItem';
import InfoBoxSection from './InfoBoxSection';
import projectImages from './projectImages';

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
      project_id,
      budget,
      project_manager,
      dates,
      keywords,
      other_financiers,
      other_recipients,
      description,
      project_type,
      locations
    } = project.survey_answers;

    const partners = [...new Set([...other_financiers, ...other_recipients])].sort();

    const views = {
      Map: `/map/project/${project_id}`,
      Matrix: `/matrix/project/${project_id}`,
      Partners: `/partners/project/${project_id}`,
    }

    const vizViews = Object.keys(views).map(view => {
      const pathname = views[view];
      const match = pathname === this.props.location.pathname;
      return (
        <Link
          key={view}
          to={pathname}
          className={`info-box__view-link ${match ? 'info-box__view-link--active' : ''}`}>
          {view}
        </Link>
      );
    });

    return (
      <div className="info-box">
        <div className="info-box__splash" style={{ backgroundImage: `url(${projectImages[project_id]})` }} />
        <div className="info-box__content">
          <h2 className="info-box__title">{project_title}</h2>
          <h3 className="info-box__subtitle">{locations.join(', ')}</h3>
          <div>
            <InfoBoxSection title="Generell Information" initToggle={true}>
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

              </dl>
            </InfoBoxSection>

            <InfoBoxSection title="Nyckelord">
              <p>
                {keywords.join(', ')}
              </p>
            </InfoBoxSection>

            <InfoBoxSection title="Partners">
              <p>
                {partners.join(', ')}
              </p>
            </InfoBoxSection>

            <InfoBoxSection title="Beskrivning">
              <p>
              {description.split('\n').map((item, key) => {
                return <Fragment key={key}>{item}<br/></Fragment>
              })}
            </p>
            </InfoBoxSection>
          </div>

          <div className="info-box__views">
            {vizViews}
          </div>
        </div>
      </div>
    );
  }
}

InfoBox.propTypes = {
  project: PropTypes.object
};

export default withRouter(InfoBox);