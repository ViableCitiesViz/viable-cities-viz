import React, { Component } from 'react';
import Filters from './filters/Filters';
import Legend from './Legend';
import MatrixScale from './matrix/MatrixScale';
import './Sidebar.css';

class Sidebar extends Component {
  render() {
    return (
      <div className="sidebar">
        <div className="sidebar__top">
          <Filters data={this.props.data} updateFilteredData={this.props.updateFilteredData} scaleData={this.props.scaleData} />
        </div>
        <div className="sidebar__bottom">
          <MatrixScale scaleData={this.props.scaleData} />
          <Legend />
        </div>
      </div>
    );
  }
}

export default Sidebar;
