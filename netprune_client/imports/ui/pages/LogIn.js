import React, { useState } from 'react';
import {Meteor} from 'meteor/meteor';

import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import NavBar from '../NavBar';

class LogIn extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      username: '',
      password: '',
      error: '',
    }

    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(e) {
    e.preventDefault()
    Meteor.loginWithPassword(this.state.username, this.state.password, (error) => {
      if (error) {
        this.setState({ error: error.reason })
      } else {
        this.props.history.push('/')
      }
    })
  }
  handleChangePassword(e) {
    this.setState({ password: e.target.value })
  }
  handleChangeUsername(e) {
    this.setState({ username: e.target.value })
  }
  render() {
    return (
      <Container maxWidth={false} className="root-container">
        <NavBar bg="#34425a" title="To Do List" />
        <form className="login-form" onSubmit={this.handleSubmit}>
          <Grid
            container
            spacing={2}
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item xs={3}>
              <TextField
                size="small"
                variant="outlined"
                label="Username"
                type="text"
                required
                fullWidth
                onChange={this.handleChangeUsername}
                value={this.state.username}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                size="small"
                variant="outlined"
                label="Password"
                type="password"
                required
                fullWidth
                onChange={this.handleChangePassword}
                value={this.state.password}
              />
            </Grid>
            {this.state.error !== ''?
              <Grid item xs={3}>
                <Typography color="secondary" variant="caption">
                  {this.state.error}
                </Typography>
              </Grid>
              : null
            }
            <Grid item xs={2}>
              <Button
                fullWidth
                size="medium"
                variant="contained"
                color="primary"
                type="submit"
              >
                Log In
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    );
  }
}

export default LogIn;
