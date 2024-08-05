import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import ReportIcon from '@material-ui/icons/Report';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';

import ScenarioConfMatSingleColor from '/imports/ui/components/Scenario/ScenarioConfMatSingleColor';

import { ScenarioCollection } from '/imports/db/ScenarioCollection';
import { InstanceCollection } from '/imports/db/InstanceCollection';
import PerformancesPlot from './PerformancesPlot';

import Loading from '/imports/ui/Loading';

class ScenarioDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogDeleteOpened: false,
      dialogStopOpened: false,
    }

    this.toggleDialogDelete = this.toggleDialogDelete.bind(this);
    this.toggleDialogStop = this.toggleDialogStop.bind(this);
    this.handleDeleteScenario = this.handleDeleteScenario.bind(this);
    this.handleStopScenario = this.handleStopScenario.bind(this);
    this.renderRoot = this.renderRoot.bind(this);
    this.renderNotRoot = this.renderNotRoot.bind(this);
  }

  toggleDialogDelete() {
    this.setState((prevState) => {
      return {
        dialogDeleteOpened: !prevState.dialogDeleteOpened,
      }
    })
  }

  toggleDialogStop() {
    this.setState((prevState) => {
      return {
        dialogStopOpened: !prevState.dialogStopOpened,
      }
    })
  }

  handleDeleteScenario() {
    Meteor.call('scenarios.remove', this.props.scenario._id)
    this.toggleDialogDelete()
    this.props.close()
  }

  handleStopScenario() {
    Meteor.call('scenarios.stop', this.props.scenario._id)
    this.toggleDialogStop()
  }

  renderRoot() {
    return (
      <TableBody>
        <TableRow>
          <TableCell size="small">
            <strong>Accuracy</strong>
          </TableCell>
          <TableCell align="right" size="small">{(this.props.scenario.accuracy * 100).toFixed(2).toString() + " %"}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell size="small">
            <strong> # Parameters </strong>
          </TableCell>
          <TableCell align="right" size="small">
            {
              ((this.props.scenario.networkSize < 1000000) ?
                (this.props.scenario.networkSize / 1000).toFixed(2) + "k" :
                (this.props.scenario.networkSize / 1000000).toFixed(2) + "M")
            }
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell size="small">
            <strong> FLOPs </strong>
          </TableCell>
          <TableCell align="right" size="small">
            {
              ((this.props.scenario.flops < 1000000) ?
                (this.props.scenario.flops / 1000).toFixed(2) + "k" :
                (this.props.scenario.flops / 1000000).toFixed(2) + "M")
            }
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  renderNotRoot() {
    let accDiff = ((this.props.scenario.accuracy - this.props.rootScenario.accuracy) * 100).toFixed(2);
    let sizeGain = ((this.props.scenario.sizeGain - this.props.rootScenario.sizeGain) / this.props.rootScenario.sizeGain * 100).toFixed(2);
    let modelParams = ((this.props.scenario.networkSize - this.props.rootScenario.networkSize) / this.props.rootScenario.networkSize * 100).toFixed(2);
    let flops = ((this.props.scenario.flops - this.props.rootScenario.flops) / this.props.rootScenario.flops * 100).toFixed(2);

    let paddingStyle = {
      paddingTop: 5,
      paddingBottom: 5,
    }
    return (
      <TableBody>
        <TableRow style={paddingStyle}>
          <TableCell size="small">
            <strong>Acc. (test)</strong>
          </TableCell>
          <TableCell align="right" size="small">{(this.props.scenario.accuracy * 100).toFixed(2).toString() + " % ("
            + ((accDiff >= 0) ? "+" : "") + accDiff + "% )"}</TableCell>
        </TableRow>
        <TableRow style={paddingStyle}>
          <TableCell size="small">
            <strong> # Parameters </strong>
          </TableCell>
          <TableCell align="right" size="small">
            {((modelParams > 0) ? "+" : "") + modelParams + " % (" +
              ((this.props.scenario.networkSize < 1000000) ?
                (this.props.scenario.networkSize / 1000).toFixed(2) + "k)" :
                (this.props.scenario.networkSize / 1000000).toFixed(2) + "M)")
            }
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell size="small">
            <strong> FLOPs </strong>
          </TableCell>
          <TableCell align="right" size="small">
            {((flops > 0) ? "+" : "") + flops + " % (" +
              ((this.props.scenario.flops < 1000000) ?
                (this.props.scenario.flops / 1000).toFixed(2) + "k)" :
                (this.props.scenario.flops / 1000000).toFixed(2) + "M)"
              )
            }
          </TableCell>
        </TableRow>
        {
          this.props.scenario.leaf ?
            <TableRow style={paddingStyle}>
              <TableCell size="small">
                <strong>Acc. (eval)</strong>
              </TableCell>
              <TableCell align="right" size="small">{(this.props.scenario.validation * 100).toFixed(2).toString() + " %"}</TableCell>
            </TableRow> 
            : null
        }
      </TableBody>
    );
  }

  render() {
    if (!this.props.scenario) {
      return (
        <Box height="100%">
          <Loading />
        </Box>
      )
    }
    return (
      <Box height="100%">
        {this.state.dialogDeleteOpened ?
          <DialogSimple
            className="danger"
            title="Delete scenario"
            content="You are about to permanently delete this scenario. Do you wish to continue?"
            icon={<DeleteIcon />}
            confirm="Yes, delete."
            continue={this.handleDeleteScenario}
            cancel={this.toggleDialogDelete}
          /> : null
        }
        {this.state.dialogStopOpened ?
          <DialogSimple
            className="danger"
            title="Stop training"
            content="You are about to irreversibly stop the training for this scenario. Do you really wish to proceed?"
            icon={<ReportIcon />}
            confirm="Yes, stop the training."
            continue={this.handleStopScenario}
            cancel={this.toggleDialogStop}
          /> : null
        }
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Grid
            item
            container
            justifyContent="center"
            alignItems="center"
            spacing={2}
            xs={4}
          >
            <Grid
              item
              xs={9}
            >
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  {
                    (!!this.props.rootScenario) ?
                      ((this.props.scenario.root) ? this.renderRoot() : this.renderNotRoot())
                      : null
                  }
                </Table>
              </TableContainer>
            </Grid>
            <Grid
              item
              xs={this.props.perfFullScreen ? 12 : 3}
            >
              <PerformancesPlot
                scenario={this.props.scenario}
              />
            </Grid>
          </Grid>
          <Grid
            item
            container
            justifyContent="center"
            alignItems="center"
            spacing={2}
            xs={this.props.perfFullScreen ? 12 : 8}
          >
            <Grid
              item
              xs={10}
            >
              {this.props.scenario.status === 'ready' ?
                <ScenarioConfMatSingleColor scenario={this.props.scenario} datasetLabelsList={this.props.datasetLabelsList} />
                : null
              }
            </Grid>
          </Grid>
        </Grid>
      </Box>
    );
  }
}

export default withTracker((params) => {
  Meteor.subscribe('scenarioById', params.scenarioId);
  const scenario = ScenarioCollection.findOne(params.scenarioId);

  Meteor.subscribe('instanceById', scenario.instanceId);
  const instance = InstanceCollection.findOne(scenario.instanceId);

  let instanceEdges = instance.scenarioEdges;
  let rootScenario = scenario;

  while (!rootScenario.root) {
    instanceEdges.forEach(sc => {
      if (sc.target == rootScenario._id) {
        rootScenario = ScenarioCollection.findOne(sc.source); // Sync
      }
    });
  }
  return {
    instance: instance,
    scenario: scenario,
    rootScenario: rootScenario,
  }
})(ScenarioDetails);
