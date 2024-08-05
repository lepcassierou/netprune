import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import Routes from '/imports/startup/client/Routes';

Meteor.startup(() => {
  render(<Routes/>, document.getElementById('react-target'));
});
