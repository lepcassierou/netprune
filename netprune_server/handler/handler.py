from connector.mongo_connector import Mongo
import instance_handler
import scenario_handler

class Handler():
    def __init__(self) -> None:
        self.i = instance_handler.InstanceHandler()
        self.s = scenario_handler.ScenarioHandler()
    
    
    def instance_deletion(self, params):
        return self.i.instance_deletion(params)
    
    
    def scenario_init(self, params):
        return self.s.scenario_init(params)
    
    
    def scenario_inheritance(self, params):
        return self.s.scenario_inheritance(params)
    
    
    def scenario_deletion(self, params):
        return self.s.scenario_deletion(params)
        