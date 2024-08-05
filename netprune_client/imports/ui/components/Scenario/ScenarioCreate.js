import React from 'react';

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';

import AddCircleIcon from '@material-ui/icons/AddCircle';
import BlockIcon from '@material-ui/icons/Block';
import FlareIcon from '@material-ui/icons/Flare';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';

export default class ScenarioCreate extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      name: '',
      epochs: 10,
      locked: false,
    }

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleEpochsChange = this.handleEpochsChange.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleLock = this.handleLock.bind(this);
  }
  handleNameChange(e) {
    this.setState({ name: e.target.value });
  }
  handleEpochsChange(e){
    this.setState({epochs: Math.floor(Number(e.target.value))});
  }
  handleCreate(e) {
    e.preventDefault();
    this.props.valid(this.state.name, this.state.epochs, this.state.locked);
  }
  handleCancel(e) {
    e.preventDefault();
    this.props.cancel();
  }
  handleLock(e){
    e.preventDefault();
    this.setState({locked: !this.state.locked});
  }
  render() {
    return (
      <Dialog open onClose={this.handleCancel}>
        <DialogTitle>Apply filters to the current model</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This operation will retrain the current model using the specific filters selected for each layer.
          </DialogContentText>
          <Grid container spacing={1} justifyContent="center" alignItems="flex-start">
            <Grid item xs={7}>
              <TextField
                size="small"
                variant="outlined"
                fullWidth
                label="Scenario name"
                onChange={this.handleNameChange}
                value={this.state.name}
              />
            </Grid>
            <Grid item xs={5}>
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
            <Grid item xs={12}>
              <Tooltip title="Enabling this action will forbid the application of further fine-tuning operations on the resulting model. The other models will not be affected." arrow>
                <FormControlLabel
                  control={
                    <Checkbox
                      icon={<LockOpenIcon />}
                      checkedIcon={<LockIcon />}
                      name="checkedH"
                      checked={this.state.locked}
                      onClick={this.handleLock}
                      className={this.state.locked? "danger" : ""}
                    />
                  }
                  label="Lock model and run against the evaluation dataset?"
                />
              </Tooltip>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            className="success"
            disableElevation
            startIcon={<AddCircleIcon />}
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
        </DialogActions>
      </Dialog>
    )
  }
}
