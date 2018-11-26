import React, { Component } from 'react';
import { select, axisLeft, axisTop, event, scalePoint, easePolyOut } from 'd3';
import { themeLabel, focusLabel, packData, buildScaleData, parseNewlinesY, parseNewlinesX, type2class } from './MatrixUtility';
import { withRouter } from 'react-router-dom';
import MatrixTooltip from './MatrixTooltip';
import PropTypes from 'prop-types';
import isEqual from 'react-fast-compare';
import debounce from 'lodash.debounce';
import ProjectNavigator from '../ProjectNavigator';
import './Matrix.css';

const masterTransition = (transition) => transition.duration(800).ease(easePolyOut.exponent(4));

class Matrix extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredProject: null
    };

    this.margin = { top: 130, right: 20, bottom: 20, left: 160 };
    this.offset = { x: 0,  y: 0 };
    this.projectNavigator = new ProjectNavigator('/matrix');
    this.draw = this.draw.bind(this);
  }

  componentDidMount() {
    this.svg = select(this.svgRef);

    // used for transforming the contents of the svg, if necessary
    this.svgInner = this.svg
      .append('g')
        .classed('matrix-svg-inner', true);

    this.scaleX = scalePoint()
        .domain([1,2,3,4])
        .padding(0.5)
    this.scaleY = scalePoint()
        .domain([1,2,3,4,5])
        .padding(0.5)

    // y-axis
    this.svgInner.append('g')
        .classed('matrix-y-axis', true);

    // themes label
    this.svgInner.append('text')
        .classed('themes-label', true)
        .classed('matrix-axis-label', true)
        .text('Teman');

    // x-axis
    this.svgInner.append('g')
        .classed('matrix-x-axis', true);

    // focus areas label
    this.svgInner.append('text')
        .classed('focus-areas-label', true)
        .classed('matrix-axis-label', true)
        .text('Fokusområden');

    // make some circles
    this.circles = this.svgInner.append('g').classed('circles', true);
    this.draw(true);

    // clear clickedProject when clicking outside of any circle
    this.svg.on('click', () => {
      if (event.target.tagName !== 'circle') {
        this.projectNavigator.goToRoot(this.props.history, this.props.location);
      }
    });

    this.debounce = debounce(() => this.draw(), 100);
    window.addEventListener('resize', this.debounce);
  }

  componentDidUpdate(prevProps, prevState) {
    this.updateHovered(this.state.hoveredProject, prevState.hoveredProject);
    this.updateClicked(this.props, prevProps);

    if (!isEqual(this.props.filteredData, prevProps.filteredData)) {
      this.updateData(this.props.filteredData);
      this.setState({
        hoveredProject: null
      });
      this.projectNavigator.goToRoot(this.props.history, this.props.location);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debounce);
    this.svg.on('click', null);
  }

  selectCircle(id) {
    return this.circles.select(`[data-id='${id}']`)
  }

  draw(init = false) {
    let height = +this.svgWrapperRef.clientHeight - this.margin.top - this.margin.bottom;
    let width = +this.svgWrapperRef.clientWidth - this.margin.left - this.margin.right;

    // 300 px is the size of the infobox that appears when a project is clicked!
    if (this.projectNavigator.projectIsActive(this.props.location, this.props.filteredData)) width -= 300;
    
    const stretch = false;
    if (!stretch) {
      const aspectRatio = 5 / 5; // 4 / 5 is "optimal"
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

    // set up selectors
    const selectors = {
      svgInner: this.svgInner,
      yAxis: this.svgInner.select('g.matrix-y-axis'),
      themesLabel: this.svgInner.select('text.themes-label'),
      xAxis: this.svgInner.select('g.matrix-x-axis'),
      focusAreasLabel: this.svgInner.select('text.focus-areas-label')
    }
    if (!init)
      Object.keys(selectors).forEach(s => selectors[s] = selectors[s].transition().call(masterTransition));

    selectors.svgInner
        .attr('transform', `translate(${this.offset.x}, ${this.offset.y})`);

    // themes label
    selectors.themesLabel
        .attr('transform', `translate(25, ${this.margin.top + height / 2})rotate(-90)`);

    // focus areas label
    selectors.focusAreasLabel
        .attr('transform', `translate(${this.margin.left + width / 2}, 35)`);

    /**
     * NOTE: The default text elements (labels) on the axes are hidden and replaced to
     * allow for two things: (1) splitting up the labels into multiple lines and (2)
     * having transitions. The default labels can support (1) and (2) separately but not 
     * at the same time! So that's why there's some extra code here
     *
     * We don't want remove the original text element and .domain,
     * if we remove the text element, d3-axis will start fucking with our label
     * (changin text contents, position etc)
     * if we remove .domain, d3-axis will just add it again next draw call.
     */

    // (equivalent to axis.tickPadding [but hardcoded])
    const tickPadding = 20;

    // y-axis
    selectors.yAxis
        .attr('transform', `translate(${width + this.margin.left}, ${this.margin.top})`)
        .call(axisLeft(this.scaleY).tickSize(width))
    const yAxisSelection = selectors.yAxis.selection ? selectors.yAxis.selection() : selectors.yAxis;
    if (yAxisSelection.selectAll('.tick text.label').empty()) {
      yAxisSelection
          .call(e => e.selectAll('.tick text').attr('display', 'none'))
          .call(e => e.select('.domain').attr('display', 'none'))
        .selectAll('.tick')
        .append('text')
          .classed('label', true)
          .text(i => themeLabel[i])
          .attr('fill', 'currentColor')
          .attr('x', -width - tickPadding)
          .attr('dy', '0.32em') // see d3-axis source code
          .call(parseNewlinesY);
    } else {
      const x = -width - tickPadding;
      selectors.yAxis.selectAll('.tick text.label')
          .attr('x', x)
        .selectAll('tspan')
          .attr('x', x);
    }

    // x-axis
    selectors.xAxis
        .attr('transform', `translate(${this.margin.left}, ${height + this.margin.top})`)
        .call(axisTop(this.scaleX).tickSize(height))
    const xAxisSelection = selectors.xAxis.selection ? selectors.xAxis.selection() : selectors.xAxis;
    if (xAxisSelection.selectAll('.tick text.label').empty()) {
      xAxisSelection
          .call(e => e.selectAll('.tick text').attr('display', 'none'))
          .call(e => e.select('.domain').attr('display', 'none'))
        .selectAll('.tick')
        .append('text')
          .classed('label', true)
          .text(i => focusLabel[i])
          .attr('fill', 'currentColor')
          .attr('y', -height - tickPadding)
          .attr('dy', '0em') // see d3-axis source code
          .call(parseNewlinesX);
    } else {
      const y = -height - tickPadding;
      selectors.xAxis.selectAll('.tick text.label')
          .attr('y', y)
          .attr('transform', `translate(0,${y})rotate(-45)translate(0,${-y})`);
    }

    this.updateData(this.props.filteredData);
  }

  updateHovered(project, prevProject) {
    if (project === prevProject)
      return;

    if (prevProject !== null)
      this.circles.selectAll('.hover')
          .classed('hover', false);

    if (project !== null)
      this.circles.selectAll(`[data-id='${project.survey_answers.project_id}']`)
          .classed('hover', true);
  }

  updateClicked(props, prevProps) {
    let projectId = ProjectNavigator.getProjectId(props.location);
    let prevProjectId = ProjectNavigator.getProjectId(prevProps.location);

    // if we just started, (i.e. navigated to the site via a permalink with a project id)
    // the projectId and prevProjectId will be identical because of how prevProps.location works
    // so change it to -1.
    if (!this.projectNavigator.hasChangedSinceInit()) {
      prevProjectId = -1;
      this.projectNavigator.change();
    }

    if (projectId === prevProjectId) return;

    // necessary only if clicking a project changes svgWrapper size (i.e. infobox takes up more or less space than before)
    if ((projectId === -1 && prevProjectId !== -1) || (projectId !== -1 && prevProjectId === -1))
      this.draw();

    // clean up from prev
    if (prevProjectId !== -1 && this.svg.classed('clicked')) {
      this.svg.classed('clicked', false);
      this.circles.selectAll('.neighbor')
          .classed('neighbor', false);
      this.circles.selectAll('.clicked')
          .classed('clicked', false);
    }

    // if no project in path, we done
    if (projectId === -1) return;

    // if the project from the url doesn't exist in filteredData, redirect to root
    if (!this.projectNavigator.projectIsActive(props.location, props.filteredData)) {
      this.projectNavigator.redirectToRoot(props.history);
      return;
    }

    // make a mess with current
    const datum = this.circles.select(`[data-id='${projectId}']`).datum();
    let neighborSelector = '';
    datum.pins.forEach(pin => {
      neighborSelector += `[data-row='${pin.row}'][data-col='${pin.col}'], `;
    });
    neighborSelector = neighborSelector.slice(0, -2); // remove trailing comma
    this.svg.classed('clicked', true);
    this.circles.selectAll(neighborSelector)
        .classed('neighbor', true);
    this.circles.selectAll(`[data-id='${datum.survey_answers.project_id}']`)
        .classed('clicked', true);
  }

  updateData(data) {
    const packedData = packData(data, this.scaleX, this.scaleY);
    this.props.updateScaleData(buildScaleData(packedData));
    const circle = this.circles
      .selectAll('circle')
      .data(packedData, d => `${d.survey_answers.project_id}[${d.row},${d.col}]`);

    circle.exit()
        // NOTE: These lines caused a nasty bug when calling updateData more than once in quick succession
        //       with different subsets of data. But they shouldn't be needed regardlessly.
        //.on('mouseover', null)
        //.on('mouseout', null)
        //.on('click', null))
      .transition()
        .call(masterTransition)
        .attr('r', 0)
        .remove();

    circle
      .transition()
        .call(masterTransition)
        .attr('r', d => d.r)
        .attr('transform', d => `translate(${d.x + this.margin.left},${d.y + this.margin.top})`);

    circle.enter().append('circle')
        .attr('transform', d => `translate(${d.x + this.margin.left},${d.y + this.margin.top})`)
        .attr('data-id', d => d.survey_answers.project_id)
        .attr('data-row', d => d.row)
        .attr('data-col', d => d.col)
        .attr('class', d => type2class[d.survey_answers.project_type])
        .on('mouseover', d => this.setState({
          hoveredProject: d
        }))
        .on('mouseout', d => this.setState({
          hoveredProject: null
        }))
        .on('click', d => {
          this.projectNavigator.goToProject(this.props.history, this.props.location, d.survey_answers.project_id);
          this.setState({
            hoveredProject: null
          });
        })
        .attr('r', 0)
      .transition()
        .call(masterTransition)
        .attr('r', d => d.r);
  }

  render() {
    return (
      <div className="matrix-wrapper" ref={svgWrapper => { this.svgWrapperRef = svgWrapper; }}>
        <svg className="matrix" width="100%" height="100%" ref={svg => { this.svgRef = svg; }} />
        <MatrixTooltip project={this.state.hoveredProject} margin={this.margin} offset={this.offset} />
      </div>
    );
  }
}

Matrix.propTypes = {
  data: PropTypes.object.isRequired,
  filteredData: PropTypes.object.isRequired,
  updateScaleData: PropTypes.func.isRequired
};

export default withRouter(Matrix);
