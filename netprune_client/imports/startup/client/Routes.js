import React from 'react';
import { Switch } from 'react-router';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import App from '../../ui/pages/App';
import NotFound from '../../ui/pages/NotFound';

const isAuthenticated = () => Meteor.user() !== null;

const AuthRoute = ({ component, ...props }) => {
  if (isAuthenticated()) {
    return <Redirect to='/' />;
  }
  return <Route {...props} component={component} />;
};

const Routes = () => (
  <Router>
    <Switch>
      <Route path="/" component={App} />
      <Route component={NotFound} />
    </Switch>
  </Router>
);

export default Routes;
