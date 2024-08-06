import React from 'react';
import { Meteor } from 'meteor/meteor';
import ReactDOM from "react-dom/client";

import App from "/imports/ui/pages/App";

Meteor.startup(() => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <App />
  );
});
