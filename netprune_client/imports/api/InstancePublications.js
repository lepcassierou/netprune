import { Meteor } from 'meteor/meteor';
import { InstanceCollection } from '/imports/db/InstanceCollection';

Meteor.publish('instances', function publishInstances() {
  return InstanceCollection.find({});
});

Meteor.publish('instanceById', function publishInstanceById(id) {
  return InstanceCollection.find({ _id: id });
});
