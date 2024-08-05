import { check } from 'meteor/check';
import { InstanceCollection } from '../db/InstanceCollection';
import { ScenarioCollection } from '../db/ScenarioCollection';
import { LayerCollection } from '../db/LayerCollection';
import { FinetuningFilterCollection } from '../db/FinetuningFilterCollection';

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


Meteor.methods({
  'scenarios.create'(instanceId, name) {
    check(instanceId, String);
    check(name, String);

    const inst = InstanceCollection.findOne({ _id: instanceId });
    if (!inst) {
      throw new Meteor.Error('Instance not recognized.');
    }

    ScenarioCollection.insert({
      name,
      root: true,
      instanceId,
      createdAt: new Date,
      version: new Date,
      status: 'busy',
      accuracy: 0,
      loss: 0,
      sizeGain: 0,
      networkSize: 0,
      progressStep: 0,
      progressTotal: 0,
      message: '',
      layerNodes: [],
      layerEdges: [],
    }, (error, scenarioId) => {
      if (error) {
        console.log(error)
        throw new Meteor.Error('Error during scenario creation.');
      }
      InstanceCollection.update(
        { _id: instanceId }, 
        { 
          $push: { scenarioNodes: scenarioId },
          $set: { version: new Date }
        }
      )
      Meteor.call('external.scenario.initialisation', scenarioId)
      return scenarioId
    })
  },


  'scenarios.branchFrom'(scenarioIdSource, name, epochs, isLeaf) {
    check(scenarioIdSource, String);
    check(name, String);
    check(epochs, Number);

    const scen = ScenarioCollection.findOne({ _id: scenarioIdSource });
    if (!scen) {
      throw new Meteor.Error('Scenario not recognized.');
    }

    const inst = InstanceCollection.findOne({ _id: scen.instanceId });
    if (!inst) {
      throw new Meteor.Error('Instance not recognized.');
    }

    ScenarioCollection.insert({
      name,
      root: false,
      leaf: isLeaf,
      instanceId: inst._id,
      createdAt: new Date,
      version: new Date,
      status: 'busy',
      accuracy: 0,
      loss: 0,
      epochs,
      sizeGain: 0,
      networkSize: 0,
      progressStep: 0,
      progressTotal: 0,
      layerNodes: [],
      layerEdges: [],
    }, (error, scenarioId) => {
      if (error) {
        console.log(error)
        throw new Meteor.Error('Error during scenario branching.');
      }
      
      InstanceCollection.update(
        { _id: inst._id }, 
        { 
          $push: { 
            scenarioNodes: scenarioId, 
            scenarioEdges: {
              source: scenarioIdSource,
              target: scenarioId,
            },
          },
          $set: { version: new Date }
        }
      )
      FinetuningFilterCollection.update({ 
          scenarioSrcId: {$eq:scenarioIdSource},
          scenarioTrgId: {$eq:null}
        }, 
        { $set: {scenarioTrgId:scenarioId} }
      );
      Meteor.call('external.scenario.inheritance', scenarioIdSource, scenarioId)
    })
  },


  'scenarios.redoTesting'(scenarioId){
    check(scenarioId, String);

    const scen = ScenarioCollection.findOne({ _id: scenarioId });
    if(!scen) {
      throw new Meteor.Error('Scenario not recognized.');
    }

    const inst = InstanceCollection.findOne({ _id: scen.instanceId });
    if(!inst) {
      throw new Meteor.Error('Instance not recognized.');
    }
    Meteor.call('external.scenario.redoTesting', scenarioId);
  },


  'scenarios.remove'(id) {
    check(id, String);

    const scen = ScenarioCollection.findOne({ _id: id });
    if (!scen) {
      throw new Meteor.Error('Access denied.');
    }

    const inst = InstanceCollection.findOne({ _id: scen.instanceId });
    if (!inst) {
      throw new Meteor.Error('Instance not recognized.');
    }

    LayerCollection.remove({ scenarioId: id });
    ScenarioCollection.remove(id);
    InstanceCollection.update(
      { _id: inst._id }, 
      { 
        $pull: { 
          scenarioNodes: scen._id, 
          scenarioEdges: { $or: [
            {
              source: scen._id,
            },
            {
              target: scen._id,
            },
          ]},
        },
        $set: { version: new Date }
      }
    )

    Meteor.call('external.scenario.remove', inst._id, id)
  },

  'scenarios.removeAll'(instanceId) {
    check(instanceId, String);

    const inst = InstanceCollection.findOne({ _id: instanceId });
    if (!inst) {
      throw new Meteor.Error('Access denied.');
    }

    ScenarioCollection.remove({ instanceId: instanceId });
  },

  'scenarios.stop'(scenarioId) {
    check(scenarioId, String);

    const scen = ScenarioCollection.findOne({ _id: scenarioId });
    if (!scen) {
      throw new Meteor.Error('Access denied.');
    }

    ScenarioCollection.update(
      { _id: scenarioId },
      { $set: { status: 'stop' } }
    );
  },
});
