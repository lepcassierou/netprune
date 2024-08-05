import React from 'react';

import d3, { select } from 'd3';


export default class FAVMatrix extends React.Component {
    constructor(props) {
        super(props);

        let height = this.props.height
        if (!height)
            height = 150
        let width = this.props.width
        if (!width)
            width = 300

        this.margin = { top: 5, left: 50, bottom: 20, right: 5 }

        this.state = {
            height,
            width,
        }

        this.palette = ["#DAE8FC", "#D5E8D4", "#FFF2CC", "#E1D5E7", "#F8CECC", "#FFE6CC"]; // fill color
        // this.palette = ["#6C8EBF", "#82B366", "#D6B656", "#D79B00", "#B85450", "#9673A6"]; // border color
        this.computeUnionOfFilters = this.computeUnionOfFilters.bind(this);
        this.removeMatrix = this.removeMatrix.bind(this);
        this.drawMatrix = this.drawMatrix.bind(this);
    }

    componentDidMount() {
        this.drawMatrix();
    }

    componentDidUpdate(prevProps) {
        // Metric changed
        this.drawMatrix();
    }

    computeUnionOfFilters() {
        let filtersUnion = [];
        Object.keys(this.props.confirmedSelection).forEach(metric => {
            this.props.confirmedSelection[metric].forEach(filter => {
                if (!filtersUnion.includes(filter)) {
                    filtersUnion.push(filter);
                }
            })
        })
        return filtersUnion;
    }


    removeMatrix() {
        d3.select('#' + this.props.idCss).selectAll("*").remove();
    }


    drawMatrix() {
        let FAVM = d3.select('#' + this.props.idCss);
        let margin = { top: 5, left: 50, bottom: 20, right: 5 }

        // Clean histogram
        this.removeMatrix();

        // create axis
        let length = this.props.value.length;
        this.x = d3.scaleLinear()
            .domain([0, length]).nice()
            .range([this.margin.left, this.state.width]);

        this.y = d3.scaleLinear()
            .domain([0, Object.keys(this.props.confirmedSelection).length]).nice()
            .range([0.66 * this.state.height - this.margin.bottom, this.margin.top]);

        this.yUnion = d3.scaleLinear()
            .domain([0, 1]).nice()
            .range([this.state.height - this.margin.bottom, 0.67 * this.state.height + 2 * this.margin.top + this.margin.bottom]);

        let xTicksValues = [];
        let maxXTicks = 20;
        for (let f = 0; f < length; ++f) {
            xTicksValues.push(f);
        }

        let xAxis = g => g
            .attr("transform", `translate(0,${0.66 * this.state.height - margin.bottom})`)
            .call(d3.axisBottom(this.x).tickValues(xTicksValues)
                .tickFormat((d, i) => {
                    let mod = 0;
                    if (xTicksValues.length < maxXTicks)
                        mod = 1;
                    else
                        mod = Math.floor(xTicksValues.length / maxXTicks);
                    if ((i % mod) == 0) {
                        return d;
                    }
                }))
            .call((selection) => {
                let halfSpaceBtTicks = 0;
                if (length > 1) {
                    halfSpaceBtTicks = (this.x(1) - this.x(0)) / 2;
                }
                selection.selectAll('.tick text')
                    .attr('transform', 'translate(' + halfSpaceBtTicks + ',0)');
            });

        let xAxis2 = g => g
            .attr("transform", `translate(0,${this.state.height - margin.bottom})`)
            .call(d3.axisBottom(this.x).tickValues(xTicksValues)
                .tickFormat((d, i) => {
                    let mod = 0;
                    if (xTicksValues.length < maxXTicks)
                        mod = 1;
                    else
                        mod = Math.floor(xTicksValues.length / maxXTicks);
                    if ((i % mod) == 0) {
                        return d;
                    }
                }))
            .call((selection) => {
                let halfSpaceBtTicks = 0;
                if (length > 1) {
                    halfSpaceBtTicks = (this.x(1) - this.x(0)) / 2;
                }
                selection.selectAll('.tick text')
                    .attr('transform', 'translate(' + halfSpaceBtTicks + ',0)');
            });

        // Determine metrics list
        let metricsList = [];
        let ticksValues = [];
        Object.keys(this.props.confirmedSelection).forEach((metric, metricIndex) => {
            if (metric in this.props.metricsList) {
                metricsList.push(this.props.metricsList[metric].title);
            }
            ticksValues.push(metricIndex);
        });

        let yAxis = g => g
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(this.y).tickValues(ticksValues)
                .tickFormat((d, i) => {
                    if (Number.isInteger(parseFloat(d))) {
                        return metricsList[d].toString().slice(0, 5);
                    } else {
                        return " ";
                    }
                })) // Number of characters to display
            .call((selection) => {
                let halfSpaceBtTicks = (this.y(1) - this.y(0)) / 2;
                selection.selectAll('.tick text')
                    .attr('transform', 'translate(0,' + halfSpaceBtTicks + ')');
            });

