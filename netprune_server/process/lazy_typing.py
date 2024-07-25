from training_default import TrainingDefault
from training_cats_dogs import *
from fine_tuning_default import *
from fine_tuning_cats_dogs import *
from activations_default import *
from activations_cats_dogs import *
from statistics_default import *
from statistics_cats_dogs import *

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
        
        
    def lazy_typing_stats(self, dataset_name):
        if dataset_name == "cats_vs_dogs":
            return StatisticsCatsDogs
        return Statistics
        
        
    def lazy_typing_activations(self, dataset_name):
        if dataset_name == "cats_vs_dogs":
            return ActivationsCatsDogs
        return ActivationsDefault