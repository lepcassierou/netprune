from abc import ABC, abstractmethod


class AbstractMetric(ABC):
    @abstractmethod
    def __init__(self) -> None:
        super().__init__()
        self.data_float_size = 64
        self.MEMORY_LIMIT = 8000000000
        
        
    @abstractmethod
    def compute_metric(self,):
        pass



class DataAwareMetric(AbstractMetric):
    @abstractmethod
    def __init__(self, data) -> None:
        super().__init__()
        self.data = data