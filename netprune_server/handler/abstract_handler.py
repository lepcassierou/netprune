from abc import ABC, abstractmethod


class AbstractHandler(ABC):
    @abstractmethod
    def __init__(self):
        super().__init__()
        
    
    def default_response(self):
        return {
            "statusCode": 200,
            "body": True,
        }