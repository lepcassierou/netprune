import os
from handler.abstract_handler import AbstractHandler


class InstanceHandler(AbstractHandler):
    def __init__(self) -> None:
        pass
        
        
    def recursive_deletion(self, path):
        if not os.path.exists(path):
            return
        if not os.path.isdir(path):
            os.remove(path)
        items = os.listdir(path)
        for item in items:
            to_rm = f"{path}/{item}"
            if os.path.isdir(to_rm):
                self.recursive_deletion(to_rm)
            else:
                os.remove(to_rm)
        os.rmdir(path)
        
    
    def instance_deletion(self, params):
        path = os.getcwd()
        self.recursive_deletion(f"{path}/models/{params['instance_id']}")
        return self.default_response()