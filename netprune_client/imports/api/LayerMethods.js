import { check } from 'meteor/check';
import { InstanceCollection } from '../db/InstanceCollection';
import { LayerCollection } from '../db/LayerCollection';

Meteor.methods({
  'layers.removeAll'(instanceId) {
    check(instanceId, String);

    const inst = InstanceCollection.findOne({ _id: instanceId });
    if (!inst) {
      throw new Meteor.Error('Access denied.');
    }

    LayerCollection.remove({ instanceId: instanceId });
  },
  'layers.listAll'(instanceId) {
    check(instanceId, String);

    const inst = InstanceCollection.findOne({ _id: instanceId });
    if (!inst) {
      throw new Meteor.Error('Access denied.');
    }

    const layer = LayerCollection.findOne()
    console.log(layer)
  },

  'layers.filtersByLayerNameList'(scenarioId, layerNameList){
    check(scenarioId, String);

    let filtersPerLayerList = [];
    layerNameList.forEach((layerName, index) => {
      const layer = LayerCollection.findOne({ scenarioId:scenarioId, name:layerName});
      if(!layer){
        throw new Meteor.Error('This layer does not exist.');
      } else {
        if(layer.type == "Dense"){
          filtersPerLayerList.push(layer.units);
        } else {
          filtersPerLayerList.push(layer.filters);
        }
      }
    });
    return filtersPerLayerList;
  },

  'layers.filtersByLayerName'(scenarioId, layerName){
    check(scenarioId, String);
    check(layerName, String);

    const layer = LayerCollection.findOne({ scenarioId:scenarioId, name:layerName});
    if(!layer){
      throw new Meteor.Error('This layer does not exist.');
    } else {
      if(layer.type == "Dense"){
        return layer.units;
      } else {
        return layer.filters;
      }
    }
  },
});
