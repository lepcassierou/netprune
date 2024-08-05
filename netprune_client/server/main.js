import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import './methods';
import './publications';

const SEED_USERNAME = 'meteorite';
const SEED_PASSWORD = 'password';

Meteor.startup(() => {
  // Create default user
  if (!Accounts.findUserByUsername(SEED_USERNAME)) {
    Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
    });
  }
  //const user = Accounts.findUserByUsername(SEED_USERNAME);

});
