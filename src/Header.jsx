import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import './Header.css';

class Header extends Component {
  render() {
    const views = ['Map', 'Matrix', 'Partners']
    const viewLinks = views.map(view => {
      const viewMatch = this.props.location.pathname.includes(view.toLowerCase());
      const projectMatch = this.props.location.pathname.match(/\/project\/(\d+)/);
      return (
        <li key={view}
          className={`header-links__item ${viewMatch ? 'header-links__item--active' : ''}`}>
          <Link className="header-links__item-link" to={`/${view.toLowerCase() + (projectMatch !== null && view !== 'Partners' ? `/project/${projectMatch[1]}` : '')}`}>
            {view}
          </Link>
        </li>
      );
    });

    return (
      <div className="header">
        <div className="header-content">
          <div className="header-content__left">
            <ul className="header-links">
              {viewLinks}
            </ul>
          </div>
          <div className="header-content__right">
            <ul className="header-links">
              <li className="header-links__item"><button className="header-links__item-link" onClick={this.props.toggleAbout}>About</button></li>
              <li className="header-links__item header-links__item--primary"><a className="header-links__item-link" href="https://goo.gl/forms/bX9jxwEtvLveayls2" target="_blank">Lämna Feedback</a></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  toggleAbout: PropTypes.func.isRequired
};

export default withRouter(Header);
