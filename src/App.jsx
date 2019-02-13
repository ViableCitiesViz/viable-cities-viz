import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
import Header from './Header';
import Matrix from './matrix/Matrix';
import Map from './map/Map';
import Partners from './partners/Partners'
import Sidebar from './Sidebar';
import About from './About';
import AnimatedInfoBox from './info-box/AnimatedInfoBox';
import { GetProjectId } from './ProjectNavigator';
import mockData from './assets/data/mock-data-v8.json';
import usePreloadImages from './usePreloadImages';
import './App.css';
import 'react-widgets/dist/css/react-widgets.css';

function App() {
  const [filteredData, setFilteredData] = useState(mockData);
  const [scaleData, setScaleData] = useState(null);
  const [about, setAbout] = useState(false);

  usePreloadImages();

  const updateFilteredData = newData => {
    setFilteredData(newData);
  }

  const updateScaleData = newData => {
    setScaleData(newData);
  }

  const toggleAbout = () => {
    setAbout(!about);
  }

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="App">
        <Header toggleAbout={toggleAbout} />
        <div className="App__content">
          <About toggleAbout={toggleAbout} about={about} />
          <Sidebar data={mockData} updateFilteredData={updateFilteredData} scaleData={scaleData} />
          <Switch>
            <Route path="/" exact render={props => (
              <Redirect to="/matrix" />
            )}/>
            <Route path="/map" render={props => (
              <Map data={mockData} filteredData={filteredData} updateScaleData={updateScaleData} />
            )}/>
            <Route path="/matrix" render={props => (
              <Matrix data={mockData} filteredData={filteredData} updateScaleData={updateScaleData} />
            )}/>
            <Route path="/partners" render={props => (
              <Partners updateScaleData={updateScaleData} />
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

export default App;
