from abc import ABC, abstractmethod


class AbstractArchitecture(ABC):
    @abstractmethod
    def __init__(self, input_shape):
        super().__init__()
        self.input_shape = input_shape
        
        
    @abstractmethod
    def build_architecture(self):
        pass