import React, { Component } from 'react';
import './App.css';
import Matrix from './matrix/Matrix';
import Sidebar from './sidebar/Sidebar';
import mockData from './matrix/mock-data-v4.json';


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filteredData: mockData,
    };

    this.updateFilteredData = this.updateFilteredData.bind(this);
  }

  updateFilteredData(newData) {
    this.setState({
      filteredData: newData
    });
  }

  render() {
    return (
      <div className="App">
        <Sidebar data={mockData} updateFilteredData={this.updateFilteredData} />
        <Matrix data={this.state.filteredData} />
      </div>
    );
  }
}

export default App;
