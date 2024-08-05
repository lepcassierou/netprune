import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import SyncProblemIcon from '@material-ui/icons/SyncProblem';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';

import ScenarioGraph from './ScenarioGraph';
import ModelView from '../Scenario/ModelView';
import Scenario from '../Scenario/Scenario';

import { InstanceCollection } from '/imports/db/InstanceCollection';
import FAVSMContainer from '../Layer/FAVSMContainer';

class Instance extends React.Component {
  constructor(props) {
    super(props);
    this.scenarioGraph = React.createRef()
    this.state = {
      newInstanceDialogOpened: false,
      currentScenarioId: '',
      currentLayerId: '',
      currentScenarioName: '',
      perfFullScreen: false,
    }

    this.toggleNewInstanceDialog = this.toggleNewInstanceDialog.bind(this);
    this.handleCreateNewInstance = this.handleCreateNewInstance.bind(this);
    this.openScenario = this.openScenario.bind(this);
    this.closeScenario = this.closeScenario.bind(this);
    this.openLayer = this.openLayer.bind(this);
    this.centerViewScenario = this.centerViewScenario.bind(this);
    this.redrawViewScenario = this.redrawViewScenario.bind(this);
  }


  handleCreateNewInstance(name, model) {
    Meteor.call('instances.insert', name, model)
    this.toggleNewInstanceDialog()
  }


  toggleNewInstanceDialog() {
    this.setState((prevState) => {
      return { newInstanceDialogOpened: !prevState.newInstanceDialogOpened }
    })
  }


  openScenario(ele) {
    this.setState({ currentScenarioId: ele._id, currentScenarioName: ele.name, currentLayerId: '' })
  }


  closeScenario() {
    this.setState({ currentScenarioId: '', currentLayerId: '' })
  }


  openLayer(ele) {
    this.setState({ currentLayerId: ele })
  }


  centerViewScenario() {
    this.scenarioGraph.current.centerView()
  }


  redrawViewScenario() {
    this.scenarioGraph.current.redrawView()
  }


