import React, { Component } from 'react';
import { select, axisLeft, axisTop, scaleOrdinal, range, packSiblings } from 'd3';
import mockData from './mock-data.json';
import './Matrix.css';

function packData(data, scaleX, scaleY) {
  // first, group together circles that are at the same position in the matrix
  const obj = {};
  for (let row = 1; row <= 5; ++row) {
    obj[row] = {};
    for (let col = 1; col <= 4; ++col) {
      obj[row][col] = [];
    }
  }
  data.forEach(project => {
    project.matrix.forEach(pin => {
      obj[pin.row][pin.col].push({
        id: project.id,
        name: project.name,
        value: project.value,
        r: Math.sqrt(project.value / Math.PI) * 3
      });
    });
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

export default class Matrix extends Component {
  componentDidMount() {
    this.svg = select(this.svgRef);

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = +this.svg.attr("width") - margin.left - margin.right; // TODO, responsive?
    const height = +this.svg.attr("height") - margin.top - margin.bottom; // TODO, responsive?

    const scaleX = scaleOrdinal()
        .range(range(4).map(d => (1 + d) * width / 4 - width / 8))
        .domain([1, 2, 3, 4]); // TODO: change to focus areas
    const scaleY = scaleOrdinal()
        .range(range(5).map(d => (1 + d) * height / 5 - height / 10))
        .domain([1, 2, 3, 4, 5]); // TODO: change to themes

    // y-axis
    this.svg.append('g')
        .attr('transform', `translate(${width + margin.left}, ${margin.top})`)
        .call(axisLeft(scaleY)
            .tickSize(width)
            .tickPadding(10))
        .call(g => g.select('.domain').remove());

    // x-axis
    this.svg.append('g')
        .attr('transform', `translate(${margin.left}, ${height + margin.top})`)
        .call(axisTop(scaleX)
            .tickSize(height)
            .tickPadding(10))
        .call(g => g.select('.domain').remove());

    // might be useful later
    const projectMap = {};
    mockData.forEach(entry => { projectMap[entry.name] = entry; });

    const packedData = packData(mockData, scaleX, scaleY);

    // make some circles
    const circles = this.svg.append('g').classed('circles', true);
    const node = circles.selectAll('g')
      .data(packedData)
      .enter().append('g')
        .attr('transform', d => `translate(${d.x + margin.left},${d.y + margin.top})`);

    node.append("circle")
        .attr('r', d => d.r)
        .attr('fill', '#ccc')
        .attr('class', d => `id-${d.id}`)
        .on('mouseover', d => circles.selectAll(`.id-${d.id}`).classed('hover', true))
        .on('mouseout', d => circles.selectAll(`.id-${d.id}`).classed('hover', false));
  }

  render() {
    return (
      <div>
        <h1>Matrix</h1>
        <svg className="matrix" width="550" height="650" ref={(svg) => { this.svgRef = svg; }} />
      </div>
    );
  }
}