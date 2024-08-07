import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { check } from 'meteor/check';

Meteor.methods({
  'external.dataset_list'(){
    try {
      let v = HTTP.call('GET', `${Meteor.settings.FLASK_URL}/params/get_lists`);
      console.log('Dataset list', v.data.body)
      return v.data.body;
    } catch (e) {
      throw new Meteor.Error('External server unavailable', e);
    }
  },

  'external.instance.remove'(instanceId) {
    check(instanceId, String);

    try {
      let v = HTTP.call('GET', `${Meteor.settings.FLASK_URL}/instance/deletion/${instanceId}`);
      console.log('Instance deletion OK')
    } catch (e) {
      throw new Meteor.Error('External server unavailable', e);
    }
  },

  'external.scenario.initialisation'(scenarioId) {
    check(scenarioId, String);

    try {
      let v = HTTP.call('GET', `${Meteor.settings.FLASK_URL}/scenario/initialisation/${scenarioId}`);
      console.log('Scenario initialisation OK')
    } catch (e) {
      throw new Meteor.Error('External server unavailable', e);
    }
  },

  'external.scenario.inheritance'(scenarioIdSrc, scenarioIdDest) {
    check(scenarioIdSrc, String);
    check(scenarioIdDest, String);

    try {
      let v = HTTP.call('GET', `${Meteor.settings.FLASK_URL}/scenario/inheritance/${scenarioIdSrc}/${scenarioIdDest}`);
      console.log('Scenario inheritance OK')
    } catch (e) {
      throw new Meteor.Error('External server unavailable', e);
    }
  },

  'external.scenario.redoTesting'(scenarioId){
    check(scenarioId, String);

    try {
      let v = HTTP.call('GET', `${Meteor.settings.FLASK_URL}/scenario/redoTesting/${scenarioId}`);
      console.log('Scenario testing reset OK')
    } catch (e) {
      throw new Meteor.Error('External server unavailable', e);
    }
  },

  'external.scenario.remove'(instanceId, scenarioId) {
    check(instanceId, String);
    check(scenarioId, String);

    try {
      let v = HTTP.call('GET', `${Meteor.settings.FLASK_URL}/scenario/deletion/${instanceId}/${scenarioId}`);
      console.log('Scenario deletion OK')
    } catch (e) {
      throw new Meteor.Error('External server unavailable', e);
    }
  },
})
