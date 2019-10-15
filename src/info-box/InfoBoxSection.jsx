import React, { Component } from "react";
import PropTypes from "prop-types";
import { Spring, animated } from "react-spring";
import "./InfoBoxSection.css";

class InfoBoxSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      toggle: props.initToggle || false
    };
    this.onToggle = this.onToggle.bind(this);
  }

  onToggle() {
    this.setState(state => ({ toggle: !state.toggle }));
  }

  render() {
    return (
      <div
        className={`info-box-section ${
          this.state.toggle ? "info-box-section--toggled" : ""
        }`}
      >
        <div className="info-box-section__title" onClick={this.onToggle}>
          <span className="info-box-section__title-text">
            {this.props.title}
          </span>
          <span className="info-box-section__title-cross">+</span>
        </div>
        <Spring
          native
          from={{ height: this.state.toggle ? "auto" : 0 }}
          to={{ height: this.state.toggle ? "auto" : 0 }}
        >
          {props => (
            <animated.div className="info-box-section__content" style={props}>
              <div className="info-box-section__inner-content">
                {this.props.children}
              </div>
            </animated.div>
          )}
        </Spring>
      </div>
    );
  }
}

InfoBoxSection.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  initToggle: PropTypes.bool
};

export default InfoBoxSection;
