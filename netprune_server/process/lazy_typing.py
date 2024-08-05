from process.activations_default import ActivationsDefault
from process.finetuning_default import FineTuningDefault
from process.metrics_default import MetricsDefault
from process.training_default import TrainingDefault


class LazyTyping():
    def __init__(self) -> None:
        pass
    
    def lazy_typing_training(self, dataset_name):
        return TrainingDefault
        
        
    def lazy_typing_finetuning(self, dataset_name):
        return FineTuningDefault
        
        
    def lazy_typing_metrics(self, dataset_name):
        return MetricsDefault
        
        
    def lazy_typing_activations(self, dataset_name):
        return ActivationsDefault