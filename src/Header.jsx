import React, { Component } from 'react';
import { Link } from "react-router-dom";
import './Header.css';

class Header extends Component {
  render() {
    return (
      <div className="header">
        <div className="header-content">
          <div className="header-content__left">
            <ul className="header-links">
              <li className="header-links__item"><Link to="/map">Map</Link></li>
              <li className="header-links__item header-links__item--active"><Link to="/matrix">Matrix</Link></li>
              <li className="header-links__item"><Link to="/partners">Partners</Link></li>
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

export default Header;
