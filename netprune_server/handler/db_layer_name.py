class LayerName2DBName():
    def __init__(self, db_layers) -> None:
        self.db_layers = db_layers
        
    
    def get_db_name_from_layername(self, layer_name):
        for name in self.db_layers:
            if name['name'] == layer_name:
                return name['_id']
        return None
    
    

class DBName2LayerName():
    def __init__(self, mongo) -> None:
        self.mongo = mongo
        
        
    def get_layername_from_db_name(self, db_name):
        return self.mongo.get_layer(db_name)['name']
    
    
    
class MetricsSaver():
    def __init__(self, mongo) -> None:
        self.mongo = mongo
        
        
    def save_metrics_to_db(self, db_layer_id, stats):
        self.mongo.set_layer_statistics(db_layer_id, stats)