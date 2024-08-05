import React from 'react';
import PropTypes from 'prop-types';

import d3 from 'd3';

export default class D3SparkLine extends React.Component {
  constructor(props) {
    super(props);

    let height = this.props.height
    if (!height)
      height = 150
    let width = this.props.width
    if (!width)
      width = 300

    this.state = {
      height,
      width,
    }
  }

  componentDidMount() {
    this.lineChart();
  }

  componentDidUpdate(prevProps) {
    let shouldUpdate = false;
    if (this.props.data.length !== prevProps.data.length) {
      shouldUpdate = true;
    }
    if (this.props.metric !== prevProps.metric) {
      shouldUpdate = true;
    }
    if (prevProps.qualitativeMetric.baseline !== this.props.qualitativeMetric.baseline
      || prevProps.qualitativeMetric.classN !== this.props.qualitativeMetric.classN) {
      shouldUpdate = true;
    }
    if (shouldUpdate) {
      d3.selectAll('#' + this.props.label).selectAll("*").remove();
      this.lineChart();
    }
  }

  lineChart() {
    let chart = d3.select('#' + this.props.label)
    let sumSignal = 0;
    for (let i = 0; i < this.props.data.length; ++i) {
      sumSignal += Math.abs(this.props.data[i].classes[this.props.classIndex]);
      //TODO: CHANGE to make this depend on the real filters not the indexes of the filters
    }

    // Background color
    if (this.props.baselineIndex === this.props.classIndex)
      this.props.onChangeColorBG(this.props.classIndex, 0);
    else {
      let maxAbs = this.props.maxPossibleOpacity * this.props.data.length;
      this.props.onChangeColorBG(this.props.classIndex, sumSignal / maxAbs);
    }

    let margin = { top: 2, left: 5, bottom: 2, right: 5 }

    let x = d3.scaleLinear()
      .domain([0, this.props.data.length])
      .range([margin.left, this.state.width - margin.right])

    let y = d3.scaleLinear()
      .domain([-this.props.bound, this.props.bound])
      .range([this.state.height - 2 * margin.bottom, margin.top])

    let xAxis = g => g
      .attr("transform", `translate(0, ${this.state.height / 2})`)
      .call(d3.axisBottom(x).tickSize(0).ticks(0))

    let yAxis = g => g
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).tickSize(0).ticks(0))

    var line = d3.line()
      .x((d, i) => x(i))
      .y((d, i) => y(d.classes[this.props.classIndex]))

    var line_ref = d3.line()
      .x((d, i) => x(i))
      .y((d, i) => y(0))

    chart.append("path")
      .datum(this.props.data)
      .attr("stroke", "grey")
      .attr("stroke-width", "2px")
      .attr("fill", "none")
      .attr("stroke-dasharray", "6 4 6")
      .attr("d", line_ref)

    chart.append("path")
      .datum(this.props.data)
      .attr("stroke", (this.props.baselineIndex === this.props.classIndex) ? "orange" : "steelblue")
      .attr("stroke-width", "2px")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.7)
      .attr("d", line)
  }
  render() {
    return (
      <svg id={this.props.label} style={{ height: this.state.height, width: this.state.width }} />
    );
  }
};

D3SparkLine.propTypes = {
  label: PropTypes.string,
}