import React, { Component } from 'react';
import Header from './Header';
import Matrix from './matrix/Matrix';
import Filters from './filters/Filters';
import mockData from './data/mock-data-v7.json';
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
        <Header />
        <div className="App__content">
          <Filters data={mockData} updateFilteredData={this.updateFilteredData} scaleData={this.state.scaleData} />
          <Matrix data={mockData} filteredData={this.state.filteredData} updateScaleData={this.updateScaleData} />
        </div>
      </div>
    );
  }
}

export default App;
