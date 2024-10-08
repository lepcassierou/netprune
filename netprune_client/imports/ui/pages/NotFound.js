import React from 'react';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import NavBar from '../NavBar';


class NotFound extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Container maxWidth={false} className="root-container">
        <NavBar title="To Do List" />
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item>
              <Typography variant="h2">
                Page Not Found
              </Typography>
            </Grid>
          </Grid>
      </Container>
    );
  }
}

export default NotFound;
