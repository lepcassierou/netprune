import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';

import ErrorIcon from '@material-ui/icons/Error';

import { InstanceCollection } from '/imports/db/InstanceCollection';

import Loading from '/imports/ui/Loading';

class InstanceDetails extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
    }
  }
  render() {
    if (!this.props.instance) {
      return (
        <Box height="100%">
          <Loading />
        </Box>
      )
    }
    return (
      <Box>
        <TableContainer component={Paper} variant="outlined" elevation={0}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Name</strong>
                </TableCell>
                <TableCell align="right">{this.props.instance.name.toString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell align="right">
                  <Chip 
                    label={this.props.instance.status.toUpperCase()}
                    icon={this.props.instance.status === 'busy'? 
                      <CircularProgress size={10} disableShrink/> : 
                      this.props.instance.status === 'stop'?
                        <ErrorIcon /> : null}
                    className={this.props.instance.status === 'ready'? 
                      'success' : 
                      this.props.instance.status === 'busy'?
                        'warning' : 'danger'}
                    disabled
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Model</strong>
                </TableCell>
                <TableCell align="right">{this.props.instance.modelName.toString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Dataset</strong>
                </TableCell>
                <TableCell align="right">{this.props.instance.datasetName.toString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Optimizer</strong>
                </TableCell>
                <TableCell align="right">{this.props.instance.optimizerName.toString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Loss</strong>
                </TableCell>
                <TableCell align="right">{this.props.instance.lossName.toString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Metric</strong>
                </TableCell>
                <TableCell align="right">{this.props.instance.metricName.toString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Epochs</strong>
                </TableCell>
                <TableCell align="right">{this.props.instance.epochs.toString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Batch size</strong>
                </TableCell>
                <TableCell align="right">{this.props.instance.batchSize.toString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Shuffle buffer size</strong>
                </TableCell>
                <TableCell align="right">{this.props.instance.shuffleBufferSize.toString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Validation split ratio</strong>
                </TableCell>
                <TableCell align="right">{this.props.instance.validationSplitRatio.toString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Last modified</strong>
                </TableCell>
                <TableCell align="right">{this.props.instance.version.toString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }
}

export default withTracker((params) => {
  Meteor.subscribe('instanceById', params.instanceId);

  return {
    instance: InstanceCollection.findOne(params.instanceId),
  }
})(InstanceDetails);
