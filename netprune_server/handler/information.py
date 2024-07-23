class Information():
    def __init__(self, mongo) -> None:
        self.mongo = mongo
        
    
    def init_progress(self, scenario_id):
        self.mongo.set_scenario_value(scenario_id, 'progressStep', 0)
        self.mongo.set_scenario_value(scenario_id, 'progressTotal', 100)