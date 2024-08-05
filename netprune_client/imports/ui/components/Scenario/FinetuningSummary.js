import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';

import BuildIcon from '@material-ui/icons/Build';
import RepeatIcon from '@material-ui/icons/Repeat';
import ShuffleIcon from '@material-ui/icons/Shuffle';

import { ScenarioCollection } from '/imports/db/ScenarioCollection';
import ScenarioCreate from './ScenarioCreate';


class FinetuningSummary extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      dialogBranchOpened: false,
    }

    this.toggleDialogBranch = this.toggleDialogBranch.bind(this);
    this.handleCreateBranch = this.handleCreateBranch.bind(this);
  }

  componentDidUpdate(prevProps){
    if(prevProps.scenarioId != this.props.scenarioId){
      this.setState({dialogBranchOpened: false});
    }
  }
  toggleDialogBranch() {
    this.setState((prevState) => {
     return {
      dialogBranchOpened: !prevState.dialogBranchOpened,
     }
    })
  }
  handleCreateBranch(name, epochs, isLeaf) {
    Meteor.call('scenarios.branchFrom', this.props.scenario._id, name, epochs, isLeaf);
    this.toggleDialogBranch();
  }

  render(){
    if (!this.props.scenario) {
      return (
        <span>
          Loading...
        </span>
      )
    }
    return (
      <Grid
        container
        spacing={1}
        direction="column"
        justifyContent="center"
      >
        {this.state.dialogBranchOpened ?
          <ScenarioCreate
            valid={this.handleCreateBranch}
            cancel={this.toggleDialogBranch}
          /> : null
        }
        <Grid
          item
          xs={12}
        >
          <Tooltip title="Create a new model based on the chosen strategy." arrow>
           <span>
            <Button
              variant = "contained"
              disableElevation
              fullWidth
              className="success"
              startIcon={<BuildIcon />}
              onClick = {this.toggleDialogBranch}
              disabled={this.props.scenario.status !== 'ready' || this.props.scenario.leaf}
            >
              Fine-tune
            </Button>
           </span>
          </Tooltip>
        </Grid>
        <Grid
          item
          xs={12}
        >
          {
            (this.props.scenario.status !== 'ready' || this.props.scenario.leaf) ?
              <Tooltip title="Performances evaluated on another set that were never seen by the model" arrow>
                <TableContainer component={Paper}>
                  <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell size="small">
                        <strong>Performances evaluation</strong>
                      </TableCell>
                      <TableCell size="small">{" "}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell size="small">
                        <strong>Accuracy</strong>
                      </TableCell>
                      <TableCell align="right" size="small">{(this.props.scenario.validation * 100).toFixed(2).toString() + " %"}</TableCell>
                    </TableRow>
                  </TableBody>
                  </Table>
                </TableContainer>
              </Tooltip> : null
          }
        </Grid>
      </Grid>
    )
  }
}

export default withTracker((params) => {
  Meteor.subscribe('scenarioById', params.scenarioId);

  return {
   scenario: ScenarioCollection.findOne(params.scenarioId),
  }
})(FinetuningSummary);
