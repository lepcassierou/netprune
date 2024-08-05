import { Meteor } from 'meteor/meteor';
import { LayerCollection } from '/imports/db/LayerCollection';

Meteor.publish('layerById', function publishLayerById(id) {
  return LayerCollection.find({ _id: id });
});

Meteor.publish('layersByScenarioId', function publishLayersByScenarioId(id) {
  return LayerCollection.find({ scenarioId: id });
});