from handler.instance_handler import InstanceHandler
from handler.scenario_handler import ScenarioHandler
from params.global_parameters_list import AvailableParameters


class Handler():
    def __init__(self) -> None:
        self.i = InstanceHandler()
        self.s = ScenarioHandler()
        self.a = AvailableParameters()
        
        
    def get_lists(self):
        lists = {
            'datasets': self.a.get_datasets(),
            'models': self.a.get_models(),
            'optimizers': self.a.get_optimizers(),
            'losses': self.a.get_losses(),
            'metrics': self.a.get_metrics(),
        }
        response = {
            'statusCode': 200,
            'body': lists,
        }
        return response
    
    
    def instance_deletion(self, params):
        return self.i.instance_deletion(params)
    
    
    def scenario_init(self, params):
        return self.s.scenario_init(params)
    
    
    def scenario_inheritance(self, params):
        return self.s.scenario_inheritance(params)
    
    
    def scenario_deletion(self, params):
        return self.s.scenario_deletion(params)
        