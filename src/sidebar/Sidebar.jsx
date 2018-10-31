import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Sidebar.css';

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      location: null
    };

    this.locations = new Set()
    props.data.data.forEach(d => this.locations.add(d.survey_answers.location));
    this.locations = Array.from(this.locations);
  }

  filter(locations) {
    console.dir(locations);
    return {data: this.props.data.data.filter((d) => {
      if (!locations.includes(d.survey_answers.location)) return false;

      return true;
    })};
  }

  render() {
    const locationOptions = this.locations.map(location => (
      <option value={location} key={location}>{location}</option>
    ));

    return (
      <div className="sidebar">
        <select onChange={(event) => this.props.updateFilteredData(this.filter([event.target.value]))}>
          <option value="" />
          {locationOptions}
        </select>
      </div>
    );
  }
}

Sidebar.propTypes = {
  data: PropTypes.object.isRequired,
  updateFilteredData: PropTypes.func.isRequired
};

export default Sidebar;
