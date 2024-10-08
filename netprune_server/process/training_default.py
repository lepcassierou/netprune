import numpy as np
import tensorflow as tf

from architectures.architecture import ArchitectureChooser
from process.abstract_training import AbstractTraining



class TrainingDefault(AbstractTraining):
    def __init__(self, dataset_name='mnist', model_name='vgg16', epochs=10, batch_size=128, val_split_ratio=0.1, optimizer_name='Nadam', loss_name='CategoricalCrossentropy', metric_name='CategoricalAccuracy'):
        super().__init__(dataset_name, model_name, epochs, batch_size, val_split_ratio, optimizer_name, loss_name, metric_name)
    
    
    def load_architecture(self, model_name=''):
        if model_name != '':
            self.model_name = model_name
        archi_chooser = ArchitectureChooser(self.model_name)
        shape = None
        if self.custom_dataset:
            shape = self.dataset_params.images_dims
        else:
            shape = self.x_train[0].shape
        self.model = archi_chooser.choose_architecture(shape, self.num_classes)
        self.model.summary()