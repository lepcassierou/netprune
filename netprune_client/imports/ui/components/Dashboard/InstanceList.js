import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import DeleteIcon from '@material-ui/icons/Delete';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import { InstanceCollection } from '/imports/db/InstanceCollection';

import DialogSimple from '../DialogSimple';
import InstanceDetails from './InstanceDetails';

class InstanceList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentInstance: '',
      dialogDeleteOpened: false,
    }
    this.toggleDetails = this.toggleDetails.bind(this);
  }
  deleteInstance(id) {
    Meteor.call('instances.remove', id)
    this.toggleDialogDelete('')
  }
  toggleDetails(inst) {
    this.setState((prevState) => {
      if (prevState.currentInstance === inst) {
        return { currentInstance: '' }
      }
      return { currentInstance: inst }
    })
  }
  toggleDialogDelete(inst) {
    this.setState((prevState) => {
      return {
        currentInstance: inst,
        dialogDeleteOpened: !prevState.dialogDeleteOpened,
      }
    })
  }
  render() {
    if (!this.props.instances) {
      return (
        null
      );
    }
    if (this.props.instances.length === 0) {
      return (
        <Box>
          <Typography variant="body1" color="textSecondary">
            <em>There are no recorded instances.</em>
          </Typography>
        </Box>
      );
    }
    return (
      <Box>
        {this.state.dialogDeleteOpened ?
          <DialogSimple
            className="danger"
            title="Delete instance"
            content="You are about to permanently delete this instance. Do you wish to continue?"
            icon={<DeleteIcon />}
            confirm="Yes, delete."
            continue={() => this.deleteInstance(this.state.currentInstance)}
            cancel={() => this.toggleDialogDelete('')}
          /> : null
        }
        <List>
          {this.props.instances.map((instance) =>
            <React.Fragment key={instance._id}>
              <ListItem>
                <ListItemText
                  primary={instance.name}
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        {instance.modelName}
                      </Typography>
                      &nbsp;- {instance.createdAt.toDateString()}
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={instance.status.toUpperCase()}
                    icon={instance.status === 'busy' ? <CircularProgress size={10} disableShrink /> : null}
                    className={instance.status === 'ready' ? 'success' : 'warning'}
                    disabled
                  />
                  <Tooltip title="Open instance" arrow>
                    <IconButton
                      color="primary"
                      aria-label="Open instance"
                      href={`/instance/${instance._id}`}
                    >
                      <PlayArrowIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Details instance" arrow>
                    <IconButton
                      aria-label="Details instance"
                      onClick={() => this.toggleDetails(instance._id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete instance" arrow>
                    <IconButton
                      className="danger"
                      aria-label="Delete instance"
                      onClick={() => this.toggleDialogDelete(instance._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
              {this.state.currentInstance === instance._id ?
                <InstanceDetails instanceId={instance._id} />
                : null
              }
            </React.Fragment>
          )}
        </List>
      </Box>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('instances');

  let instances = InstanceCollection.find({}, { sort: { createdAt: -1 } }).fetch()
  return {
    instances,
  }
})(InstanceList);
