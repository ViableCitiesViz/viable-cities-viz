import React, { Component } from 'react';
import { select, axisLeft, axisTop, scaleOrdinal, range, packSiblings, event, rgb } from 'd3';
import mockData from './mock-data-v2.json';
import MatrixDetails from './MatrixDetails';
import './Matrix.css';

const col2focus = {
  1: 'focus_lifestyle',
  2: 'focus_planning',
  3: 'focus_mobility',
  4: 'focus_infrastructure'
};

const theme2row = {
  testbeds: 1,
  innovation: 2,
  financing: 3,
  management: 4,
  intelligence: 5
};

const focusLabel = {
  1: 'Lifestyle and  Consumption',
  2: 'Planning and  Built Environment',
  3: 'Mobility and  Accessibility',
  4: 'Integrated  Infrastructure'
};

const themeLabel = {
  1: 'Testbeds and  Living Labs',
  2: 'Innovation and  Entrepreneurship',
  3: 'Financing and  Business Models',
  4: 'Governance',
  5: 'Intelligence, Security  and Ethics'
};

function packData(data, scaleX, scaleY) {
  // first, group together circles that are at the same position in the matrix
  const obj = {};
  for (let row = 1; row <= 5; ++row) {
    obj[row] = {};
    for (let col = 1; col <= 4; ++col) {
      obj[row][col] = [];
    }
  }
  data.data.forEach(project => {
    const pins = []; // so that a circle can find its buddies
    for (let col = 1; col <= 4; ++col) {
      project.survey_answers[col2focus[col]].forEach(theme => {
        pins.push({
          row: theme2row[theme],
          col
        });
        obj[theme2row[theme]][col].push({
          row: theme2row[theme],
          col,
          pins,
          id: project.survey_answers.project_id,
          title: project.survey_answers.project_title,
          type: project.survey_answers.project_type,
          organization: project.survey_answers.project_organization,
          budget: project.survey_answers.budget,
          r: Math.sqrt(project.survey_answers.budget.funded / Math.PI) * 0.015
        })
      });
    }
  });

  // pack them together, fix their position and return as a flat list
  const arr = [];
  for (let row = 1; row <= 5; ++row) {
    for (let col = 1; col <= 4; ++col) {
      packSiblings(obj[row][col]).forEach(pin => {
        arr.push({
          ...pin,
          x: pin.x + scaleX(col),
          y: pin.y + scaleY(row)
        })
      });
    }
  }
  return arr;
}

// inspired by https://bl.ocks.org/mbostock/7555321
// replaces double spaces in the labels with fake "newlines"
// (tspan elements) and fixes their positions
function parseNewLinesY(text) {
  text.each(function() {
    const text = select(this);
    const words = text.text().split(/ {2}/);
    const x = text.attr('x');
    const dy = parseFloat(text.attr('dy'));
    text.text(null);
    const lineHeight = 1.1; // em
    let i = 0;
    words.forEach(word => {
      text.append('tspan')
          .text(word)
          .attr('x', x)
          .attr('y', `-${(words.length - 1) * lineHeight / 2}em`)
          .attr('dy', `${dy + (i++ * lineHeight)}em`);
    });
  });
}
function parseNewLinesX(text) {
  text.each(function() {
    const text = select(this).attr('text-anchor', 'start');
    const words = text.text().split(/ {2}/);
    const y = text.attr('y');
    const dy = parseFloat(text.attr('dy'));
    text.text(null);
    const lineHeight = 1.1; // em
    let i = 0;
    words.forEach(word => {
      text.append('tspan')
          .text(word)
          .attr('x', 0)
          .attr('dy', `${dy + (i++ * lineHeight)}em`);
    });
    text.attr('transform', `translate(0,${y})rotate(-45)translate(0,${-y})`);
  });
}

