import React from 'react';

import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';

class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }
  render () {
    return (
      <AppBar  position="sticky">
        <Toolbar>
          <IconButton edge="start" href="/">
            <img src="/Logo_NetPrune3D.png" alt="logo" width="60px" />
          </IconButton>
          <Typography edge="start" variant="h5" style={{ flexGrow: 1}}>
            {this.props.title}
          </Typography>
        </Toolbar>
      </AppBar>
    )
  }
}

export default NavBar;
