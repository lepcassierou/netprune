import { check } from 'meteor/check';
import { FinetuningFilterCollection } from '/imports/db/FinetuningFilterCollection';
import { InstanceCollection } from '../db/InstanceCollection';
import { LayerCollection } from '../db/LayerCollection';

Meteor.methods({
    'finetuning_filters.remove'() {
        
    },

    'finetuning_filters.findSelectionByIds'(instanceId, scenarioSrcId, scenarioTrgId) {
        check(instanceId, String);
        check(scenarioSrcId, String);
        check(scenarioTrgId, String);

        const inst = InstanceCollection.findOne({ _id: instanceId });
        if (!inst) {
            throw new Meteor.Error('Instance not recognized.');
        }

        const finetuning_filters = FinetuningFilterCollection.findOne({
            scenarioSrcId: { $eq: scenarioSrcId },
            scenarioTrgId: { $eq: scenarioTrgId },
        })
        if (!finetuning_filters) {
            return null;
        } else {
            let selection = finetuning_filters.selection;
            let filtersPerLayerNew = [];
            let filtersPerLayerOld = [];

            Object.keys(selection).forEach((layerName, layerIndex) => {
                // Retrieve number of filters in initial layers
                const selectedLayer = LayerCollection.findOne({ scenarioId:scenarioSrcId, name:layerName});
                if(!selectedLayer){
                    throw new Meteor.Error('Layer not recognized in this scenario.');
                } else {
                    if(selectedLayer.type == "Dense"){
                        filtersPerLayerOld.push(selectedLayer.units);
                    } else {
                        filtersPerLayerOld.push(selectedLayer.filters);
                    }
                }

                // Compute union of filters of the new version of each modified layer
                let union = [];
                Object.keys(selection[layerName]).forEach(metric => {
                    selection[layerName][metric].forEach(filter => {
                        if (!union.includes(filter)) {
                            union.push(filter);
                        }
                    })
                })
                filtersPerLayerNew.push(union.length);
            });
            if(selection != null){
                return {
                    selection: Object.keys(selection),
                    oldFiltersNb: filtersPerLayerOld,
                    newFiltersNb: filtersPerLayerNew,
                }
            } else {
                console.log("One PROBLEM");
                return null;
            }
        }
    },

    'finetuning_filters.insertSelection'(instanceId, scenarioSrcId, scenarioTrgId = null, selection) {
        check(instanceId, String);
        check(scenarioSrcId, String);
        check(scenarioTrgId, null);

        const inst = InstanceCollection.findOne({ _id: instanceId });
        if (!inst) {
            throw new Meteor.Error('Instance not recognized.');
        }

        const finetuning_filters = FinetuningFilterCollection.findOne({
            scenarioSrcId: { $eq: scenarioSrcId },
            scenarioTrgId: { $eq: null },
        })
        if (!finetuning_filters) {
            FinetuningFilterCollection.insert({
                instanceId,
                scenarioSrcId,
                scenarioTrgId,
                selection: (!selection) ? {} : selection,
                version: new Date,
            }, (error, ffId) => {
                if (error) {
                    console.log(error)
                    throw new Meteor.Error('Error during finetuningfilter selection insertion.');
                }
                return ffId
            })
        } else {
            // Keep a selection for a not modified layer.
            // Erase the old one if any existed before.
            var existing_selection = finetuning_filters.selection;
            Object.keys(selection).forEach(key_layer => {
                existing_selection[key_layer] = selection[key_layer];
            });
            FinetuningFilterCollection.update(
                { _id: finetuning_filters._id },
                {
                    $set: {
                        selection: existing_selection,
                        version: new Date
                    },
                }
            );
        }
    },

    'finetuning_filters.removeAll'(instanceId) {
        check(instanceId, String);

        const inst = FinetuningFilterCollection.findOne({ _id: instanceId });
        if (!inst) {
            throw new Meteor.Error('Access denied.');
        }

        FinetuningFilterCollection.remove({ instanceId: instanceId });
    },


    'finetuning_filters.listAll'(instanceId) {
        check(instanceId, String);

        const inst = InstanceCollection.findOne({ _id: instanceId });
        if (!inst) {
            throw new Meteor.Error('Access denied.');
        }
    },
});