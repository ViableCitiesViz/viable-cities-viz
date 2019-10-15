import React, { Component } from "react";
import PropTypes from "prop-types";
import { range } from "d3";
import { withRouter } from "react-router";
import { Transition, animated } from "react-spring";
import ColorLegendItem from "./ColorLegendItem";
import { projectTypes, projectTypeColors } from "./matrix/MatrixUtility";
import "./ColorLegend.css";

// NOTE: Hardcoded for now, but for prettier code these could be imported directly from Partners.jsx
const omrade_titles = {
  0: "Civilsamhälle",
  1: "Forskning",
  2: "Näringsliv",
  3: "Offentlig verksamhet"
};

const helix_colors = {
  0: "#007d91",
  1: "#EA9A00",
  2: "#00A389",
  3: "#97C28E"
};

function RouteColorLegend({ labels }) {
  let items = labels.map(label => (
    <li key={label.text}>
      <ColorLegendItem {...label} />
    </li>
  ));

  return (
    <div className="color-legend">
      <ul>{items}</ul>
    </div>
  );
}

RouteColorLegend.propTypes = {
  labels: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      color: PropTypes.any.isRequired
    })
  ).isRequired
};

class ColorLegend extends Component {
  constructor(props) {
    super(props);

    const mapLabels = [{ text: "Projekt", color: "#007d91" }]; // hard-coded
    const matrixLabels = projectTypes.map(type => ({
      text: type,
      color: projectTypeColors(type)
    }));
    const partnersLabels = range(4).map(i => ({
      text: omrade_titles[i],
      color: helix_colors[i]
    }));

    this.legends = {
      map: <RouteColorLegend labels={mapLabels} />,
      matrix: <RouteColorLegend labels={matrixLabels} />,
      partners: <RouteColorLegend labels={partnersLabels} />
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.location.pathname !== nextProps.location.pathname)
      return true;
    return false;
  }

  render() {
    const route = Object.keys(this.legends).find(route =>
      this.props.location.pathname.includes(route)
    );

    return (
      <Transition
        native
        items={route}
        from={{ height: 0, opacity: 0 }}
        enter={{ height: "auto", opacity: 1 }}
        leave={{ height: 0, opacity: 0 }}
      >
        {route =>
          route !== undefined &&
          (props => (
            <animated.div style={{ ...props }}>
              {this.legends[route]}
            </animated.div>
          ))
        }
      </Transition>
    );
  }
}

export default withRouter(ColorLegend);