export default class Matrix extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredProject: null,
      clickedProject: null
    };

    this.scaleType = scaleOrdinal()
        .range([rgb(0, 125, 145), rgb(151, 194, 142), rgb(234, 154, 0)]) // pms 3145, pms 2255, pms 2011
        .domain(['Forskningsprojekt', 'Innovationsprojekt', 'Förstudie']);
  }

  componentDidMount() {
    this.svg = select(this.svgRef);

    const margin = { top: 130, right: 0, bottom: 0, left: 150 };
    const width = +this.svg.attr("width") - margin.left - margin.right; // TODO, responsive?
    const height = +this.svg.attr("height") - margin.top - margin.bottom; // TODO, responsive?

    const scaleX = scaleOrdinal()
        .range(range(4).map(d => (1 + d) * width / 4 - width / 8))
        .domain([1, 2, 3, 4]);
    const scaleY = scaleOrdinal()
        .range(range(5).map(d => (1 + d) * height / 5 - height / 10))
        .domain([1, 2, 3, 4, 5]);

    // y-axis
    this.svg.append('g')
        .attr('transform', `translate(${width + margin.left}, ${margin.top})`)
        .call(axisLeft(scaleY)
            .tickSize(width)
            .tickPadding(10)
            .tickFormat(row => themeLabel[row]))
        .call(g => g.select('.domain').remove())
      .selectAll(".tick text")
        .call(parseNewLinesY);

    // themes label
    this.svg.append('text')
        .attr('transform', `translate(20, ${margin.top + height / 2})rotate(-90)`)
        .style('text-anchor', 'middle')
        .text('Themes');

    // x-axis
    this.svg.append('g')
        .attr('transform', `translate(${margin.left}, ${height + margin.top})`)
        .call(axisTop(scaleX)
            .tickSize(height)
            .tickPadding(20)
            .tickFormat(col => focusLabel[col]))
        .call(g => g.select('.domain').remove())
      .selectAll(".tick text")
        .call(parseNewLinesX);

    // focus areas label
    this.svg.append('text')
        .attr('transform', `translate(${margin.left + width / 2}, 20)`)
        .style('text-anchor', 'middle')
        .text('Focus areas');

    const packedData = packData(mockData, scaleX, scaleY);

    // make some circles
    this.circles = this.svg.append('g').classed('circles', true);
    const node = this.circles.selectAll('g')
      .data(packedData)
      .enter().append('g')
        .attr('transform', d => `translate(${d.x + margin.left},${d.y + margin.top})`);

    node.append("circle")
        .attr('r', d => d.r)
        .attr('data-id', d => d.id)
        .attr('data-row', d => d.row)
        .attr('data-col', d => d.col)
        .attr('fill', d => this.scaleType(d.type))
        .on('mouseover', d => this.setState({
          hoveredProject: d
        }))
        .on('mouseout', d => this.setState({
          hoveredProject: null
        }))
        .on('click', d => this.setState({
          clickedProject: d
        }));

    // clear clickedProject when clicking outside of any circle
    this.svg.on('click', () => {
      if (event.target.tagName !== 'circle') {
        this.setState({
          clickedProject: null
        });
      }
    });
  }

  updateHovered(current, prev) {
    if (current === prev) return;

    if (prev !== null)
      this.circles.selectAll(`[data-id='${prev.id}']`)
          .classed('hover', false)
          .attr('fill', function(d) { return rgb(select(this).attr('fill')).brighter() });

    if (current !== null)
      this.circles.selectAll(`[data-id='${current.id}']`)
          .classed('hover', true)
          .attr('fill', function(d) { return rgb(select(this).attr('fill')).darker() });
  }

  updateClicked(current, prev) {
    if (current === prev) return;

    // clean up from prev
    if (prev !== null) {
      this.svg.classed('clicked', false);
      this.circles.selectAll('.neighbor')
          .classed('neighbor', false);
      this.circles.selectAll('.clicked')
          .classed('clicked', false)
          .attr('fill', function(d) { return rgb(select(this).attr('fill')).brighter(2) });
    }

    // make a mess with current
    if (current !== null) {
      let neighborSelector = '';
      current.pins.forEach(pin => {
        neighborSelector += `[data-row='${pin.row}'][data-col='${pin.col}'], `;
      });
      neighborSelector = neighborSelector.slice(0, -2);
      this.svg.classed('clicked', true);
      this.circles.selectAll(neighborSelector)
          .classed('neighbor', true);
      this.circles.selectAll(`[data-id='${current.id}']`)
          .classed('clicked', true)
          .attr('fill', function(d) { return rgb(select(this).attr('fill')).darker(2) });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.updateHovered(this.state.hoveredProject, prevState.hoveredProject);
    this.updateClicked(this.state.clickedProject, prevState.clickedProject);
  }

  render() {
    return (
      <div className="matrix-wrapper">
        <svg className="matrix" width="800" height="800" ref={(svg) => { this.svgRef = svg; }} />
        <MatrixDetails project={this.state.clickedProject} />
      </div>
    );
  }
}