import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import BlockIcon from '@material-ui/icons/Block';
import CheckIcon from '@material-ui/icons/Check';

export default class DialogSimple extends React.Component {
  constructor (props) {
    super(props);
  }
  render() {
    return (
      <Dialog open>
        <DialogTitle>{this.props.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {this.props.content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained"
            startIcon={this.props.icon}
            onClick={this.props.continue} 
            className={this.props.className}
            disableElevation
          >
            {this.props.confirm}
          </Button>
          <Button 
            variant="contained"
            startIcon={<BlockIcon />}
            onClick={this.props.cancel}
            disableElevation
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}