import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import { ScenarioCollection } from '/imports/db/ScenarioCollection';

import BuildIcon from '@material-ui/icons/Build';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import FAVContent from './FAVContent';
import ScenarioCreate from '../Scenario/ScenarioCreate';


class FAV extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tmpSelection: {},
            confirmedSelection: this.props.confirmedSelection,

            dialogBranchOpened: false,
        }

        this.areConfirmedSelectionsEqual = this.areConfirmedSelectionsEqual.bind(this);
        this.handleCreateBranch = this.handleCreateBranch.bind(this);
        this.toggleDialogBranch = this.toggleDialogBranch.bind(this);
        this.updateConfirmedSelectionFromParent = this.updateConfirmedSelectionFromParent.bind(this);
        this.handleUpdateTmpSelection = this.handleUpdateTmpSelection.bind(this);
        this.handleUpdateConfirmedSelection = this.handleUpdateConfirmedSelection.bind(this);
        this.handleMetricChange = this.handleMetricChange.bind(this);
        this.handleBaselineOrClassChange = this.handleBaselineOrClassChange.bind(this);
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
                this.updateConfirmedSelectionFromParent();
                return;
            }
        }

        // Layer id changed
        if (!!prevProps.layer
            && !!this.props.layer
            && !!prevProps.layer._id
            && !!this.props.layer._id) {
            if (prevProps.layer._id != this.props.layer._id) {
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


    toggleDialogBranch() {
        this.setState((prevState) => {
            return {
                dialogBranchOpened: !prevState.dialogBranchOpened,
            }
        })
    }


    updateConfirmedSelectionFromParent() {
        let confirmedSelection = this.props.confirmedSelection;
        this.setState({ tmpSelection: {}, confirmedSelection });
    }


    handleUpdateTmpSelection(selection = {}) {
        this.props.onUpdateTmpSelection(selection);
        this.setState({ tmpSelection: selection });
    }


    handleUpdateConfirmedSelection(selection = {}) {
        this.props.onUpdateConfirmedSelection(selection);
        this.setState({ confirmedSelection: selection, tmpSelection: {} });
    }


    handleMetricChange(metric) {
        this.props.onMetricChange(metric);
    }


    handleBaselineOrClassChange(localMetricObj) {
        this.props.onBaselineOrClassChange(localMetricObj);
    }

    handleCreateBranch(name, epochs, isLeaf) {
        Meteor.call('scenarios.branchFrom', this.props.scenario._id, name, epochs, isLeaf);
        this.toggleDialogBranch();
    }


    render() {
        if (!this.props.layer) {
            return null;
        }
        return (
            <Card variant="outlined" style={{ height: "100%" }}>
                <CardHeader
                    title={
                        <Typography variant="subtitle1">
                            {!!this.props.layer ?
                                <strong>Filters Activation view ({this.props.layer.name})</strong>
                                : <strong>Filters Activation view</strong>
                            }
                        </Typography>
                    }
                    className="dense-action"
                    action={
                        <React.Fragment>
                            <Tooltip title="Create a new model based on the chosen strategy." arrow>
                                <span>
                                    <Button
                                        variant="contained"
                                        disableElevation
                                        fullWidth
                                        className="success"
                                        startIcon={<BuildIcon />}
                                        onClick={this.toggleDialogBranch}
                                        disabled={this.props.scenario.status !== 'ready' || this.props.scenario.leaf}
                                    >
                                        Fine-tune
                                    </Button>
                                </span>
                            </Tooltip>
                        </React.Fragment>
                    }
                    style={{ padding: "0px", paddingLeft: "10px" }}
                />
                <CardContent>
                    <Grid
                        container
                        spacing={1}
                        style={{ height: this.state.perfFullScreen ? "300%" : "61%", paddingTop: "5px" }}
                    >
                        {/* FAV */}
                        <Grid
                            item
                            xs={12}
                            style={{ height: "100%" }}
                        >
                            <FAVContent
                                layerName={this.props.layer.name}
                                value={this.props.layer.statistics}
                                confirmedSelection={this.state.confirmedSelection}
                                datasetLabelsList={this.props.datasetLabelsList}
                                onUpdateTmpSelection={this.handleUpdateTmpSelection}
                                onUpdateConfirmedSelection={this.handleUpdateConfirmedSelection}
                                onMetricChange={this.handleMetricChange}
                                onBaselineOrClassChange={this.handleBaselineOrClassChange}
                            />
                        </Grid>
                    </Grid>
                    <Grid
                        container
                    >
                        {this.state.dialogBranchOpened ?
                            <ScenarioCreate
                                valid={this.handleCreateBranch}
                                cancel={this.toggleDialogBranch}
                            /> : null
                        }
                    </Grid>
                </CardContent>
            </Card>

        )
    }
}

export default withTracker((params) => {
    if (!params.layer) {
        return "";
    }
    Meteor.subscribe('scenarioById', params.layer.scenarioId);
    const scenario = ScenarioCollection.findOne(params.layer.scenarioId);
    if (!scenario) {
        return "";
    }

    return {
        scenario,
    }
})(FAV);