import React, { Component } from 'react';
import { select, axisLeft, axisTop, event, rgb, scalePoint } from 'd3';
import { themeLabel, focusLabel, packData, buildScaleData, parseNewlinesY, parseNewlinesX, projectTypeColors } from './MatrixUtility';
import MatrixDetails from './MatrixDetails';
import MatrixTooltip from './MatrixTooltip';
import PropTypes from 'prop-types';
import isEqual from 'react-fast-compare';
import debounce from 'lodash.debounce';
import './Matrix.css';

class Matrix extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredProject: null,
      clickedProject: null
    };

    this.margin = { top: 160, right: 20, bottom: 20, left: 190 };
    this.offset = { x: 0,  y: 0 };
    this.draw = this.draw.bind(this);
  }

  componentDidMount() {
    this.svg = select(this.svgRef);

    // used for transforming the contents of the svg, if necessary
    this.svgInner = this.svg.append('g');

    this.scaleX = scalePoint()
        .domain([1,2,3,4])
        .padding(0.5)
    this.scaleY = scalePoint()
        .domain([1,2,3,4,5])
        .padding(0.5)

    // y-axis
    this.svgInner.append('g')
        .classed('y-axis', true);

    // themes label
    this.svgInner.append('text')
        .classed('themes-label', true)
        .classed('matrix-axis-label', true)
        .text('Teman');

    // x-axis
    this.svgInner.append('g')
        .classed('x-axis', true);

    // focus areas label
    this.svgInner.append('text')
        .classed('focus-areas-label', true)
        .classed('matrix-axis-label', true)
        .text('Fokusområden');

    // make some circles
    this.circles = this.svgInner.append('g').classed('circles', true);

    this.draw();

    // clear clickedProject when clicking outside of any circle
    // TODO, put this on something bigger than the svg?
    this.svg.on('click', () => {
      if (event.target.tagName !== 'circle') {
        this.setState({
          clickedProject: null
        });
      }
    });

    this.debounce = debounce(this.draw, 100);
    window.addEventListener('resize', this.debounce);
  }

  componentDidUpdate(prevProps, prevState) {
    this.updateHovered(this.state.hoveredProject, prevState.hoveredProject);
    this.updateClicked(this.state.clickedProject, prevState.clickedProject);

    if (!isEqual(this.props.data, prevProps.data)) {
      this.updateData(this.props.data);
      this.setState({
        clickedProject: null,
        hoveredProject: null
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debounce);
    this.svg.on('click', null);
  }

  draw() {
    let height = +this.svgWrapperRef.clientHeight - this.margin.top - this.margin.bottom;
    let width = +this.svgWrapperRef.clientWidth - this.margin.left - this.margin.right;
    
    const stretch = true;

    if (!stretch) {
      const aspectRatio = 5 / 5; // 4 / 5 is optimal
      const optimalHeight = width * 1 / aspectRatio;
      const optimalWidth = height * aspectRatio;

      if ((optimalHeight + this.margin.top + this.margin.bottom) <= this.svgWrapperRef.clientHeight) {
        this.offset = { x: 0, y: (height - optimalHeight) / 2 };
        height = optimalHeight;
      } else {
        this.offset = { x: (width - optimalWidth) / 2, y: 0 };
        width = optimalWidth;
      }
    }

    // update scales
    this.scaleX.range([0, width]);
    this.scaleY.range([0, height]);

    this.svgInner.attr('transform', `translate(${this.offset.x}, ${this.offset.y})`)

    // y-axis
    this.svgInner.select('g.y-axis')
        .attr('transform', `translate(${width + this.margin.left}, ${this.margin.top})`)
        .call(axisLeft(this.scaleY)
            .tickSize(width)
            .tickPadding(20)
            .tickFormat(row => themeLabel[row]))
        .call(g => g.select('.domain').remove())
      .selectAll(".tick text")
        .call(parseNewlinesY);

    // themes label
    this.svgInner.select('text.themes-label')
        .attr('transform', `translate(30, ${this.margin.top + height / 2})rotate(-90)`);

    // x-axis
    this.svgInner.select('g.x-axis')
        .attr('transform', `translate(${this.margin.left}, ${height + this.margin.top})`)
        .call(axisTop(this.scaleX)
            .tickSize(height)
            .tickPadding(20)
            .tickFormat(col => focusLabel[col]))
        .call(g => g.select('.domain').remove())
      .selectAll(".tick text")
        .call(parseNewlinesX);
      

    // focus areas label
    this.svgInner.select('text.focus-areas-label')
        .attr('transform', `translate(${this.margin.left + width / 2}, 30)`);

    this.updateData(this.props.data);
  }

  updateHovered(current, prev) {
    if (current === prev) return;

    if (prev !== null)
      this.circles.selectAll(`[data-id='${prev.survey_answers.project_id}']`)
          .classed('hover', false)
          .attr('fill', function(d) { return rgb(select(this).attr('fill')).brighter() });

    if (current !== null)
      this.circles.selectAll(`[data-id='${current.survey_answers.project_id}']`)
          .classed('hover', true)
          .attr('fill', function(d) { return rgb(select(this).attr('fill')).darker() });
  }

  updateClicked(current, prev) {
    if (current === prev) return;

    this.draw();

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
      this.circles.selectAll(`[data-id='${current.survey_answers.project_id}']`)
          .classed('clicked', true)
          .attr('fill', function(d) { return rgb(select(this).attr('fill')).darker(2) });
    }
  }

  updateData(data) {
    const packedData = packData(data, this.scaleX, this.scaleY);
    this.props.updateScaleData(buildScaleData(packedData));
    const circle = this.circles
      .selectAll('circle')
      .data(packedData, d => `${d.survey_answers.project_id}[${d.row},${d.col}]`);

    circle.exit()
        .on('mouseover', null)
        .on('mouseout', null)
        .on('click', null)
      .transition()
        .attr('r', 0)
        .remove();

    circle
      .transition()
        .attr('r', d => d.r)
        .attr('transform', d => `translate(${d.x + this.margin.left},${d.y + this.margin.top})`);

    circle.enter().append('circle')
        .attr('transform', d => `translate(${d.x + this.margin.left},${d.y + this.margin.top})`)
        .attr('data-id', d => d.survey_answers.project_id)
        .attr('data-row', d => d.row)
        .attr('data-col', d => d.col)
        .attr('fill', d => projectTypeColors(d.survey_answers.project_type))
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
        .attr('r', d => d.r);
  }

  render() {
    return (
      <div className="matrix-wrapper">
        <div className="matrix-svg-wrapper" ref={svgWrapper => { this.svgWrapperRef = svgWrapper; }}>
          <svg className="matrix" width="100%" height="100%" ref={svg => { this.svgRef = svg; }} />
          <MatrixTooltip hoveredProject={this.state.hoveredProject} margin={this.margin} offset={this.offset} />
        </div>
        <div className="matrix-info">
          <MatrixDetails project={this.state.clickedProject} />
        </div>
      </div>
    );
  }
}

Matrix.propTypes = {
  data: PropTypes.object.isRequired,
  updateScaleData: PropTypes.func.isRequired
};

export default Matrix;
