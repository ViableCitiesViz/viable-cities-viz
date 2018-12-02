import React, { Component } from 'react';
import { select, easePolyOut } from 'd3';
import PropTypes from 'prop-types';
import './ScaleLegend.css';

const masterTransition = (transition) => transition.duration(800).ease(easePolyOut.exponent(4));

class ScaleLegend extends Component {
  componentDidMount() {
    this.parent = select(this.parentRef).style('width', '150px');
    this.svg = select(this.svgRef).attr('height', 0);

    this.margin = { top: 10, right: 10, bottom: 10, left: 20};
    this.lineWidth = 10;
    this.labelWidth = 60; // hard-coded approximation of label width for centering

    this.updateData(this.props.scaleData);
  }

  updateData(data) {
    if (!data || !data.length) return;

    const fixedData = data.slice().map((d, i) => ({ ...d, i })).reverse();
    const selection = this.svg.selectAll('g').data(fixedData);

    const labels = data.map((circle, index) => {
      let left = data[0].r + this.margin.left;
      let top = data[0].r * 2 - circle.r * 2 + this.margin.top;
      let width = data[0].r + this.lineWidth;
      if (index === data.length - 1) {
        left += circle.r;
        top += circle.r;
        width -= circle.r;
      }

      return { left, top, width };
    })

    const prevSvgHeight = this.svg.attr('height');
    const svgHeight = data[0].r * 2 + this.margin.top + this.margin.bottom;
    const svgHeightChange = svgHeight - prevSvgHeight;

    const prevParentWidth = Number.parseInt(this.svg.style('width').replace('px', ''));
    const parentWidth = data[0].r * 2 + this.margin.left + this.margin.right + this.lineWidth + this.labelWidth;
    const parentWidthChange = parentWidth - prevParentWidth;

    this.parent
      .transition()
        .call(masterTransition)
        .style('width', `${parentWidth}px`)

    this.svg
      .transition()
        .call(masterTransition)
        .attr('height', svgHeight)

    selection.exit()
        .call(g => g.select('line')
            .attr('opacity', 0))
        .call(g => g.select('text')
            .attr('opacity', 0))
      .transition()
        .call(masterTransition)
        .call(g => g.select('circle')
            .attr('cx', data[0].r + this.margin.left)
            .attr('cy', d => data[0].r * 2 - d.r + this.margin.top)
            .attr('opacity', 0))
        .remove();

    selection
      .transition()
        .call(masterTransition)
        .call(g => g.select('circle')
            .attr('r', d => d.r)
            .attr('cx', data[0].r + this.margin.left)
            .attr('cy', d => data[0].r * 2 - d.r + this.margin.top))
        .call(g => g.select('line')
            .attr('x1', d => labels[d.i].left)
            .attr('x2', d => labels[d.i].left + labels[d.i].width)
            .attr('y1', d => labels[d.i].top)
            .attr('y2', d => labels[d.i].top))
        .call(g => g.select('text')
            .attr('x', d => labels[d.i].left + labels[d.i].width + 5)
            .attr('y', d => labels[d.i].top)
            .text(d => d.label))

    selection.enter().append('g')
        .call(g => g.append('circle')
            .attr('r', d => d.r)
            .attr('cx', data[0].r + this.margin.left - parentWidthChange / 2)
            .attr('cy', d => data[0].r * 2 - d.r + this.margin.top - svgHeightChange)
            .attr('opacity', 0))
        .call(g => g.append('line')
            .attr('x1', d => labels[d.i].left - parentWidthChange / 2)
            .attr('x2', d => labels[d.i].left + labels[d.i].width - parentWidthChange / 2)
            .attr('y1', d => labels[d.i].top - svgHeightChange)
            .attr('y2', d => labels[d.i].top - svgHeightChange)
            .attr('shape-rendering', 'crispEdges')
            .attr('opacity', 0))
        .call(g => g.append('text')
            .attr('x', d => labels[d.i].left + labels[d.i].width + 5 - parentWidthChange / 2)
            .attr('y', d => labels[d.i].top - svgHeightChange)
            .attr('alignment-baseline', 'central')
            .text(d => d.label)
            .attr('opacity', 0))
      .transition()
        .call(masterTransition)
        .call(g => g.select('circle')
            .attr('cx', data[0].r + this.margin.left)
            .attr('cy', d => data[0].r * 2 - d.r + this.margin.top)
            .attr('opacity', 1))
        .call(g => g.select('line')
            .attr('x1', d => labels[d.i].left)
            .attr('x2', d => labels[d.i].left + labels[d.i].width)
            .attr('y1', d => labels[d.i].top)
            .attr('y2', d => labels[d.i].top)
            .attr('opacity', 1))
        .call(g => g.select('text')
            .attr('x', d => labels[d.i].left + labels[d.i].width + 5)
            .attr('y', d => labels[d.i].top)
            .attr('opacity', 1))
  }

  componentDidUpdate(prevProps) {
    if (prevProps.scaleData !== this.props.scaleData)
      this.updateData(this.props.scaleData);
  }

  render() {
    return (
      <div className="scale-legend" ref={parent => this.parentRef = parent}>
        <svg ref={svg => this.svgRef = svg} width="100%" />
      </div>
    );
  }
}

ScaleLegend.propTypes = {
  scaleData: PropTypes.arrayOf(PropTypes.shape({
    r: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired
  }))
};

export default ScaleLegend;