import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
import Header from './Header';
import Matrix from './matrix/Matrix';
import Map from './map/Map';
import Partners from './partners/Partners'
import Filters from './filters/Filters';
import AnimatedInfoBox from './info-box/AnimatedInfoBox';
import { GetProjectId } from './ProjectNavigator';
import mockData from './assets/data/mock-data-v8.json';
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
      <Router basename={process.env.PUBLIC_URL}>
        <div className="App">
          <Header />
          <div className="App__content">
            <Filters data={mockData} updateFilteredData={this.updateFilteredData} scaleData={this.state.scaleData} />
            <Switch>
              <Route path="/" exact render={props => (
                <Redirect to="/matrix" />
              )}/>
              <Route path="/map" render={props => (
                <Map data={mockData} filteredData={this.state.filteredData} />
              )}/>
              <Route path="/matrix" render={props => (
                <Matrix data={mockData} filteredData={this.state.filteredData} updateScaleData={this.updateScaleData} />
              )}/>
              <Route path="/partners" render={props => (
                <Partners />
              )}/>
            </Switch>
            <Route render={props => (
              <AnimatedInfoBox
                data={mockData}
                id={Number.parseInt(GetProjectId(props.location))}/>
            )}/>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
