import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { format } from "d3";
import "./InfoBox.css";
import ColorLegendItem from "../ColorLegendItem";
import InfoBoxSection from "./InfoBoxSection";
import projectImages from "./projectImages";
import { projectTypeColors } from "../matrix/MatrixUtility";

class InfoBox extends Component {
  constructor(props) {
    super(props);

    this.lastProject = null;
  }

  shouldComponentUpdate(nextProps) {
    if (
      nextProps.project !== this.props.project ||
      nextProps.location !== this.props.location
    )
      return true;
    return false;
  }

  decorateItems(stringList) {
    return stringList
      .map(str => (
        <span key={str} className="info-box__item-decoration">
          {str}
        </span>
      ))
      .reduce((acc, cur) => [acc, ", ", cur]);
  }

  render() {
    if (!this.props.project && !this.lastProject) return null;

    const project = this.props.project || this.lastProject;
    if (this.props.project !== null) this.lastProject = this.props.project;

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
      locations,
      link,
      website
    } = project.survey_answers;

    const partners = [
      ...new Set([...other_financiers, ...other_recipients])
    ].sort();

    const views = {
      Map: { link: `/map/project/${project_id}`, match: "/map" },
      Matrix: { link: `/matrix/project/${project_id}`, match: "/matrix" },
      Partners: { link: `/partners/project/${project_id}`, match: "/partners" }
    };

    const vizViews = Object.keys(views).map(viewName => {
      const view = views[viewName];
      const match = this.props.location.pathname.includes(view.match);
      return (
        <Link
          key={viewName}
          to={view.link}
          className={`info-box__view-link ${
            match ? "info-box__view-link--active" : ""
          }`}
        >
          {viewName}
        </Link>
      );
    });

    return (
      <div className="info-box">
        <div
          className="info-box__splash"
          style={{ backgroundImage: `url(${projectImages[project_id]})` }}
        />
        <div className="info-box__content">
          <div className="info-box__content-header">
            <h2 className="info-box__title">{project_title}</h2>
            <h3 className="info-box__subtitle">{locations.join(", ")}</h3>
          </div>
          <div>
            <InfoBoxSection title="Generell Information" initToggle={true}>
              <dl>
                <dt>Typ av projekt</dt>
                <dd>
                  <ColorLegendItem
                    text={project_type}
                    color={projectTypeColors(project_type)}
                  />
                </dd>

                <dt>Projektorganisation</dt>
                <dd>{project_organization}</dd>

                <dt>Projektledare</dt>
                <dd>{project_manager}</dd>

                <dt>Total projektbudget</dt>
                <dd>{`${format(",")(budget.total_cost).replace(
                  /,/g,
                  " "
                )} kr`}</dd>

                <dt>Sökt bidrag</dt>
                <dd>{`${format(",")(budget.funded).replace(/,/g, " ")} kr`}</dd>

                <dt>Projekttid</dt>
                <dd>{`${dates.start} - ${dates.end}`}</dd>

                <dt>Projektsida</dt>
                <dd>
                  <a href={link}>{link}</a>
                </dd>

                {website && (
                  <Fragment>
                    <dt>Hemsida</dt>
                    <dd>
                      <a href={website}>{website}</a>
                    </dd>
                  </Fragment>
                )}
              </dl>
            </InfoBoxSection>

            <InfoBoxSection title="Nyckelord">
              <p>{this.decorateItems(keywords)}</p>
            </InfoBoxSection>

            <InfoBoxSection title="Partners">
              <p>{this.decorateItems(partners)}</p>
            </InfoBoxSection>

            <InfoBoxSection title="Beskrivning">
              <p>
                {description.split("\n").map((item, key) => {
                  return (
                    <Fragment key={key}>
                      {item}
                      <br />
                    </Fragment>
                  );
                })}
              </p>
            </InfoBoxSection>
          </div>

          <div className="info-box__views">{vizViews}</div>
        </div>
      </div>
    );
  }
}

InfoBox.propTypes = {
  project: PropTypes.object
};

export default InfoBox;
