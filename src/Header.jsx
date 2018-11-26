import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import './Header.css';

class Header extends Component {
  render() {
    const views = ['Map', 'Matrix', 'Partners']
    const viewLinks = views.map(view => {
      const match = this.props.location.pathname.includes(view.toLowerCase());
      return (
        <li key={view}
          className={`header-links__item ${match ? 'header-links__item--active' : ''}`}>
          <Link to={`/${view.toLowerCase()}`}>
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
              <li className="header-links__item"><a href="#">About</a></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Header);
