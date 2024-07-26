from handler.instance_handler import InstanceHandler
from handler.scenario_handler import ScenarioHandler


class Handler():
    def __init__(self) -> None:
        self.i = InstanceHandler()
        self.s = ScenarioHandler()
    
    
    def instance_deletion(self, params):
        return self.i.instance_deletion(params)
    
    
    def scenario_init(self, params):
        return self.s.scenario_init(params)
    
    
    def scenario_inheritance(self, params):
        return self.s.scenario_inheritance(params)
    
    
    def scenario_deletion(self, params):
        return self.s.scenario_deletion(params)
        