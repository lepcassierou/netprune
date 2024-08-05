import React from 'react';
import PropTypes from 'prop-types';

import d3 from 'd3';

export default class Sparkline extends React.Component {
    constructor(props) {
        super(props);

        let height = this.props.height;
        if (!height)
            height = 150
        let width = this.props.width;
        if (!width)
            width = 300

        this.state = {
            height,
            width,
        }

        this.areActivationsEqual = this.areActivationsEqual.bind(this);
    }


    componentDidMount() {
        this.drawSparklines();
    }


    areActivationsEqual(prevAct, newAct) {
        for (let i = 0; i < prevAct.length; i++) {
            if(prevAct[i].id !== newAct[i].id
                || prevAct[i].value !== newAct[i].value){
                    return false;
                }
        }
        return true;
    }


    componentDidUpdate(prevProps) {
        let shouldUpdate = false;
        let prevAct = prevProps.averageActivations;
        let newAct = this.props.averageActivations;
        if (prevAct.length !== newAct.length) {
            shouldUpdate = true;
        } else if (!this.areActivationsEqual(prevAct, newAct)) {
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            this.removeSparklines();
            this.drawSparklines();
        }
    }


    removeSparklines() {
        d3.selectAll('#Sparkline' + this.props.label).selectAll("*").remove();
    }


    drawSparklines() {
        let sparklineCell = d3.select('#Sparkline' + this.props.label);
        let sumSignal = 0;
        let length = this.props.averageActivations.length;
        for (let i = 0; i < length; ++i) {
            sumSignal += Math.abs(this.props.averageActivations[i].value);
        }

        // Background color
        let isCellDiag = this.props.baselineIndex === this.props.classIndex;
        if (isCellDiag)
            this.props.onChangeColorBG(this.props.classIndex, 0);
        else {
            let maxAbs = this.props.minsMaxes.maxNonDiag * length;
            this.props.onChangeColorBG(this.props.classIndex, sumSignal / maxAbs);
        }

        let margin = { top: 2, left: 5, bottom: 2, right: 5 }

        let x = d3.scaleLinear()
            .domain([0, length])
            .range([margin.left, this.state.width - margin.right])

        let y;
        if (isCellDiag) {
            y = d3.scaleLinear()
                .domain([this.props.minsMaxes.minDiag, this.props.minsMaxes.maxDiag])
                .range([this.state.height - 2 * margin.bottom, margin.top]);

        } else {
            y = d3.scaleLinear()
                .domain([this.props.minsMaxes.minNonDiag, this.props.minsMaxes.maxNonDiag])
                .range([this.state.height - 2 * margin.bottom, margin.top]);
        }

        let line = d3.line()
            .x((_d, i) => x(i))
            .y((d, _i) => y(d.value));

        let line_ref = d3.line()
            .x((_d, i) => x(i))
            .y((_d, _i) => y(0));

        // Uncomment the 2 blocks here to display sparklines
        sparklineCell.append("path")
            .datum(this.props.averageActivations)
            .attr("stroke", "grey")
            .attr("stroke-width", "2px")
            .attr("fill", "none")
            .attr("stroke-dasharray", "6 4 6")
            .attr("d", line_ref)

        let line_thickness = "1px";
        if(!!this.props.fullScreen){
            line_thickness = "2px";
        }
        sparklineCell.append("path")
            .datum(this.props.averageActivations)
            .attr("stroke", isCellDiag ? "orange" : "steelblue")
            .attr("stroke-width", line_thickness)
            .attr("fill", "none")
            .attr("stroke-opacity", 0.7)
            .attr("d", line)
    }


    render() {
        return (
            <svg id={"Sparkline" + this.props.label} style={{ height: this.state.height, width: this.state.width }} />
        );
    }
};

Sparkline.propTypes = {
    label: PropTypes.string,
}