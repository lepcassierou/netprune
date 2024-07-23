from pymongo import MongoClient
import bson
import configparser
import datetime

config = configparser.ConfigParser()
config.read("config.ini")

#import pymongo
#pymongo.MongoClient('0.0.0.0', 3001)['meteor'].instances.find_one()

class Mongo:
    def __init__(self):
        client = MongoClient(config['mongo']['host'], int(config['mongo']['port']))
        self.db = client[config['mongo']['db']]
        
        
    def get_now(self):
        return datetime.datetime.now(datetime.timezone.utc)

    # instance
    def get_instance(self, instance_id):
        return self.db.instances.find_one({ "_id": instance_id })

    def set_instance_value(self, instance_id, field, value):
        d = datetime.datetime.now(datetime.timezone.utc)
        self.db.instances.update_one({ "_id": instance_id }, { "$set": { field: value, "version": self.get_now()} })

    def push_instance_value(self, instance_id, field, value):
        self.db.instances.update_one({ "_id": instance_id }, { "$push": { field: value }, "$set": { "version": self.get_now() } })

    def pull_instance_value(self, instance_id, field, value):
        self.db.instances.update_one({ "_id": instance_id }, { "$pull": { field: value }, "$set": { "version": self.get_now() } })

    # scenario
    def get_scenario(self, scenario_id):
        return self.db.scenarios.find_one({ "_id": scenario_id })

    def set_scenario_value(self, scenario_id, field, value):
        self.db.scenarios.update_one({ "_id": scenario_id }, { "$set": { field: value, "version": self.get_now() } })

    def push_scenario_value(self, scenario_id, field, value):
        self.db.scenarios.update_one({ "_id": scenario_id }, { "$push": { field: value }, "$set": { "version": self.get_now() } })

    def pull_scenario_value(self, scenario_id, field, value):
        self.db.scenarios.update_one({ "_id": scenario_id }, { "$pull": { field: value }, "$set": { "version": self.get_now() } })

    def insert_scenario(self, scenario):
        scenario["createdAt"] = self.get_now()
        scenario["version"] = self.get_now()
        scenario['_id'] = str(bson.objectid.ObjectId())
        return self.db.scenarios.insert_one(scenario).inserted_id

    # layer
    def get_layer(self, layer_id):
        return self.db.layers.find_one({ "_id":layer_id })

    def get_layers_by_scenario_id(self, scenario_id):
        return self.db.layers.find({ "scenarioId": scenario_id }, { "name": 1 })

    def get_layer_by_scenario_and_name(self, scenario_id, name):
        return self.db.layers.find_one({ "scenarioId": {"$eq": scenario_id}, "name": {"$eq": name}})

    def set_layer_statistics(self, layer_id, stats):
        return self.db.layers.update_one({'_id':layer_id}, {'$set': {'statistics':stats}})

    def insert_layer(self, layer):
        layer['version'] = self.get_now()
        layer['_id'] = str(bson.objectid.ObjectId())
        return self.db.layers.insert_one(layer).inserted_id

    # Finetuning_filters
    def get_finetuning_filters(self, scenario_src_id, scenario_trg_id):
        return self.db.finetuning_filters.find_one({ "scenarioSrcId": {"$eq":scenario_src_id}, "scenarioTrgId": {"$eq": scenario_trg_id} })

    def set_finetuning_filters_value(self, scen_src_id, scen_trg_id, field, value):
        self.db.finetuning_filters.update_one({ "scenarioSrcId": {"$eq":scen_src_id}, "scenarioTrgId": {"$eq":scen_trg_id} }, { "$set": { field: value, "version": self.get_now() } })

    def insert_finetuning_filters(self, ff):
        ff['version'] = self.get_now()
        ff['_id'] = str(bson.objectid.ObjectId())
        return self.db.finetuning_filters.insert_one(ff).inserted_id

#"version": self.get_now()


