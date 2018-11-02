import React, { Component } from 'react';
import Matrix from './matrix/Matrix';
import Filters from './filters/Filters';
import mockData from './data/mock-data-v5.json';
import './App.css';
import 'react-widgets/dist/css/react-widgets.css';


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filteredData: mockData,
      scaleData: null
    };

    this.updateFilteredData = this.updateFilteredData.bind(this);
    this.updateScaleData = this.updateScaleData.bind(this);
  }

  updateFilteredData(newData) {
    this.setState({
      filteredData: newData
    });
  }

  updateScaleData(newData) {
    this.setState({
      scaleData: newData
    });
  }

  render() {
    return (
      <div className="App">
        <Filters data={mockData} updateFilteredData={this.updateFilteredData} scaleData={this.state.scaleData} />
        <Matrix data={this.state.filteredData} updateScaleData={this.updateScaleData} />
      </div>
    );
  }
}

export default App;
