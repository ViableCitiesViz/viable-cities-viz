import React, { Component } from 'react';
import { withRouter } from 'react-router';
import Filters from './filters/Filters';
import ColorLegend from './ColorLegend';
import ScaleLegend from './ScaleLegend';
import logo from './assets/images/Logo_ViableCities_240pxl.png';
import './Sidebar.css';

class Sidebar extends Component {
  render() {
    const noPartners = !this.props.location.pathname.includes('partners');

    return (
      <div className="sidebar">
        <div
          className="sidebar__top">
          <a href="http://viablecities.com/" target="_blank" rel="noopener noreferrer">
            <img className="sidebar__logo" src={logo} alt="Viable Cities" />
          </a>
          <div style={{ visibility: (noPartners ? 'visible' : 'hidden') }}>
            <Filters data={this.props.data} updateFilteredData={this.props.updateFilteredData} />
          </div>
        </div>
        <div className="sidebar__bottom">
          <ScaleLegend scaleData={this.props.scaleData} />
          <ColorLegend />
        </div>
      </div>
    );
  }
}

export default withRouter(Sidebar);
