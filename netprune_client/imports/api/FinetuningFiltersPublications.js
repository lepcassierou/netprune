import { Meteor } from 'meteor/meteor';
import { FinetuningFilterCollection } from '/imports/db/FinetuningFilterCollection';

Meteor.publish('finetuningFilterById', function publishFinetuningFilterById(id) {
  return FinetuningFilterCollection.find({ _id: id });
});

Meteor.publish('ffByScenarioId', function publishFFByScenarioId(id) {
  const ff =  FinetuningFilterCollection.find({
    scenarioSrcId: id,
    scenarioTrgId: null,
  });
  return ff;
});

Meteor.publish('ffByScenariiIds', function publishFFByScenariiIds(id1, id2) {
  const ff =  FinetuningFilterCollection.find({
    scenarioSrcId: id1,
    scenarioTrgId: id2,
  });
  return ff;
});

Meteor.publish('finetuningFiltersByInstanceId', function publishFinetuningFilterByInstanceId(id) {
    return FinetuningFilterCollection.find({ instanceId: id });
});