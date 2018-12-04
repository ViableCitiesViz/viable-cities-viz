import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Transition, animated } from 'react-spring';
import image1 from './assets/images/about/image1.png';
import image2 from './assets/images/about/image2.png';
import './About.css';

class About extends Component {
  render() {
    return (
      <Transition
        native
        items={this.props.about}
        from={{ background: 'rgba(0, 0, 0, 0)', opacity: 0, transform: 'translate(0, 50px)' }}
        enter={{ background: 'rgba(0, 0, 0, 0.5)', opacity: 1, transform: 'translate(0, 0)' }}
        leave={{ background: 'rgba(0, 0, 0, 0)', opacity: 0, transform: 'translate(0, 30px)' }}>
        {about => about && (props =>
          <animated.div
            className="about-bg"
            style={{ background: props.background }}
            onClick={(e) => e.target === e.currentTarget && this.props.about && this.props.toggleAbout()}>
            <animated.div
              className="about-content"
              style={{ opacity: props.opacity,
                transform: props.transform }}>
              <h1>
                About
              </h1>
              <small>
                ViableCitiesViz, version 0.7 beta [2018-12-04]
              </small>
              <p>
                This web interface is part of ongoing development to create a visualization tool for projects and impact assessment within Viable Cities, the Swedish Strategic Innovation programme for smart sustainable cities (<a href="https://viablecities.com/">viablecities.com</a>). 
              </p>
              <p>
                The data has been provided by Viable Cities; the Swedish Energy Agency; The Swedish Innovation Agency: and Formas. It includes information about signed contracts within the Viable Cities project portfolio. 
              </p>
              <p>
                ViableCitiesViz is an intermediate result from open source development within the strategic project Knowledge-sharing that develops 2017-2021. If you have questions regarding the data or are interested in beta-testing or a customization for your own organisation, please contact the project leader Charlie Gullström, KTH Viable Cities (<a href="mailto:charlie.gullstrom@viablecities.com">charlie.gullstrom@viablecities.com</a>) or Mario Romero, KTH Visualization Center (<a href="mailto:marior@kth.se">marior@kth.se</a>).
              </p>
              <p>
                The design and development team has consisted of: Jonas Beckman, Charlie Gullström, Tobias Hindersson, Alex Jonsson, Victor Kesten, Åsa Minoz, Mario Romero.
              </p>
              <p>
                This web interface is the intellectual property of Viable Cities, which claims copyright for the images presented herein. We kindly request that Viable Cities be acknowledged if pictures from this interface are quoted, copied, reproduced or distributed, refer to: <a href="https://viablecities.com/">viablecities.com</a>. 
              </p>
              <small>
                This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/3.0/deed.en_US">Creative Commons Attribution 3.0 Unported License</a>.
              </small>
              <p className="about-content__repo">
                <strong>GitHub repository:</strong><br/><a href="https://github.com/ViableCitiesViz/viablecitiesviz.github.io">ViableCitiesViz/viablecitiesviz.github.io</a>
              </p>
              <div className="about-content__images">
                <img src={image1} alt="Viable Cities logo" />
                <img src={image2} alt="Supporting organizations" />
              </div>
            </animated.div>
          </animated.div>
        )}
      </Transition>
    );
  }
}

About.propTypes = {
  about: PropTypes.bool.isRequired,
  toggleAbout: PropTypes.func.isRequired
};

export default About;
