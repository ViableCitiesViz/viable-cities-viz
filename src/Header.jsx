import React, { Component } from 'react';
import './Header.css';

class Header extends Component {
  render() {
    return (
      <div className="header">
        <div className="header-content">
          <div className="header-content__left">
            <ul className="header-links">
              <li className="header-links__item"><a href="#">Map</a></li>
              <li className="header-links__item header-links__item--active"><a href="#">Matrix</a></li>
              <li className="header-links__item"><a href="#">Partners</a></li>
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
