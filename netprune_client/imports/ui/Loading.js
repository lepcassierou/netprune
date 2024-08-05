import React from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';

class Loading extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Grid container>
        <Grid item>
          <CircularProgress />
        </Grid>
      </Grid>
    )
  }
}

export default Loading;
