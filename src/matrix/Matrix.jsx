import React, { Component } from 'react';
import { select, axisLeft, axisTop, scaleOrdinal, event, rgb, scalePoint } from 'd3';
import { themeLabel, focusLabel, packData, buildScaleData, parseNewlinesY, parseNewlinesX } from './MatrixUtility';
import MatrixDetails from './MatrixDetails';
import MatrixLegend from './MatrixLegend';
import MatrixScale from './MatrixScale';
import PropTypes from 'prop-types';
import './Matrix.css';

class Matrix extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredProject: null,
      clickedProject: null,
      scaleData: null
    };

    this.domainType = ['Forskningsprojekt', 'Innovationsprojekt', 'Förstudie'];
    this.scaleType = scaleOrdinal()
        .range([rgb(0, 125, 145), rgb(151, 194, 142), rgb(234, 154, 0)]) // pms 3145, pms 2255, pms 2011
        .domain(this.domainType);
  }

  componentDidMount() {
    this.svg = select(this.svgRef);

    this.margin = { top: 130, right: 0, bottom: 0, left: 150 };
    const width = +this.svg.attr("width") - this.margin.left - this.margin.right; // TODO, responsive?
    const height = +this.svg.attr("height") - this.margin.top - this.margin.bottom; // TODO, responsive?

    this.scaleX = scalePoint()
        .range([0, width])
        .domain([1,2,3,4])
        .padding(0.5)
    this.scaleY = scalePoint()
        .range([0, height])
        .domain([1,2,3,4,5])
        .padding(0.5)

    // y-axis
    this.svg.append('g')
        .attr('transform', `translate(${width + this.margin.left}, ${this.margin.top})`)
        .call(axisLeft(this.scaleY)
            .tickSize(width)
            .tickPadding(10)
            .tickFormat(row => themeLabel[row]))
        .call(g => g.select('.domain').remove())
      .selectAll(".tick text")
        .call(parseNewlinesY);

    // themes label
    this.svg.append('text')
        .attr('transform', `translate(20, ${this.margin.top + height / 2})rotate(-90)`)
        .style('text-anchor', 'middle')
        .text('Themes');

    // x-axis
    this.svg.append('g')
        .attr('transform', `translate(${this.margin.left}, ${height + this.margin.top})`)
        .call(axisTop(this.scaleX)
            .tickSize(height)
            .tickPadding(20)
            .tickFormat(col => focusLabel[col]))
        .call(g => g.select('.domain').remove())
      .selectAll(".tick text")
        .call(parseNewlinesX);

    // focus areas label
    this.svg.append('text')
        .attr('transform', `translate(${this.margin.left + width / 2}, 20)`)
        .style('text-anchor', 'middle')
        .text('Focus areas');

    // make some circles
    this.circles = this.svg.append('g').classed('circles', true);
    this.updateData(this.props.data);

    // clear clickedProject when clicking outside of any circle
    // TODO, put this on something bigger than the svg?
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

  updateData(data) {
    const packedData = packData(data, this.scaleX, this.scaleY);
    this.setState({
      scaleData: buildScaleData(packedData)
    });
    const circle = this.circles
      .selectAll('circle')
      .data(packedData, d => `${d.id}[${d.row},${d.col}]`);

    circle.exit()
        .on('mouseover', null)
        .on('mouseout', null)
        .on('click', null)
      .transition()
        .attr('r', 0)
        .remove()

    circle
      .transition()
        .attr('transform', d => `translate(${d.x + this.margin.left},${d.y + this.margin.top})`)
        .attr('r', d => d.r)

    circle.enter().append('circle')
        .attr('transform', d => `translate(${d.x + this.margin.left},${d.y + this.margin.top})`)
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
        }))
        .attr('r', 0)
      .transition()
        .attr('r', d => d.r)
  }

  componentDidUpdate(prevProps, prevState) {
    this.updateHovered(this.state.hoveredProject, prevState.hoveredProject);
    this.updateClicked(this.state.clickedProject, prevState.clickedProject);

    if (this.props.data !== prevProps.data)
      this.updateData(this.props.data);      
  }

  render() {
    return (
      <div className="matrix-wrapper">
        <svg className="matrix" width="800" height="800" ref={(svg) => { this.svgRef = svg; }} />
        <div className="matrix-info">
          <MatrixDetails project={this.state.clickedProject} />
          <MatrixLegend domain={this.domainType} scale={this.scaleType} />
          <MatrixScale scaleData={this.state.scaleData} />
        </div>
      </div>
    );
  }
}

Matrix.propTypes = {
  data: PropTypes.object.isRequired
};

export default Matrix;
