import React from 'react';
import { Route } from 'react-router-dom';
import { Switch } from 'react-router';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import NavBar from '../NavBar';
import Dashboard from '../components/Dashboard/Dashboard';
import Instance from '../components/Instance/Instance';

function NotFound() {
  return (
    <Grid
      container
      justifyContent="center"
    >
      <Grid item>
        <Typography variant="h4">
          Page Not Found
        </Typography>
      </Grid>
    </Grid>
  )
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contentStyle: { height: window.innerHeight - 64 }
    }
    this.onResize = this.onResize.bind(this);
  }
  componentDidMount() {
    window.addEventListener('resize', () => this.onResize())
  }
  onResize() {
    let contentStyle = { height: window.innerHeight - 64, width: window.innerWidth }
    this.setState({ contentStyle })
  }
  render() {
    return (
      <Container maxWidth={false} className="root-container">
        <NavBar title="NetPrune" bg="#34425a"/>
        <Container maxWidth={false} className="content-container" style={this.state.contentStyle}>
          <Switch>
            <Route exact path="/" component={Dashboard} />
            <Route path="/instance/:id" style={this.state.contentStyle} component={Instance} />
            <Route component={NotFound} />
          </Switch>
        </Container>
      </Container>
    )
  }
}

export default App;