        let yAxisUnion = g => g
            .attr("transform", `translate(${margin.left}, ${0})`)
            .call(d3.axisLeft(this.yUnion).ticks(1).tickFormat((d, i) => {
                if (d == 0) {
                    return "UNION";
                }
            }))
            .call((selection) => {
                let halfSpaceBtTicks = (this.yUnion(1) - this.yUnion(0)) / 2;
                selection.selectAll('.tick text')
                    .attr('transform', 'translate(0,' + halfSpaceBtTicks + ')');
            });

        Object.keys(this.props.confirmedSelection).forEach((keyMetric, metricIndex) => {
            let filtersCurrentMetric = this.props.confirmedSelection[keyMetric];
            // Draw white rectangles for the length of the filters to avoid overlap bt metrics
            FAVM.append("rect")
                .attr("x", this.x(0))
                .attr("y", this.y(metricIndex + 1))
                .attr("width", this.x(length))
                .attr("height", this.y(metricIndex) - this.y(metricIndex + 1))
                .attr("fill", "white")
                .style("stroke", "white");
            this.props.value.forEach((filterObj, indexFilter) => {
                let sortedFilter = filterObj.id;
                if (filtersCurrentMetric.includes(sortedFilter)) {
                    FAVM.append("rect")
                        .attr("x", this.x(indexFilter))
                        .attr("y", this.y(metricIndex + 1))
                        .attr("width", this.x(indexFilter + 1) - this.x(indexFilter))
                        .attr("height", this.y(metricIndex) - this.y(metricIndex + 1))
                        .attr("fill", this.palette[metricIndex])
                        .style("stroke", this.palette[metricIndex]);

                    // Second histogram (union)
                    FAVM.append("rect")
                        .attr("x", this.x(indexFilter))
                        .attr("y", this.yUnion(1))
                        .attr("width", this.x(indexFilter + 1) - this.x(indexFilter))
                        .attr("height", this.yUnion(0) - this.yUnion(1))
                        .attr("fill", "#FFE6CC")
                        .style("stroke", "#FFE6CC");
                }
            })
        });

        let union = this.computeUnionOfFilters();
        FAVM.append("text")
            .attr("x", this.state.width / 2)
            .attr("y", this.yUnion(1) - 5)
            .attr("font-size", "14")
            .attr("font-family", "Verdana")
            .style("text-anchor", "middle")
            .text(((union.length / length) * 100).toFixed(2) + " % (" + union.length + ")");

        FAVM.append("g")
            .call(xAxis)
        FAVM.append("g")
            .call(yAxis)

        FAVM.append("g")
            .call(xAxis2)
        FAVM.append("g")
            .call(yAxisUnion)

    }


    render() {
        return (
            <svg id={this.props.idCss} style={{ height: this.state.height, width: this.state.width }} />
        )
    }
}