  render() {
    let xs_scenario = 10;
    if(fullScreen){
      let fullScreen = false;
      xs_scenario = 12;
    }
    return (
      <Box height="100%">
        <Grid
          container
          spacing={1}
          style={{ height: "100%" }}
        >
          {/* Exploration Tree */}
          <Grid
            item
            xs={2}
            style={{ height: "100%" }}
          >
            <Card
              variant="outlined"
              style={{ height: "100%" }}>
              <CardHeader
                title={
                  <Typography variant="subtitle1">
                    <strong>Exploration Tree</strong>
                  </Typography>
                }
                className="dense-action"
                action={
                  <React.Fragment>
                    <Tooltip title="Center view" arrow>
                      <span>
                        <IconButton
                          aria-label="center the scenario"
                          variant="contained"
                          size="small"
                          onClick={this.centerViewScenario}
                        >
                          <ZoomOutMapIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Redraw graph" arrow>
                      <span>
                        <IconButton
                          aria-label="redraw the graph"
                          variant="contained"
                          size="small"
                          onClick={this.redrawViewScenario}
                        >
                          <SyncProblemIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </React.Fragment>
                }
                style={{ padding: "0px", paddingLeft: "10px" }}
              />
              <ScenarioGraph
                ref={this.scenarioGraph}
                instanceId={this.props.instanceId}
                open={this.openScenario}
              />
              {/* TODO: Replace that in case it does not work */}
              {/* <ExplorationTree
                ref={this.scenarioGraph}
                instanceId={this.props.instanceId}
                open={this.openScenario}
              /> */}
            </Card>
          </Grid>

          {/* Scenario */}
          {this.state.currentScenarioId !== '' ?
            <Grid
              item
              xs={xs_scenario}
              style={{ height: "100%" }}
            >
              <Grid
                container
                spacing={1}
                style={{ height: this.state.perfFullScreen ? "300%" : "40%" }}
              >
                {/* Performance View */}
                <Grid
                  item
                  xs={9}
                  style={{ height: "100%" }}
                >
                  <Scenario
                    scenarioId={this.state.currentScenarioId}
                    currentScenarioName={this.state.currentScenarioName}
                    open={this.openLayer}
                    close={this.closeScenario}
                    datasetLabelsList={this.props.datasetLabelsList}
                    perfFullScreen={this.state.perfFullScreen}
                  />
                </Grid>
                {/* Model View */}
                <Grid
                  item
                  xs={3}
                  style={{ height: "100%" }}
                >
                  <Card variant="outlined" style={{ height: "100%" }}>
                    <CardHeader
                      title={
                        <Typography variant="subtitle1">
                          <strong>Model View</strong>
                        </Typography>
                      }
                      className="dense-action"
                      action={
                        <React.Fragment>
                          <Tooltip title="Center view" arrow>
                            <span>
                              <IconButton
                                aria-label="center the scenario"
                                variant="contained"
                                size="small"
                                onClick={this.centerViewModel}
                              >
                                <ZoomOutMapIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Redraw graph" arrow>
                            <span>
                              <IconButton
                                aria-label="redraw the graph"
                                variant="contained"
                                size="small"
                                onClick={this.redrawViewModel}
                              >
                                <SyncProblemIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </React.Fragment>
                      }
                      style={{ padding: "0px", paddingLeft: "10px" }}
                    />
                    <ModelView
                      instanceId={this.props.instanceId}
                      scenarioId={this.state.currentScenarioId}
                      open={this.openLayer}
                    />
                  </Card>
                </Grid>
              </Grid>

              <Grid
                container
                spacing={1}
                style={{ height: this.state.perfFullScreen ? "300%" : "62%", paddingTop: "5px" }}
              >
                <Grid
                  item
                  xs={12}
                  style={{ height: "100%" }}
                >
                  <FAVSMContainer
                    layerId={this.state.currentLayerId}
                    datasetLabelsList={this.props.datasetLabelsList}
                  />
                </Grid>
              </Grid>
            </Grid>
            : null
          }
        </Grid>
      </Box >
    );
  }
}
export default withTracker((params) => {
  let instanceId = params.match.params.id;
  Meteor.subscribe('instanceById', instanceId);
  const instance = InstanceCollection.findOne(instanceId);
  let english = false;
  var datasetLabelsList = [];
  for (let i = 0; i < 10; ++i)
    datasetLabelsList.push(i);
  if (!!instance) {
    if (instance.datasetName == "fashion_mnist") {
      if(english){
        datasetLabelsList = ["T-shirt/top", "Trouser", "Pullover", "Dress", "Coat", "Sandal", "Shirt", "Sneaker", "Bag", "Ankle boot"];
      } else {
        datasetLabelsList = ["T-shirt", "Pantalon", "Pull", "Robe", "Manteau", "Sandale", "Chemise", "Basket", "Sac", "Bottine"];
      }
    } else if (instance.datasetName == "cifar10") {
      if(english){
        datasetLabelsList = ["Airplane", "Automobile", "Bird", "Cat", "Deer", "Dog", "Frog", "Horse", "Ship", "Truck"];
      } else {
        datasetLabelsList = ["Avion", "Voiture", "Oiseau", "Chat", "Cerf", "Chien", "Grenouille", "Cheval", "Bateau", "Camion"];
      }
    } else if (instance.datasetName == "cats_vs_dogs") {
      if(english){
        datasetLabelsList = ["Cat", "Dog"];
      } else {
        datasetLabelsList = ["Chat", "Chien"];
      }
    } else if (instance.datasetName == "leaks") {
      if(english){
        datasetLabelsList = ["Not leak", "Leak"];
      } else {
        datasetLabelsList = ["Intact", "Fuite"];
      }
    } else if (instance.datasetName == "pointcloud") {
      datasetLabelsList = ["0", "1", "2"];
    }
  }

  return {
    instanceId,
    datasetLabelsList,
  }
})(Instance);
