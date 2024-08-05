import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import { ScenarioCollection } from '/imports/db/ScenarioCollection';


class ScenarioDetails extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
    }
  }
  render() {
    if (!this.props.scenario) {
      return (
        <Box height="100%">
          <Grid container>
            <Grid item>
              <CircularProgress disableShrink />
            </Grid>
          </Grid>
        </Box>
      )
    }
    let percent = 100 * this.props.scenario.progressStep / this.props.scenario.progressTotal;
    return (
      <Box>
        <Grid container
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item>
            <CircularProgress variant="determinate" value={percent} />
          </Grid>
          <Grid item>
            <Typography variant="h5">
              {percent.toFixed(2)} %
            </Typography>
          </Grid>
          { !this.props.scenario.message ? null :
          this.props.scenario.message.split('#').map((text) =>
            <Grid item key={text}>
              <Typography variant="h6">
                {text}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  }
}

export default withTracker((params) => {
  Meteor.subscribe('scenarioById', params.scenarioId);

  return {
    scenario: ScenarioCollection.findOne(params.scenarioId),
  }
})(ScenarioDetails);
