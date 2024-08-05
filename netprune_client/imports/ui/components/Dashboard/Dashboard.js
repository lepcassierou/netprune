import React from 'react';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import AddIcon from '@material-ui/icons/Add';

import InstanceCreate from './InstanceCreate';
import InstanceList from './InstanceList';

export default class Dashboard extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      newInstanceDialogOpened: false,
    }

    this.toggleNewInstanceDialog = this.toggleNewInstanceDialog.bind(this);
    this.handleCreateNewInstance = this.handleCreateNewInstance.bind(this);
  }
  handleCreateNewInstance(name, model, dataset, optimizer,loss, metric, epochs, batchSize, shuffleBufferSize, validationSplitRatio) {
    Meteor.call('instances.insert', name, model, dataset, optimizer, loss, metric, epochs, batchSize, shuffleBufferSize, validationSplitRatio)
    this.toggleNewInstanceDialog()
  }
  toggleNewInstanceDialog() {
    this.setState((prevState) => {
      return {newInstanceDialogOpened: !prevState.newInstanceDialogOpened}
    })
  }
  render() {
    return (
      <Box>
        <Grid
          container
          spacing={1}
        >
          <Grid
            item
            xs={12}
          >
            {!this.state.newInstanceDialogOpened? 
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<AddIcon />}
                onClick={this.toggleNewInstanceDialog}
                disableElevation
              >
                Create a new instance
              </Button> :
              <InstanceCreate 
                valid={this.handleCreateNewInstance} 
                cancel={this.toggleNewInstanceDialog} 
              />
            }
          </Grid>
          <Grid
            item
            xs={12}
          >
            <Typography variant="h6">
              Instance list
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
          >
            <InstanceList />
          </Grid>
        </Grid>
      </Box>
    );
  }
}
