import { check } from 'meteor/check';
import { InstanceCollection } from '../db/InstanceCollection';

Meteor.methods({
  'instances.insert'(name, modelName, datasetName, optimizerName, lossName, metricName, epochs, batchSize, validationSplitRatio) {
    check(name, String);
    check(modelName, String);
    check(datasetName, String);
    check(optimizerName, String);
    check(lossName, String);
    check(metricName, String);
    check(epochs, Number);
    check(batchSize, Number);
    check(validationSplitRatio, Number);

    InstanceCollection.insert({
      name,
      modelName,
      datasetName,
      optimizerName,
      lossName,
      metricName,
      epochs,
      batchSize, 
      validationSplitRatio,
      createdAt: new Date,
      version: new Date,
      status: 'busy',
      statusQueue: [],
      scenarioNodes: [],
      scenarioEdges: [],
    }, (error, instanceId) => {
      if (error) {
        console.log(error)
        throw new Meteor.Error('Error during instance creation.');
      }
      Meteor.call('scenarios.create', instanceId, 'Base model', (error) => {
        if (error) {
          console.log(error)
          throw new Meteor.Error('Error during scenario creation.');
        }
      })
      return instanceId
    })
    
  },

  'instances.remove'(id) {
    check(id, String);

    const inst = InstanceCollection.findOne({ _id: id });
    if (!inst) {
      throw new Meteor.Error('Access denied.');
    }

    Meteor.call('scenarios.removeAll', id, (error) => {
      if (error) {
        console.log(error)
        throw new Meteor.Error('Error during instance deletion.');
      }
      
      Meteor.call('layers.removeAll', id, (error) => {
        if (error) {
          console.log(error)
          throw new Meteor.Error('Error during instance deletion.');
        }
        InstanceCollection.remove(id);
      })
    })
    Meteor.call('external.instance.remove', id)
  },
});
