import React from 'react';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import d3 from 'd3';

import MatrixRowSparklines from './MatrixRowSparklines';


function isMetricLocal(metric) {
	return metric === "m0";
}

function isLocalBidirectional() {
	return false;
}


function computeSelectionsUnion(tmpSelection, confirmedSelection) {
	let union = [];
	Object.keys(confirmedSelection).forEach(keyMetric => {
		confirmedSelection[keyMetric].forEach(filter => {
			if (!union.includes(filter)) {
				union.push(filter);
			}
		})
	});
	Object.keys(tmpSelection).forEach(keyMetric => {
		tmpSelection[keyMetric].forEach(filter => {
			if (!union.includes(filter)) {
				union.push(filter);
			}
		})
	});
	return union;
}


function limitFiltersToSelections(filters, unionSelections) {
	if (unionSelections.length > 0) {
		let selectedFilters = [];
		for (let i = 0; i < filters.length; i++) {
			if (unionSelections.includes(filters[i].id)) {
				selectedFilters.push(filters[i]);
			}
		}
		return selectedFilters;
	} else {
		return filters;
	}
}


function sortFiltersByMetric(filters, filtersInfo, metric = null, classA = -1, classB = -1) {
	let sortedFilters;

	if (metric === null) {
		sortedFilters = filters;
	} else if (isMetricLocal(metric)) {
		if (classA < 0 || classB < 0 || classA === classB) {
			sortedFilters = d3.sort(filters, (a, b) => d3.ascending(a.id, b.id));
		} else {
			if (isLocalBidirectional()) {
				sortedFilters = d3.sort(filters, (a, b) => d3.descending(Math.abs(a.classes[classA] - a.classes[classB]), Math.abs(b.classes[classA] - b.classes[classB])));
			} else {
				sortedFilters = d3.sort(filters, (a, b) => d3.descending(a.classes[classA] - a.classes[classB], b.classes[classA] - b.classes[classB]));
			}
		}
	} else {
		if (filtersInfo[metric].order === "ascending") {
			sortedFilters = d3.sort(filters, (a, b) => d3.ascending(a.metrics[metric], b.metrics[metric]));
		} else {
			sortedFilters = d3.sort(filters, (a, b) => d3.descending(a.metrics[metric], b.metrics[metric]));
		}
	}
	return sortedFilters;
}


function getAverageActivationsPerClass(sortedFilters) {
	let averageActivationsPerClass = [];
	if (sortedFilters.length > 0) {
		let nbClasses = sortedFilters[0].classes.length;
		for (let n = 0; n < nbClasses; n++) {
			let averageActivations = []
			for (let i = 0; i < sortedFilters.length; i++) {
				averageActivations.push({
					id: sortedFilters[i].id,
					value: sortedFilters[i].classes[n],
				});
			}
			averageActivationsPerClass.push(averageActivations);
		}
	}
	return averageActivationsPerClass;
}


function computeMinsAndMaxes(sortedFilters, metric = null) {
	let minDiag = d3.min(sortedFilters, d => d3.min(d.classes));
	let maxDiag = d3.max(sortedFilters, d => d3.max(d.classes));
	let minNonDiag;
	let maxNonDiag;

	if (isMetricLocal(metric)) {
		if (isLocalBidirectional()) {
			minNonDiag = 0;
			maxNonDiag = d3.max(sortedFilters, d => Math.abs(d3.max(d.classes) - d3.min(d.classes)));
		} else {
			minNonDiag = d3.min(sortedFilters, d => d3.min(d.classes) - d3.max(d.classes));
			maxNonDiag = d3.max(sortedFilters, d => d3.max(d.classes) - d3.min(d.classes));
		}
	} else {
		minNonDiag = d3.min(sortedFilters, d => d3.min(d.classes) - d3.max(d.classes));
		maxNonDiag = d3.max(sortedFilters, d => d3.max(d.classes) - d3.min(d.classes));
	}

	return {
		minDiag,
		maxDiag,
		minNonDiag,
		maxNonDiag,
	}
}


function extractPlotData(props, tmpSelection = {}, confirmedSelection = {}, metric = null, classA = -1, classB = -1) {
	if (!props || !props.filters) {
		return null;
	}

	let filters = props.filters;
	let filtersInfo = props.metrics;
	let unionOfSelectedFilters = computeSelectionsUnion(tmpSelection, confirmedSelection);
	let selectedFilters = limitFiltersToSelections(filters, unionOfSelectedFilters);
	let sortedFilters = sortFiltersByMetric(selectedFilters, filtersInfo, metric, classA, classB);
	let averageActivationsPerClass = getAverageActivationsPerClass(sortedFilters);
	let minsMaxes = computeMinsAndMaxes(sortedFilters, metric);

	return {
		averageActivationsPerClass,
		minsMaxes,
	};
}


class MatrixFirstCell extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let round = 2;
		let width = 70.8;
		let height = 36;
		let fontSize = 12;
		let angle = Math.atan(height / width) * 180 / Math.PI;
		let t = `translate(${width / 3 - 2}, ${.75 * height - 2}) rotate(${angle})`;
		if (this.props.fullScreen) {
			width = 152;
			height = 86;
			fontSize = 20;
			t = `translate(${width / 3 - 2}, ${.65 * height - 2}) rotate(${angle})`
		}
		return (
			<svg id={this.props.label} height={height} width={width}>
				<line
					x0={round}
					// x1={width - round}
					x1={width}
					y0={round}
					// y1={height - round}
					y1={height - 2*round}
					style={{ stroke: "black", strokeWidth: 1 }}
				/>
				<text
					x={0}
					y={0}
					// transform={`translate(${width / 3 - 2}, ${.75 * height - 2}) rotate(${angle})`}
					transform={t} // fullScreen
					style={{ fontSize: fontSize, textAnchor: "middle" }}
				>
					Baseline
				</text>

				<text
					x={0}
					y={0}
					transform={`translate(${2 * width / 3 - 2}, ${.3 * height + 3}) rotate(${angle})`}
					style={{ fontSize: fontSize, textAnchor: "middle" }}
				>
					Class
				</text>
			</svg>
		)
	}
}


