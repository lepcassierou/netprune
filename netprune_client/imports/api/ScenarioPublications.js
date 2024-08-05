import { Meteor } from 'meteor/meteor';
import { ScenarioCollection } from '/imports/db/ScenarioCollection';

Meteor.publish('scenarioById', function publishScenarioById(id) {
  return ScenarioCollection.find({ _id: id });
});

Meteor.publish('scenariosByInstanceId', function publishScenariosByInstanceId(id) {
  return ScenarioCollection.find({ instanceId: id });
});

Meteor.publish('scenarioByInstanceIdAndName', function publishScenarioByInstanceIdAndName(id, name) {
  return ScenarioCollection.find({ instanceId: id, name: name });
});