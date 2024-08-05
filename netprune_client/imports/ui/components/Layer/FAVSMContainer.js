import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import Card from '@material-ui/core/Card';
import { CardContent } from '@material-ui/core';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { LayerCollection } from '/imports/db/LayerCollection';
import { FinetuningFilterCollection } from '/imports/db/FinetuningFilterCollection';

import FAV from '../Layer/FAV';
import SparklinesMatrix from '../Layer/SparklinesMatrix';


function areKeysEqual(prevS, newS) {
    let prevKeys = Object.keys(prevS);
    let newKeys = Object.keys(newS);
    if (prevKeys.length !== newKeys.length) {
        return false;
    }
    let prevKeysCopy = [...prevKeys].sort();
    let newKeysCopy = [...newKeys].sort();
    for (let i = 0; i < prevKeysCopy.length; i++) {
        if (prevKeysCopy[i] !== newKeysCopy[i]) {
            return false;
        }
    }
    return true;
}


function areSelectionsEqual(prevS, newS) {
    if (!areKeysEqual(prevS, newS)) {
        return false;
    }

    let metrics = Object.keys(prevS)
    for (let metric = 0; metric < metrics.length; metric++) {
        let prevFilters = prevS[metrics[metric]];
        let newFilters = newS[metrics[metric]];
        if (prevFilters.length !== newFilters.length) {
            return false;
        }
        let prevFiltersCopy = [...prevFilters].sort();
        let newFiltersCopy = [...newFilters].sort();
        for (let filter = 0; filter < prevFilters.length; filter++) {
            if (prevFiltersCopy[filter] !== newFiltersCopy[filter]) {
                return false;
            }
        }
    }
    return true;
}


class FAVSMContainer extends React.Component {
    constructor(props) {
        super(props);

        let baseline = 0;
        let classN = 0;

        this.state = {
            tmpSelection: {},
            selectionByLayer: this.props.finetuningFilters,
            metric: "m0",
            localMetric: {
                baseline,
                classN,
            },
            fullScreen: false,
        }

        this.handleUpdateTmpSelection = this.handleUpdateTmpSelection.bind(this);
        this.handleUpdateConfirmedSelection = this.handleUpdateConfirmedSelection.bind(this);
        this.handleMetricChange = this.handleMetricChange.bind(this);
        this.handleBaselineOrClassChange = this.handleBaselineOrClassChange.bind(this);
        this.saveConfirmedSelectionToServer = this.saveConfirmedSelectionToServer.bind(this);
    }


    componentDidUpdate(prevProps) {
        let shouldUpdate = false;
        if (!prevProps.layer && !!this.props.layer) {
            shouldUpdate = true;
        }
        if (!!prevProps.layer
            && !!this.props.layer
            && !!prevProps.layer._id
            && !!this.props.layer._id) {
            // Layer id changed
            if (prevProps.layer._id !== this.props.layer._id) {
                shouldUpdate = true;
            } else {
                // FinetuningFilters have been received
                if (!!this.props.finetuningFilters) {
                    if (!!prevProps.finetuningFilters) {
                        let prevLayerSelection = prevProps.finetuningFilters[prevProps.layer.name];
                        let newLayerSelection = this.props.finetuningFilters[this.props.layer.name];
                        if (!prevLayerSelection) {
                            prevLayerSelection = {};
                        }
                        if (!newLayerSelection) {
                            newLayerSelection = {};
                        }
                        shouldUpdate = !areSelectionsEqual(prevLayerSelection, newLayerSelection);
                    } else {
                        shouldUpdate = true;
                    }
                }
            }
        }
        if (shouldUpdate) {
            let selectionByLayer = this.props.finetuningFilters;
            this.setState({ tmpSelection: {}, selectionByLayer });
        }
    }


    handleUpdateTmpSelection(selection = {}) {
        this.setState({ tmpSelection: selection });
    }


    handleUpdateConfirmedSelection(selection = {}) {
        let confirmedSelection = this.state.selectionByLayer;
        confirmedSelection[this.props.layer.name] = selection;
        this.setState({ selectionByLayer: confirmedSelection, tmpSelection: {} }, () => {
            this.saveConfirmedSelectionToServer();
        });
    }


    handleMetricChange(metric) {
        this.setState({ metric });
    }


    handleBaselineOrClassChange(localMetricObj) {
        this.setState({ localMetric: localMetricObj });
    }


    saveConfirmedSelectionToServer() {
        Meteor.call('finetuning_filters.insertSelection',
            this.props.layer.instanceId,
            this.props.layer.scenarioId,
            null,
            this.state.selectionByLayer,

            (error, response) => {
                if (error) {
                    throw new Meteor.Error('Could not insert Finetuning filters selection.');
                }
            });
    }


    render() {
        if (!this.props.layer || !this.state.selectionByLayer) {
            return null;
        }

        let confirmedSelection = this.state.selectionByLayer[this.props.layer.name];
        if (!confirmedSelection) {
            confirmedSelection = {};
        }
        let xs_sm = 7;
        if (this.state.fullScreen) {
            xs_sm = 12;
        }
        return (
            <Grid
                container
                spacing={1}
                style={{ height: this.state.fullScreen ? "300%" : "100%" }}
            >
                {/* FAV */}
                < Grid
                    item
                    xs={5}
                    style={{ height: "100%" }
                    }
                >
                    <FAV
                        layer={this.props.layer}
                        datasetLabelsList={this.props.datasetLabelsList}
                        confirmedSelection={confirmedSelection}
                        style={{ height: "100%" }}
                        onUpdateTmpSelection={this.handleUpdateTmpSelection}
                        onUpdateConfirmedSelection={this.handleUpdateConfirmedSelection}
                        onMetricChange={this.handleMetricChange}
                        onBaselineOrClassChange={this.handleBaselineOrClassChange}
                    />
                </Grid >

                {/* Sparklines Matrix */}
                < Grid
                    item
                    xs={xs_sm}
                    style={{ height: "250%" }}
                >
                    <Card variant="outlined" style={{ height: "100%" }}>
                        <CardHeader
                            title={
                                <Typography variant="subtitle1">
                                    <strong>Sparklines Matrix</strong>
                                </Typography>
                            }
                            className="dense-action"
                            style={{ padding: "0px", paddingLeft: "10px" }}
                        />
                        <CardContent>
                            <Grid
                                container
                                spacing={1}
                            >
                                < Grid
                                    item
                                    xs={12}
                                    style={{ height: "100%" }}
                                >
                                    <SparklinesMatrix
                                        layer={this.props.layer}
                                        datasetLabelsList={this.props.datasetLabelsList}
                                        tmpSelection={this.state.tmpSelection}
                                        confirmedSelection={confirmedSelection}
                                        metric={this.state.metric}
                                        localMetric={this.state.localMetric}
                                        fullScreen={this.state.fullScreen}
                                    />
                                </Grid >
                            </Grid >
                        </CardContent>
                    </Card>
                </Grid >
            </Grid >
        );
    }
}

export default withTracker((params) => {
    Meteor.subscribe('layerById', params.layerId);
    const layer = LayerCollection.findOne(params.layerId);
    if (!layer) {
        return {
            layer
        }
    }
    Meteor.subscribe('ffByScenarioId', layer.scenarioId);
    const finetuningFilters = FinetuningFilterCollection.find({
        scenarioSrcId: layer.scenarioId,
        scenarioTrgId: null,
    }).fetch();

    let selection = {};

    finetuningFilters.forEach(element => {
        selection = element.selection;
    });
    return {
        layer: layer,
        finetuningFilters: selection,
    }
})(FAVSMContainer);
