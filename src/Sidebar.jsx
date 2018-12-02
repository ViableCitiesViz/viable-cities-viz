import React, { Component } from 'react';
import Filters from './filters/Filters';
import ColorLegend from './ColorLegend';
import ScaleLegend from './ScaleLegend';
import './Sidebar.css';

class Sidebar extends Component {
  render() {
    return (
      <div className="sidebar">
        <div className="sidebar__top">
          <Filters data={this.props.data} updateFilteredData={this.props.updateFilteredData} />
        </div>
        <div className="sidebar__bottom">
          <ScaleLegend scaleData={this.props.scaleData} />
          <ColorLegend />
        </div>
      </div>
    );
  }
}

export default Sidebar;