export default class SparklinesMatrix extends React.Component {
	constructor(props) {
		super(props);

		const { averageActivationsPerClass, minsMaxes } = extractPlotData(this.props.layer.statistics, this.props.tmpSelection, this.props.confirmedSelection);

		let metric = Object.keys(this.props.layer.statistics.metrics)[0];

		let baseline = 0;
		let classN = 0;
		let numClasses = this.props.datasetLabelsList.length;

		this.state = {
			averageActivationsPerClass,
			minsMaxes,
			numClasses,

			metric,
			localMetric: {
				baseline,
				classN,
			},

			tmpSelection: this.props.tmpSelection, // { m1:[...], m2:[...], }
			confirmedSelection: this.props.confirmedSelection, // { m1:[...], m2:[...], }
		}

		this.classes = [];
		for (let i = 0; i < numClasses; ++i) {
			this.classes.push(i);
		}

		this.areSelectionsEqual = this.areSelectionsEqual.bind(this);
	}


	componentDidUpdate(prevProps) {
		let changed = false;
		let sameSelections = true;
		if (!!prevProps.metric
			&& !!this.props.metric
			&& prevProps.metric !== this.props.metric) {
			changed = true;
		} else if (!!prevProps.localMetric.baseline
			&& !!this.props.localMetric.baseline
			&& prevProps.localMetric.baseline !== this.props.localMetric.baseline) {
			changed = true;
		} else if (!!prevProps.localMetric.classN
			&& !!this.props.localMetric.classN
			&& prevProps.localMetric.classN !== this.props.localMetric.classN) {
			changed = true;
		} else if (!!prevProps.layer._id
			&& !!this.props.layer._id
			&& prevProps.layer._id !== this.props.layer._id) {
			changed = true;
		} else {
			if (!!prevProps.confirmedSelection && !!this.props.confirmedSelection) {
				let prevCs = prevProps.confirmedSelection;
				let newCs = this.props.confirmedSelection;
				sameSelections = sameSelections && this.areSelectionsEqual(prevCs, newCs);
			}
			if (!!prevProps.tmpSelection && !!this.props.tmpSelection) {
				let prevCs = prevProps.tmpSelection;
				let newCs = this.props.tmpSelection;
				sameSelections = sameSelections && this.areSelectionsEqual(prevCs, newCs);
			}
		}


		if (changed || !sameSelections) {
			let classA = this.props.localMetric.baseline;
			let classB = this.props.localMetric.classN;
			const { averageActivationsPerClass, minsMaxes } = extractPlotData(this.props.layer.statistics, this.props.tmpSelection, this.props.confirmedSelection, this.props.metric, classA, classB);
			this.setState({ averageActivationsPerClass, minsMaxes, localMetric: this.props.localMetric, tmpSelection: this.props.tmpSelection, confirmedSelection: this.props.confirmedSelection });
		}
	}


	areSelectionsEqual(prevCs, newCs) {
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
			// Single-side inclusion
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


	render() {
		let fontSiz = 12;
		if (!!this.props.fullScreen) {
			fontSiz = 20;
		}
		return (
			<React.Fragment>
				<Grid container
					justifyContent="center"
					alignItems='center'
					spacing={0}
					style={{ height: "100%" }}
				>
					<Grid item xs={1}>
						<Paper variant="outlined" style={{ fontSize: fontSiz, height: this.props.fullScreen ? 78 : 42 }}> 
							<Grid container
								justifyContent="center"
								alignItems='center'
								spacing={0}
								style={{ height: "100%" }}
							>
								<MatrixFirstCell
									fullScreen={this.props.fullScreen}
								/>
							</Grid>
						</Paper>
					</Grid>
					{this.classes.map((item) =>
						<Grid item xs={1} key={`head_${item}`}>
							<Paper variant="outlined" style={{ fontSize: fontSiz, textAlign: "center", height: this.props.fullScreen ? 78 : 42 }}>
								<Grid container
									justifyContent="center"
									alignItems='center'
									spacing={0}
									style={{ height: "100%" }}
								>
									{this.props.datasetLabelsList[item]}
								</Grid>
							</Paper> {/* "Class" */}
						</Grid>
					)}
				</Grid>

				{
					this.classes.map(index =>
						<MatrixRowSparklines
							index={index}
							key={index}
							datasetLabelsList={this.props.datasetLabelsList}
							metric={this.state.metric}
							averageActivationsPerClass={this.state.averageActivationsPerClass}
							minsMaxes={this.state.minsMaxes}
							numClasses={this.state.numClasses}
							localMetric={this.state.localMetric}
							height={this.props.fullScreen ? 78 : 42} //72 (fullScreen) // 42 (regular)
							width={this.props.fullScreen ? 151 : 75} //123 (fullScreen) // 75 (regular)
							fullScreen={this.props.fullScreen}
						/>
					)
				}
			</React.Fragment >
		);
	}
}
