import React from 'react';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

import BlockIcon from '@material-ui/icons/Block';
import FlareIcon from '@material-ui/icons/Flare';

export default class InstanceCreate extends React.Component {
  constructor (props) {
    super(props);

    this.datasets = ['boston_housing', 'cifar100', 'imdb', 'reuters', 'cifar10', 'fashion_mnist', 'mnist', 'cats_vs_dogs', 'leaks', 'pointcloud']
    this.models = ['lenet5', 'lenet300-100', 'lenet_4_variant', 'vgg16', 'vgg16_cifar', 'vgg16_cifar_2fc', 'vgg19', 'resnet50', 'two-layer', 'cvsd_conv', 'custom', "vgg16_leaks", "pcednet"];
    this.optimizers = ['Adadelta', 'Adagrad', 'Adam', 'Adamax', 'Ftrl', 'Nadam', 'Optimizer', 'RMSprop', 'SGD']
    this.losses = ['BinaryCrossentropy', 'CategoricalCrossentropy', 'CategoricalHinge', 'CosineSimilarity',
      'Hinge', 'Huber', 'KLD', 'KLDivergence', 'LogCosh', 'Loss', 'MAE', 'MAPE', 'MSE', 'MSLE',
      'MeanAbsoluteError', 'MeanAbsolutePercentageError', 'MeanSquaredError', 'MeanSquaredLogarithmicError',
      'Poisson', 'Reduction', 'SparseCategoricalCrossentropy', 'SquaredHinge']
    this.metrics = ['AUC', 'Accuracy', 'BinaryAccuracy', 'BinaryCrossentropy', 'CategoricalAccuracy',
      'CategoricalCrossentropy', 'CategoricalHinge', 'CosineSimilarity', 'FalseNegatives', 'FalsePositives',
      'Hinge', 'KLD', 'KLDivergence', 'LogCoshError', 'MAE', 'MAPE', 'MSE', 'MSLE', 'Mean', 'MeanAbsoluteError',
      'MeanAbsolutePercentageError', 'MeanIoU', 'MeanRelativeError', 'MeanSquaredError',
      'MeanSquaredLogarithmicError', 'MeanTensor', 'Metric', 'Poisson', 'Precision', 'PrecisionAtRecall',
      'Recall', 'RecallAtPrecision', 'RootMeanSquaredError', 'SensitivityAtSpecificity',
      'SparseCategoricalAccuracy', 'SparseCategoricalCrossentropy', 'SparseTopKCategoricalAccuracy',
      'SpecificityAtSensitivity', 'SquaredHinge', 'Sum', 'TopKCategoricalAccuracy', 'TrueNegatives', 'TruePositives']
    this.state = {
      name: '',
      dataset: 'leaks',
      model: 'vgg16_leaks',
      optimizer: 'Adam',
      loss: 'CategoricalCrossentropy',
      metric: 'CategoricalAccuracy',
      epochs: 1, 
      batchSize: 128, 
      shuffleBufferSize: 1024, 
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
    this.handleShuffleBufferSizeChange = this.handleShuffleBufferSizeChange.bind(this);
    this.handleValidationSplitRatioChange = this.handleValidationSplitRatioChange.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
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
  handleShuffleBufferSizeChange(e) {
    this.setState({ shuffleBufferSize: Math.floor(Number(e.target.value)) })
  }
  handleValidationSplitRatioChange(e) {
    this.setState({ validationSplitRatio: Number(e.target.value) })
  }
  handleCreate(e) {
    e.preventDefault();
    this.props.valid(this.state.name, this.state.model, this.state.dataset, this.state.optimizer,
      this.state.loss, this.state.metric, this.state.epochs, this.state.batchSize,
      this.state.shuffleBufferSize, this.state.validationSplitRatio)
  }
  handleCancel(e) {
    e.preventDefault();
    this.props.cancel()
  }
  //datasetName, optimizerName, lossName, metricName, epochs, batchSize, shuffleBufferSize, validationSplitRatio) {
  render() {
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
                {this.datasets.map((item) =>
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
                {this.models.map((item) =>
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
                {this.optimizers.map((item) =>
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
                {this.losses.map((item) =>
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
                {this.metrics.map((item) =>
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
                label="Shuffle Buffer Size"
                onChange={this.handleShuffleBufferSizeChange}
                value={this.state.shuffleBufferSize}
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