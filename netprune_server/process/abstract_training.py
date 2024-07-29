import tensorflow as tf
from tensorflow.python.keras import callbacks as callbacks_module
from abc import abstractmethod

from process.abstract_tr_ft import AbstractTrFt
from process.available_parameters import AvailableParameters


class AbstractTraining(AbstractTrFt):
    def __init__(self, dataset_name='mnist', model_name='vgg16', epochs=10, batch_size=128, val_split_ratio=0.1, optimizer_name='Nadam', loss_name = 'CategoricalCrossentropy', metric_name='CategoricalAccuracy'):
        super().__init__(dataset_name, model_name, epochs, batch_size, val_split_ratio, optimizer_name, loss_name, metric_name)
    
    
    
    ####### Setters #######
    def set_callbacks(self, filepath=None):
        self.callbacks = []
        if self.model_name == "vgg16_cifar" or self.model_name == "vgg16_cifar_2fc":
            self.callbacks.append(tf.keras.callbacks.LearningRateScheduler(self.__lr_scheduler__))
        
        
        
    ####### Load #######
    @abstractmethod
    def load_dataset(self, dataset_name='', model_name='', batch_size=0, to_pad=False, augment_data=False, seed=0):
        pass
    
    
    @abstractmethod
    def load_architecture(self, model_name=''):
        pass
        
        
    def load_callbacks(self, filepath=None):
        verbose = 1
        self.set_callbacks()
        self.active_callbacks = callbacks_module.CallbackList(self.callbacks, add_history=True, model=self.model, verbose=verbose, epochs=self.epochs)
        
    
    
    ####### Others #######
    def __lr_scheduler__(self, epoch):
        learning_rate = 0.1
        decay = epoch >= self.epochs*0.75 and 2 or epoch >= self.epochs*0.5 and 1 or 0
        return learning_rate * (0.1**decay)
    
    