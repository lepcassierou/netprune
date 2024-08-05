import React from 'react';
import d3 from 'd3';

import { Typography } from '@material-ui/core';

export default class PerformancesPlot extends React.Component {
    constructor(props) {
        super(props);
    
        let height = this.props.height;
        if (!height)
            height = 125;
        let width = this.props.width;
        if (!width)
            width = 200;
    
        this.state = {
            height,
            width,
        }
    }

    componentDidMount() {
        this.plotPerformances();
      }
    
      componentDidUpdate(prevProps) {
        if (this.props.scenario._id !== prevProps.scenario._id) {
          d3.selectAll('#performancesPlot').selectAll("*").remove();
          this.plotPerformances();
        }
      }

    plotPerformances(){
        if(!this.props.scenario){
            return;
        }
        if(!this.props.scenario.trainAccuracies){
            return;
        }
        if(!this.props.scenario.valAccuracies){
            return;
        }
        d3.selectAll("#performancesPlot").selectAll("*").remove();
        let chart = d3.select('#performancesPlot');    
        let margin = { top: 5, left: 60, bottom: 15, right: 10 }

        let trainAccuracies = this.props.scenario.trainAccuracies;
        let valAccuracies = this.props.scenario.valAccuracies;
        
        let minTrainAcc = d3.min(trainAccuracies);
        let maxTrainAcc = d3.max(trainAccuracies);
        let minValAcc = d3.min(valAccuracies);
        let maxValAcc = d3.max(valAccuracies);
        let min = Math.min(minTrainAcc, minValAcc);
        let max = Math.max(maxTrainAcc, maxValAcc);

        let x = d3.scaleLinear()
            .domain([0, valAccuracies.length])
            .range([margin.left, this.state.width - margin.right])

        let y = d3.scaleLinear()
            .domain([min, max])
            // .domain([0, 1])
            .range([this.state.height - 2*margin.bottom, margin.top])

        let xAxis = g => g
            .attr("transform", `translate(0, ${this.state.height - 2*margin.bottom})`)
            .call(d3.axisBottom(x).ticks(Math.min(valAccuracies.length-1, 5)))

        let yAxis = g => g
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y).ticks(5));

        chart.append("g")
            .call(xAxis);

        chart.append("g")
            .call(yAxis);

        let trainAcc = d3.line()
            .x((d,i) => x(i))
            .y((d,i) => y(trainAccuracies[i]))

        let valAcc = d3.line()
            .x((d,i) => x(i))
            .y((d,i) => y(valAccuracies[i]))

        chart.append("path")
            .datum(trainAccuracies)
            .attr("stroke", "steelblue")
            .attr("stroke-width", "2px")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.7)
            .attr("d", trainAcc)

        chart.append("path")
            .datum(valAccuracies)
            .attr("stroke", "orange")
            .attr("stroke-width", "2px")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.7)
            .attr("d", valAcc)

        chart.append("text")
            .attr("text-anchor", "middle")
            .attr("x", margin.left + (this.state.width - margin.left - margin.right)/2)
            .attr("y", this.state.height - 5)
            .attr("font-size", "10")
            .text("Epochs");

        chart.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", `translate(${20}, ${(this.state.height - margin.top - margin.bottom)/2}) rotate(-90)`)
            .attr("font-size", "10")
            .text("Accuracies");

        // Legend
        chart.append("line")
            .attr("x1", this.state.width/2 + 2)
            .attr("y1", this.state.height + 10)
            .attr("x2", this.state.width/2 + 17)
            .attr("y2", this.state.height + 10)
            .attr("stroke-width", "2px")
            .attr("stroke", "steelblue")
        chart.append("line")
            .attr("x1", this.state.width/2 + 2)
            .attr("y1", this.state.height + 30)
            .attr("x2", this.state.width/2 + 17)
            .attr("y2", this.state.height + 30)
            .attr("stroke-width", "2px")
            .attr("stroke", "orange")

        chart.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "start")
            .attr("x", this.state.width/2 + 22)
            .attr("y", this.state.height + 12)
            .attr("font-size", "10")
            .text("Train acc");
        chart.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "start")
            .attr("x", this.state.width/2 + 22)
            .attr("y", this.state.height + 32)
            .attr("font-size", "10")
            .text("Val acc");
    }

    render() {
        let legendWidth = 70;
        return (
            <div>
                {/* <Typography>{"Accuracy over epochs"}</Typography> */}
                <svg id="performancesPlot" style={{height: this.state.height + 50, width: (this.state.width + legendWidth)}} />
            </div>
        );
    }
}