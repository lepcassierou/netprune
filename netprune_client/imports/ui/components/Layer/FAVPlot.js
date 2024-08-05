import React from 'react';
import PropTypes from 'prop-types';

import d3 from 'd3';


export default class FAVPlot extends React.Component {
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
			tmpSelection: this.props.tmpSelection, // { m1:[...], m2:[...], }
			confirmedSelection: this.props.confirmedSelection, // Only used to determine the color of a filter
		}

		this.areConfirmedSelectionsEqual = this.areConfirmedSelectionsEqual.bind(this);
		this.removeFAVPlot = this.removeFAVPlot.bind(this);
		this.drawFAVPlot = this.drawFAVPlot.bind(this);
		this.updateFAVPlot = this.updateFAVPlot.bind(this);
		this.brushStarted = this.brushStarted.bind(this);
		this.brushed = this.brushed.bind(this);
		this.brushEnded = this.brushEnded.bind(this);
		this.isFilterSelectedByMetric = this.isFilterSelectedByMetric.bind(this);
		this.isFilterSelectedByAnyMetric = this.isFilterSelectedByAnyMetric.bind(this);
		this.updateTmpSelection = this.updateTmpSelection.bind(this);
	}

	componentDidMount() {
		this.drawFAVPlot();
	}


	componentDidUpdate(prevProps) {
		// Selection has changed
		if (!!this.props.confirmedSelection) {
			let sameSelections;
			if (!!prevProps.confirmedSelection) {
				let prevCs = prevProps.confirmedSelection;
				let newCs = this.props.confirmedSelection;
				sameSelections = this.areConfirmedSelectionsEqual(prevCs, newCs);
			} else {
				sameSelections = false;
			}

			if (!sameSelections) {
				let confirmedSelection = this.props.confirmedSelection;
				this.setState({ tmpSelection: {}, confirmedSelection }, () => this.updateFAVPlot());
				return;
			}
		}

		let drawMode = 0; // 0: no draw, 1: redraw, 2: update draw
		if (prevProps.layerName !== this.props.layerName) {
			console.log("Redraw (Layer name)");
			drawMode = 1;
		}
		if (!!prevProps.averageActivations && !!this.props.averageActivations) {
			if (prevProps.averageActivations.length !== this.props.averageActivations.length) {
				console.log("Redraw (AverageActivations length)");
				drawMode = 1;
			}
		}
		if (!!prevProps.metric && !!this.props.metric && prevProps.metric !== this.props.metric) {
			console.log("Redraw (metric selected)");
			drawMode = 1;
		}
		if (!!prevProps.localMetric
			&& !!this.props.localMetric
			&& (prevProps.localMetric.baseline !== this.props.localMetric.baseline
				|| prevProps.localMetric.classN !== this.props.localMetric.classN)) {
			console.log("Redraw (localMetric parameters)");
			drawMode = 1;
		}
		if (!!prevProps.index && !!this.props.index && prevProps.index !== this.props.index) {
			console.log("Redraw (class plot)");
			drawMode = 1;
		}

		if (drawMode === 1) {
			this.removeFAVPlot();
			this.drawFAVPlot();
		}
	}


	areConfirmedSelectionsEqual(prevCs, newCs) {
		let sameSelections = true;
		let prevMetrics = Object.keys(prevCs);
		let newMetrics = Object.keys(newCs);
		if (prevMetrics.length !== newMetrics.length) {
			sameSelections = false;
		} else {
			let copyPrevMetrics = [...prevMetrics].sort();
			let copynewMetrics = [...newMetrics].sort();
			for (let i = 0; i < copyPrevMetrics.length; i++) {
				if (copyPrevMetrics[i] !== copynewMetrics[i]) {
					sameSelections = false;
					break;
				}
			}
		}
		if (sameSelections) {
			prevMetrics.forEach(metric => {
				if (sameSelections) {
					if (prevCs[metric].length !== newCs[metric].length) {
						sameSelections = false;
					} else {
						let prevFilters = [...prevCs[metric]].sort();
						let newFilters = [...newCs[metric]].sort();
						for (let i = 0; i < prevFilters.length; i++) {
							if (prevFilters[i] !== newFilters[i]) {
								sameSelections = false;
								break;
							}
						}
					}
				}
			});
		}
		return sameSelections;
	}


	isFilterSelectedByMetric(idFilter, objToCheck, metric) {
		if (metric in objToCheck) {
			if (!objToCheck[metric]) {
				return false;
			}
			return (objToCheck[metric].indexOf(idFilter) !== -1);
		}
		return false;
	}


	isFilterSelectedByAnyMetric(idFilter, objToCheck) {
		let found = false;
		let i = 0;
		let keys = Object.keys(objToCheck);
		while (!found && i < keys.length) {
			if (objToCheck[keys[i]].indexOf(idFilter) !== -1) {
				found = true;
			}
			i++;
		}
		return found;
	}


	removeFAVPlot() {
		let FAV = d3.select('#FAV_' + this.props.label);
		FAV.selectAll("*").remove();
	}


	drawFAVPlot() {
		let FAV = d3.select('#FAV_' + this.props.label);
		let margin = { top: 5, left: 50, bottom: 20, right: 15 };
		let yAxisShift = 3;
		let nbFilters = this.props.averageActivations.length;

		// create axis
		this.x = d3.scaleLinear()
			.domain([0, nbFilters]).nice()
			.range([this.margin.left, this.state.width - margin.right]);

		this.y = d3.scaleLinear()
			.domain([this.props.minsMaxes.minClasses, this.props.minsMaxes.maxClasses]).nice()
			.range([this.state.height - this.margin.bottom, this.margin.top]);

		let xAxis = g => g
			.attr("transform", `translate(0,${this.state.height - margin.bottom})`)
			.attr("id", `${this.props.label}_x`)
			.call(d3.axisBottom(this.x).ticks(Math.min(nbFilters - 1, 10)));

		FAV.append("g")
			.call(xAxis);


		// load data
		let circles = FAV.selectAll("circle")
			.data(this.props.averageActivations, (d, i) => i)
			.enter().append("circle");

		let metricLine = FAV.append("path");

		this.y2 = d3.scaleLinear()
			.domain([this.props.minsMaxes.minMetric, this.props.minsMaxes.maxMetric]).nice()
			.range([this.state.height - this.margin.bottom, this.margin.top]);


		let y2Axis = g => g
			.attr("transform", `translate(${margin.left - yAxisShift}, 0)`)
			.attr("id", `${this.props.label}_y2`)
			.call(d3.axisLeft(this.y2).ticks(5));

		FAV.append("g")
			.call(y2Axis);


		metricLine.datum(this.props.metricValues)
			.attr("id", `${this.props.label}_metricLine`)
			.attr("d", d3.line()
				.x((d, i) => this.x(i))
				.y((d, i) => this.y2(d.value)))
			.attr("stroke", "green")
			.attr("stroke-width", 3)
			.attr("fill", "none")


		// format elements
		circles.attr("cx", (d, i) => this.x(i))
			.attr("cy", (d, i) => { return this.y(d.value) })
			.attr('id', function (d) { return "filter_" + d.id })
			.attr("r", "2px")
			.style("fill", (d, i) => {
				if (this.isFilterSelectedByAnyMetric(this.props.averageActivations[i].id, this.state.tmpSelection)) {
					return 'red';
				}
				if (this.isFilterSelectedByAnyMetric(this.props.averageActivations[i].id, this.state.confirmedSelection))
					return 'orange';
				return 'steelblue';
			});

		// interactions
		const brush = d3.brushX()
			.extent([[margin.left - yAxisShift + 1, margin.top], [this.state.width, this.state.height - margin.bottom]])
			.on("start", this.brushStarted)
			.on("brush", this.brushed)
			.on("end", this.brushEnded);

		FAV.call(brush);
	}


	updateFAVPlot() {
		let FAV = d3.select('#FAV_' + this.props.label);
		let circles = FAV.selectAll("circle");
		circles.style("fill", (d, i) => {
			if (this.isFilterSelectedByAnyMetric(this.props.averageActivations[i].id, this.state.tmpSelection)) {
				return 'red';
			}
			if (this.isFilterSelectedByAnyMetric(this.props.averageActivations[i].id, this.state.confirmedSelection)) {
				return 'orange';
			}
			return 'steelblue';
		});
	}


	updateTmpSelection(selection = {}) {
		this.props.onUpdateTmpSelection(selection);
		this.setState({ tmpSelection: selection }, () => this.updateFAVPlot());
	}


	brushStarted(e) {
		// notice the other views to hide their brush
		d3.select('#FAV_' + this.props.label).select('rect[class=selection]').attr('fill', '#070');
		this.updateTmpSelection();
	}


	brushed(event) {
		if (!event)
			return;
		let { selection } = event;
		// selection exists
		if (!!selection) {
			let tmpSelection = {};
			const x0 = this.x.invert(selection[0]);
			const x1 = this.x.invert(selection[1]);
			for (let i = 0; i < this.props.averageActivations.length; i++) {
				if (i >= x0 && i <= x1) {
					if (!(this.props.metric in tmpSelection)) {
						tmpSelection[this.props.metric] = [];
					}
					if (tmpSelection[this.props.metric].indexOf(this.props.averageActivations[i].id) === -1) {
						tmpSelection[this.props.metric].push(this.props.averageActivations[i].id);
					}
				}
			}
			this.updateTmpSelection(tmpSelection);
		}
	}


	brushEnded(event) {
		// forward selection to the other views
		if (event.selection != null) {
			// this.props.updateSelection(this.props.index, this.state.tmpSelection);
		} else {
			this.updateTmpSelection();
			// this.props.updateSelection(this.props.index, this.state.tmpSelection);
		}
	}


	render() {
		return (
			<svg id={"FAV_" + this.props.label} style={{ height: this.state.height, width: this.state.width }} />
		);
	}
};

FAVPlot.propTypes = {
	onLeftClickNode: PropTypes.func,
	label: PropTypes.string,
	data: PropTypes.array,
}