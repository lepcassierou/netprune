import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import DialogSimple from '/imports/ui/components/DialogSimple';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import DeleteIcon from '@material-ui/icons/Delete';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import ReportIcon from '@material-ui/icons/Report';

import { ScenarioCollection } from '/imports/db/ScenarioCollection';

import ScenarioDetails from './ScenarioDetails';
import ScenarioUpdate from './ScenarioLoader';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box height="100%">
          {children}
        </Box>
      )}
    </div>
  );
}

class Scenario extends React.Component {
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
    this.handleClick = this.handleClick.bind(this);
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

  handleClick() {
    console.info('You clicked the Chip.');
    if(this.props.scenario.status == "stop"){
      Meteor.call('scenarios.redoTesting', this.props.scenario._id);
    }
  }

  render() {
    if (!this.props.scenario) {
      <Card variant="outlined" style={{height: '100%'}}>
        Loading...
      </Card>
    } else {
      return (
        <Card variant="outlined" style={{height: '100%'}}>
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
          <CardHeader
            title={
              <Typography variant="subtitle1">
                <strong>Performances View – <i>{this.props.currentScenarioName}</i></strong>
                &nbsp;
                <Chip
                  size="small"
                  label={this.props.scenario.status.toUpperCase()}
                  icon={this.props.scenario.status === 'busy' ?
                    <CircularProgress size={10} disableShrink /> :
                    this.props.scenario.status === 'stop' ?
                      <ErrorOutlineIcon /> : null}
                  className={this.props.scenario.status === 'ready' ?
                    'success' :
                    this.props.scenario.status === 'busy' ?
                      'warning' : 'danger'}
                  onClick={this.handleClick}
                />
              </Typography>
            }
            className='dense-action'
            action={
              <React.Fragment>
                {!this.props.scenario.root ?
                  <Tooltip title="Delete the scenario" arrow>
                    <span>
                      <IconButton
                        aria-label="delete the scenario"
                        variant="contained"
                        className="danger"
                        size="small"
                        onClick={this.toggleDialogDelete}
                        disabled={this.props.scenario.status === 'busy'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  : null
                }
                <Tooltip title="Stop the training" arrow>
                  <span>
                    <IconButton
                      aria-label="stop the training"
                      variant="contained"
                      className="danger"
                      size="small"
                      onClick={this.toggleDialogStop}
                      disabled={this.props.scenario.status !== 'busy'}
                    >
                      <ReportIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </React.Fragment>
            }
            style={{ padding: "0px", paddingLeft: "10px" }}
          >
          </CardHeader>
          <Box height="calc(100% - 28.5px)"
            style={{ overflowX: "hidden", overflowY: "hidden" }}
          >
            {this.props.scenario.status !== 'ready' ?
              <ScenarioUpdate scenarioId={this.props.scenario._id} />
              : null
            }
            <ScenarioDetails
              scenarioId={this.props.scenario._id}
              datasetLabelsList={this.props.datasetLabelsList}
              close={this.props.close}
              perfFullScreen={this.props.perfFullScreen}
            />
          </Box>
        </Card>
      );
    }
  }
}
/*
Accuracy (%) <i class="fas fa-bullseye"></i>
Loss (%) <i class="fas fa-level-down-alt"></i>
Size gain (%) <i class="fas fa-tachometer-alt"></i>
Network size (N) <i class="fas fa-weight"></i>

*/

export default withTracker((params) => {
  Meteor.subscribe('scenarioById', params.scenarioId);

  return {
    scenario: ScenarioCollection.findOne(params.scenarioId),
  }
})(Scenario);
