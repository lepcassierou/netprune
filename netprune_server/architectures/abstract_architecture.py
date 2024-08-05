from abc import ABC, abstractmethod


class AbstractArchitecture(ABC):
    @abstractmethod
    def __init__(self, input_shape, nb_classes):
        super().__init__()
        self.input_shape = input_shape
        self.nb_classes = nb_classes
        
        
    @abstractmethod
    def build_architecture(self):
        pass