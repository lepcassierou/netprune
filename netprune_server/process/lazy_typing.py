from process.activations_default import *
# from process.fine_tuning_default import *
from process.metrics_default import *
from process.training_default import TrainingDefault


class LazyTyping():
    def __init__(self) -> None:
        pass
    
    def lazy_typing_training(self, dataset_name):
        if dataset_name == "cats_vs_dogs":
            return TrainingCatsDogs
        return TrainingDefault
        
        
    def lazy_typing_finetuning(self, dataset_name):
        if dataset_name == "cats_vs_dogs":
            return FineTuningCatsDogs
        return FineTuning
        
        
    def lazy_typing_metrics(self, dataset_name):
        if dataset_name == "cats_vs_dogs":
            return MetricsCatsDogs
        return MetricsDefault
        
        
    def lazy_typing_activations(self, dataset_name):
        if dataset_name == "cats_vs_dogs":
            return ActivationsCatsDogs
        return ActivationsDefault