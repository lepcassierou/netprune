import React from 'react';
import d3 from 'd3';

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';

import AddToQueueIcon from '@material-ui/icons/AddToQueue';
import HelpIcon from '@material-ui/icons/Help';
import RemoveFromQueueIcon from '@material-ui/icons/RemoveFromQueue';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';

import { Typography } from '@material-ui/core';

import FAVPlot from './FAVPlot';
import FAVMatrix from './FAVMatrix';


function isMetricLocal(metric) {
    return metric === "m0";
}

function isLocalBidirectional() {
    return false;
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


function getAverageActivations(sortedFilters, classToDisplay = 0) {
    let averageActivations = [];
    for (let i = 0; i < sortedFilters.length; i++) {
        averageActivations.push({
            id: sortedFilters[i].id,
            value: sortedFilters[i].classes[classToDisplay],
        });
    }
    return averageActivations;
}


function getMetricValues(sortedFilters, metric = null, classA = -1, classB = -1) {
    let metricValues = [];
    if (metric === null) {
        for (let i = 0; i < sortedFilters.length; i++) {
            metricValues.push({
                id: sortedFilters[i].id,
                value: 0,
            });
        }
    } else if (isMetricLocal(metric)) {
        if (classA < 0 || classB < 0 || classA === classB) {
            for (let i = 0; i < sortedFilters.length; i++) {
                metricValues.push({
                    id: sortedFilters[i].id,
                    value: 0,
                });
            }
        } else {
            if (isLocalBidirectional()) {
                for (let i = 0; i < sortedFilters.length; i++) {
                    metricValues.push({
                        id: sortedFilters[i].id,
                        value: Math.abs(sortedFilters[i].classes[classA] - sortedFilters[i].classes[classB]),
                    });
                }
            } else {
                for (let i = 0; i < sortedFilters.length; i++) {
                    metricValues.push({
                        id: sortedFilters[i].id,
                        value: sortedFilters[i].classes[classA] - sortedFilters[i].classes[classB],
                    });
                }
            }
        }
    } else {
        for (let i = 0; i < sortedFilters.length; i++) {
            metricValues.push({
                id: sortedFilters[i].id,
                value: sortedFilters[i].metrics[metric],
            });
        }
    }
    return metricValues;
}


function computeMinsAndMaxes(sortedFilters, metric = null, classA = -1, classB = -1) {
    let minClasses;
    let maxClasses;
    let minMetric;
    let maxMetric;

    let filtersMinOfClasses = [];
    let filtersMaxOfClasses = [];
    for (let i = 0; i < sortedFilters.length; i++) {
        filtersMinOfClasses.push(d3.min(sortedFilters[i].classes));
        filtersMaxOfClasses.push(d3.max(sortedFilters[i].classes));
    }
    minClasses = d3.min(filtersMinOfClasses);
    maxClasses = d3.max(filtersMaxOfClasses);

    if (isMetricLocal(metric)) {
        if (classA >= 0 && classB >= 0 && classA !== classB) {
            if (isLocalBidirectional()) {
                minMetric = d3.min(sortedFilters, d => Math.abs(d.classes[classA] - d.classes[classB]));
                maxMetric = d3.max(sortedFilters, d => Math.abs(d.classes[classA] - d.classes[classB]));
            } else {
                minMetric = d3.min(sortedFilters, d => d.classes[classA] - d.classes[classB]);
                maxMetric = d3.max(sortedFilters, d => d.classes[classA] - d.classes[classB]);
            }
        } else {
            minMetric = 0;
            maxMetric = 1;
        }
    } else {
        if (metric === null) {
            minMetric = 0;
            maxMetric = 1;
        } else {
            minMetric = d3.min(sortedFilters, d => d.metrics[metric]);
            maxMetric = d3.max(sortedFilters, d => d.metrics[metric]);
        }
    }

    return {
        minClasses,
        maxClasses,
        minMetric,
        maxMetric,
    }
}


function extractPlotData(props, metric = null, classToDisplay = 0, classA = -1, classB = -1) {
    if (!props || !props.filters) {
        return null;
    }

    let filters = props.filters;
    let filtersInfo = props.metrics;
    let sortedFilters = sortFiltersByMetric(filters, filtersInfo, metric, classA, classB);
    let averageActivations = getAverageActivations(sortedFilters, classToDisplay);
    let metricValues = getMetricValues(sortedFilters, metric, classA, classB);
    let minsMaxes = computeMinsAndMaxes(sortedFilters, metric, classA, classB);

    return {
        averageActivations,
        metricValues,
        minsMaxes,
    };
}


export default class FAVContent extends React.Component {
    constructor(props) {
        super(props);

        const { averageActivations, metricValues, minsMaxes } = extractPlotData(this.props.value);

        let metric = Object.keys(this.props.value.metrics)[0];

        let baseline = 0;
        let classN = 0;

        this.state = {
            averageActivations,
            metricValues,
            minsMaxes,
            metric,

            localMetric: {
                baseline,
                classN,
            },
            numClasses: this.props.value.filters[0].classes.length,

            currentClassPlot: 0,

            tmpSelection: {}, // { m1:[...], m2:[...], }
            confirmedSelection: (!this.props.confirmedSelection) ? {} : this.props.confirmedSelection, // { m1:[...], m2:[...], }
        }

        this.areConfirmedSelectionsEqual = this.areConfirmedSelectionsEqual.bind(this);
        this.updateConfirmedSelectionFromParent = this.updateConfirmedSelectionFromParent.bind(this);
        this.handlePrevious = this.handlePrevious.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handleMetricChange = this.handleMetricChange.bind(this);
        this.handleBaselineOrClassChange = this.handleBaselineOrClassChange.bind(this);
        this.handleUpdateTmpSelection = this.handleUpdateTmpSelection.bind(this);
        this.handleUpdateConfirmedSelection = this.handleUpdateConfirmedSelection.bind(this);
        this.confirmCurrentSelection = this.confirmCurrentSelection.bind(this);
        this.removeFromSelection = this.removeFromSelection.bind(this);
        this.resetSelection = this.resetSelection.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (!!prevProps.layerName
            && !!this.props.layerName
            && prevProps.layerName !== this.props.layerName
            && !!this.props.value) {

            const { averageActivations, metricValues, minsMaxes } = extractPlotData(this.props.value);
            let metric = Object.keys(this.props.value.metrics)[0];

            let baseline = 0;
            let classN = 0;
            let currentClassPlot = 0;

            let confirmedSelection = this.props.confirmedSelection;
            this.setState({ confirmedSelection, averageActivations, metricValues, minsMaxes, metric, currentClassPlot, localMetric: { baseline, classN } });
            return;
        }
        if (!!prevProps.confirmedSelection && !!this.props.confirmedSelection) {
            let prevCs = prevProps.confirmedSelection;
            let newCs = this.props.confirmedSelection;
            let sameSelections = this.areConfirmedSelectionsEqual(prevCs, newCs);
            if (!sameSelections) {
                this.updateConfirmedSelectionFromParent();
                return;
            }
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
            for(let i = 0; i<copyPrevMetrics.length; i++){
                if(copyPrevMetrics[i] !== copynewMetrics[i]){
                    sameSelections = false;
                    break;
                }
            }
        } 
        if(sameSelections){
            // Single-side inclusion
            prevMetrics.forEach(metric => {
                if(sameSelections){
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


    updateConfirmedSelectionFromParent() {
        let confirmedSelection = (!this.props.confirmedSelection) ? {} : this.props.confirmedSelection;
        this.setState({ tmpSelection: {}, confirmedSelection });
    }


    handlePrevious() {
        let currentPlot = this.state.currentClassPlot;
        currentPlot--;
        if (currentPlot >= 0 && currentPlot < this.state.numClasses) {
            const { averageActivations, metricValues, minsMaxes } = extractPlotData(this.props.value, this.state.metric, currentPlot, this.state.localMetric.baseline, this.state.localMetric.classN);
            this.setState({ currentClassPlot: currentPlot, averageActivations, metricValues, minsMaxes, tmpSelection: {} });
        }
    }


    handleNext() {
        let currentPlot = this.state.currentClassPlot;
        currentPlot++;
        if (currentPlot >= 0 && currentPlot < this.state.numClasses) {
            const { averageActivations, metricValues, minsMaxes } = extractPlotData(this.props.value, this.state.metric, currentPlot, this.state.localMetric.baseline, this.state.localMetric.classN);
            this.setState({ currentClassPlot: currentPlot, averageActivations, metricValues, minsMaxes, tmpSelection: {} });
        }
    }

    handleMetricChange(e) {
        let metric = e.target.value;
        if (isMetricLocal(metric)) {
            const { averageActivations, metricValues, minsMaxes } = extractPlotData(this.props.value, metric, this.state.currentClassPlot, this.state.localMetric.baseline, this.state.localMetric.classN);
            this.setState({ averageActivations, metricValues, minsMaxes, metric, tmpSelection: {} });
        } else {
            const { averageActivations, metricValues, minsMaxes } = extractPlotData(this.props.value, metric, this.state.currentClassPlot);
            this.setState({ averageActivations, metricValues, minsMaxes, metric, tmpSelection: {} });
        }
        this.props.onMetricChange(metric);
    }


    handleBaselineOrClassChange(e) {
        let name = e.target.name;
        let value = e.target.value;
        let qual = {
            baseline: this.state.localMetric.baseline,
            classN: this.state.localMetric.classN,
        }
        qual[name] = value;

        const { averageActivations, metricValues, minsMaxes } = extractPlotData(this.props.value, this.state.metric, this.state.currentClassPlot, parseInt(qual['baseline'], 10), parseInt(qual['classN'], 10));
        this.setState({ averageActivations, metricValues, minsMaxes, localMetric: qual, tmpSelection: {} });
        this.props.onBaselineOrClassChange(qual);
    }


    handleUpdateTmpSelection(selection = {}) {
        this.props.onUpdateTmpSelection(selection);
        this.setState({ tmpSelection: selection });
    }


    handleUpdateConfirmedSelection(selection = {}) {
        this.props.onUpdateConfirmedSelection(selection);
        this.setState({ confirmedSelection: selection, tmpSelection: {} });
    }


    confirmCurrentSelection() {
        let confirmedSelection = this.state.confirmedSelection;
        let tmpSelection = this.state.tmpSelection;
        Object.keys(tmpSelection).forEach(metric => {
            if (!(metric in confirmedSelection)) {
                confirmedSelection[metric] = [];
                tmpSelection[metric].forEach(filter => {
                    confirmedSelection[metric].push(filter);
                });
            } else {
                tmpSelection[metric].forEach(filter => {
                    if (confirmedSelection[metric].indexOf(filter) === -1) {
                        confirmedSelection[metric].push(filter);
                    }
                });
            }
        });
        this.handleUpdateConfirmedSelection(confirmedSelection);
    }


    removeFromSelection() {
        let confirmedSelection = this.state.confirmedSelection; // { m1:[...], m2:[...], }
        let tmpSelection = this.state.tmpSelection;
        Object.keys(tmpSelection).forEach(keyMetric => {
            tmpSelection[keyMetric].forEach(filter => {
                Object.keys(confirmedSelection).forEach(metricConfirmed => {
                    let index = confirmedSelection[metricConfirmed].indexOf(filter);
                    if (index !== -1) {
                        confirmedSelection[metricConfirmed].splice(index, 1);
                    }
                })
            });
        });
        this.handleUpdateConfirmedSelection(confirmedSelection);
    }


    resetSelection() {
        this.handleUpdateConfirmedSelection();
    }


    render() {
        let description = "";
        let metricName = "";
        Object.keys(this.props.value.metrics).forEach(key => {
            if (key == this.state.metric) {
                description = this.props.value.metrics[key].desc;
                metricName = this.props.value.metrics[key].title;
            }
        });
        return (
            <Box height="100%">
                <Grid
                    container
                    direction="row"
                    justifyContent="center"
                    alignItems="stretch"
                    spacing={1}
                    style={{ height: "100%" }}
                >
                    <Grid
                        item
                        xs={12}
                        style={{ height: "50%" }}
                    >
                        <Grid
                            container
                            alignItems="flex-start"
                            justifyContent="flex-start"
                        >
                            <Grid item xs={6}>
                                <TextField
                                    select
                                    size="small"
                                    fullWidth
                                    label="Metric name"
                                    value={this.state.metric}
                                    onChange={this.handleMetricChange}
                                    helperText="Select a different metric to arrange the filters according to another importance score"
                                    variant="outlined"
                                >
                                    {Object.keys(this.props.value.metrics).filter(function (metricNameToFilter) { // For demo
                                        return metricNameToFilter !== "m3"; // BoWV

                                    }).map((key) =>
                                        <MenuItem key={key} value={key}>
                                            <React.Fragment>
                                                {this.props.value.metrics[key].title}
                                            </React.Fragment>
                                        </MenuItem>
                                    )}
                                </TextField>
                            </Grid>

                            <Grid item xs={1}>
                                <Tooltip title={description} placement='right' arrow>
                                    <IconButton
                                        className="selection"
                                        aria-label={description}
                                    >
                                        <HelpIcon />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                            {metricName == "None" || metricName == "Class Pairwise Difference" || metricName == "Qualitative" ?
                                <Grid container spacing={2} item xs={5}>
                                    <Grid item xs={4}>
                                        <TextField
                                            id="standard-number"
                                            label="Baseline"
                                            name="baseline"
                                            type="number"
                                            value={this.state.localMetric['baseline']}
                                            onChange={this.handleBaselineOrClassChange}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            id="standard-number"
                                            label="Class"
                                            name="classN"
                                            type="number"
                                            value={this.state.localMetric['classN']}
                                            onChange={this.handleBaselineOrClassChange}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                </Grid> :
                                null}
                        </Grid>

                        {/* Activation Charts */}
                        <Grid
                            key={`class_${this.state.currentClassPlot}`}
                            container
                            direction="row"
                            justifyContent="space-evenly"
                            alignItems="center"
                        >
                            <Grid
                                item
                                xs={2}
                            >
                                <Button
                                    variant="contained"
                                    disableElevation
                                    disabled={this.state.currentClassPlot === 0}
                                    onClick={this.handlePrevious}
                                >
                                    {"<"}
                                </Button>
                            </Grid>
                            <Grid
                                item
                                xs={8}
                            >
                                <FAVPlot
                                    layerName={this.props.layerName}
                                    label={`class_${this.state.currentClassPlot}`}
                                    index={this.state.currentClassPlot}
                                    height={150} // 150
                                    width={400} // 300
                                    averageActivations={this.state.averageActivations}
                                    metricValues={this.state.metricValues}
                                    minsMaxes={this.state.minsMaxes}
                                    metric={this.state.metric}
                                    localMetric={this.state.localMetric}
                                    tmpSelection={{}}
                                    confirmedSelection={this.state.confirmedSelection}
                                    onUpdateTmpSelection={this.handleUpdateTmpSelection}
                                />
                            </Grid>
                            <Grid
                                item
                                xs={2}
                            >
                                <Button
                                    variant="contained"
                                    disableElevation
                                    disabled={this.state.currentClassPlot === this.state.numClasses - 1}
                                    onClick={this.handleNext}
                                >
                                    {">"}
                                </Button>
                            </Grid>
                            <Grid
                                item
                                xs={12}>
                                <Typography variant="body1" align="center">Class {this.state.currentClassPlot} ({this.props.datasetLabelsList[this.state.currentClassPlot]})</Typography>
                            </Grid>
                            <Grid
                                item
                                xs={6}
                            >
                                <Tooltip title="Apply current selection" arrow>
                                    <IconButton
                                        className="selection"
                                        aria-label="Apply current selection"
                                        onClick={this.confirmCurrentSelection}
                                    >
                                        <AddToQueueIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Remove current selection from metric" arrow>
                                    <IconButton
                                        aria-label="Remove current selection"
                                        onClick={this.removeFromSelection}
                                    >
                                        <RemoveFromQueueIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Reset selection" arrow>
                                    <IconButton
                                        className="danger"
                                        aria-label="Reset selection"
                                        onClick={this.resetSelection}
                                    >
                                        <SettingsBackupRestoreIcon />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        style={{ height: "50%" }}
                    >
                        <FAVMatrix
                            idCss={"FAVMatrix"}
                            metricsList={this.props.value.metrics}
                            height={200} // 210 // 175
                            width={660} //1130 // 753
                            value={this.state.averageActivations}
                            confirmedSelection={this.state.confirmedSelection}
                        />
                    </Grid>
                </Grid>
            </Box >
        );
    }
}