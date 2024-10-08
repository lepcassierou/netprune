import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import BlockIcon from '@material-ui/icons/Block';
import FlareIcon from '@material-ui/icons/Flare';

export default class InstanceCreate extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      datasets_list:[],
      models_list:[],
      optimizers_list:[],
      losses_list:[],
      metrics_list:[],
      name: '',
      dataset: '',
      model: '',
      optimizer: '',
      loss: '',
      metric: '',
      epochs: 1, 
      batchSize: 128, 
      validationSplitRatio: 0.1,
    }

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleDatasetChange = this.handleDatasetChange.bind(this)
    this.handleOptimizerChange = this.handleOptimizerChange.bind(this)
    this.handleLossChange = this.handleLossChange.bind(this)
    this.handleMetricChange = this.handleMetricChange.bind(this)
    this.handleEpochsChange = this.handleEpochsChange.bind(this);
    this.handleBatchSizeChange = this.handleBatchSizeChange.bind(this);
    this.handleValidationSplitRatioChange = this.handleValidationSplitRatioChange.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  componentDidMount(){
    Meteor.call('external.dataset_list', (error, response) => {
      if (error){
        console.log("Error retrieving dataset_list");
      }
      console.log("With tracker", response)
      this.setState({datasets_list: response.datasets, 
        models_list: response.models, 
        optimizers_list: response.optimizers,
        losses_list: response.losses,
        metrics_list: response.metrics,

        dataset: response.datasets[2],
        model: response.models[0],
        optimizer: response.optimizers[2],
        loss: response.losses[1],
        metric: response.metrics[4]
      })
    })
  }
  handleNameChange(e) {
    this.setState({ name: e.target.value })
  }
  handleDatasetChange(e) {
    this.setState({ dataset: e.target.value })
  }
  handleModelChange(e) {
    this.setState({ model: e.target.value })
  }
  handleOptimizerChange(e) {
    this.setState({ optimizer: e.target.value })
  }
  handleLossChange(e) {
    this.setState({ loss: e.target.value })
  }
  handleMetricChange(e) {
    this.setState({ metric: e.target.value })
  }
  handleEpochsChange(e) {
    this.setState({ epochs: Math.floor(Number(e.target.value)) })
  }
  handleBatchSizeChange(e) {
    this.setState({ batchSize: Math.floor(Number(e.target.value)) })
  }
  handleValidationSplitRatioChange(e) {
    this.setState({ validationSplitRatio: Number(e.target.value) })
  }
  handleCreate(e) {
    e.preventDefault();
    this.props.valid(this.state.name, this.state.model, this.state.dataset, this.state.optimizer,
      this.state.loss, this.state.metric, this.state.epochs, this.state.batchSize, this.state.validationSplitRatio)
  }
  handleCancel(e) {
    e.preventDefault();
    this.props.cancel()
  }
  //datasetName, optimizerName, lossName, metricName, epochs, batchSize, validationSplitRatio) {
  render() {
    let datasets_list = [];
    let models_list = [];
    let optimizers_list = [];
    let losses_list = [];
    let metrics_list = [];
    if (!!this.state.datasets_list){
      datasets_list = this.state.datasets_list;
    }
    if (!!this.state.models_list){
      models_list = this.state.models_list;
    }
    if (!!this.state.optimizers_list){
      optimizers_list = this.state.optimizers_list;
    }
    if (!!this.state.losses_list){
      losses_list = this.state.losses_list;
    }
    if (!!this.state.metrics_list){
      metrics_list = this.state.metrics_list;
    }
    console.log("RENDER", this.props);
    return (
      <Card variant="outlined">
        <CardHeader title="Create a new Instance" />
        <CardContent>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                size="small"
                variant="outlined"
                fullWidth
                label="Instance name"
                onChange={this.handleNameChange}
                value={this.state.name}
              />
            </Grid>
            <Grid item xs={12}><Divider variant="fullWidth" /></Grid>
            <Grid item xs={12}>
              <TextField
                select
                size="small"
                fullWidth
                label="Dataset name"
                value={this.state.dataset}
                onChange={this.handleDatasetChange}
                helperText="Select your dataset"
                variant="outlined"
              >
                {datasets_list.map((item) =>
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                size="small"
                fullWidth
                label="Model name"
                value={this.state.model}
                onChange={this.handleModelChange}
                helperText="Select your base model"
                variant="outlined"
              >
                {models_list.map((item) =>
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField
                select
                size="small"
                fullWidth
                label="Optimizer name"
                value={this.state.optimizer}
                onChange={this.handleOptimizerChange}
                helperText="Select your optimizer"
                variant="outlined"
              >
                {optimizers_list.map((item) =>
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField
                select
                size="small"
                fullWidth
                label="Loss function"
                value={this.state.loss}
                onChange={this.handleLossChange}
                helperText="Select your loss function"
                variant="outlined"
              >
                {losses_list.map((item) =>
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField
                select
                size="small"
                fullWidth
                label="Accuracy function"
                value={this.state.metric}
                onChange={this.handleMetricChange}
                helperText="Select your metric function"
                variant="outlined"
              >
                {metrics_list.map((item) =>
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField
                size="small"
                variant="outlined"
                type="number"
                fullWidth
                label="Epochs"
                onChange={this.handleEpochsChange}
                value={this.state.epochs}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                size="small"
                variant="outlined"
                type="number"
                fullWidth
                label="Batch Size"
                onChange={this.handleBatchSizeChange}
                value={this.state.batchSize}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                size="small"
                variant="outlined"
                type="number"
                fullWidth
                label="Validation Split Ratio"
                onChange={this.handleValidationSplitRatioChange}
                value={this.state.validationSplitRatio}
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Button 
            variant="contained" 
            className="success" 
            disableElevation
            startIcon={<FlareIcon />}
            onClick={this.handleCreate}
          >
            Create
          </Button>
          <Button 
            variant="contained" 
            disableElevation
            startIcon={<BlockIcon />}
            onClick={this.handleCancel}
          >
            Cancel
          </Button>
        </CardActions>
      </Card>
    )
  }
}

// export default withTracker(() => {
//   Meteor.call('external.dataset_list', function(error, result){
//     if (error){
//       console.log("Error retrieving dataset_list");
//     }
//     console.log("With tracker", result)
//     return {
//       result,
//     }
//   })
// })(InstanceCreate);