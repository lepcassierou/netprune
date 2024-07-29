from abc import abstractmethod
import tensorflow as tf
from tensorflow.python.keras import callbacks as callbacks_module

from process.abstract_tr_ft import AbstractTrFt



class AbstractFineTuning(AbstractTrFt):
    def __init__(self, dataset_name='mnist', model_name='vgg16', epochs=10, batch_size=128, val_split_ratio=0.1, optimizer_name='Nadam', loss_name = 'CategoricalCrossentropy', metric_name='CategoricalAccuracy'):
        super().__init__(dataset_name, model_name, epochs, batch_size, val_split_ratio, optimizer_name, loss_name, metric_name)
        
    
    def get_input_and_output_layers(self, edges_list):
        pass
    
    
    def build_model_with_weights(self, finetuning_filters={}, filepath=''):
        # TODO:
        pass
    
    
    
    ####### Load #######
    def load_callbacks(self, filepath=None):
        verbose = 1
        self.set_callbacks(filepath=filepath)
        self.active_callbacks = callbacks_module.CallbackList(self.callbacks, add_history=True, model=self.model, verbose=verbose, epochs=self.epochs)
    
    
    
    ####### Others #######
    def validate(self, filename):
        """ Evaluate the model on the evaluation dataset. Filename is the path to the model .h5 """
        self.load_model_from_file(filename)
        return self.model.evaluate(self.x_evaluation, self.y_evaluation)
    
    
    def load_dataset(self, dataset_name='', model_name='', batch_size=0, to_pad=False, augment_data=False, seed=0):
        super().load_dataset(dataset_name, model_name, batch_size, to_pad, augment_data, seed)
        
        self.x_evaluation, channels = self.__reshape_dataset_to_four_dims__(self.x_evaluation)
        self.x_evaluation = self.__dataset_to_float__(self.x_evaluation)
        self.x_evaluation = self.__normalize_dataset__(self.x_evaluation, channels)
        self.x_evaluation = self.__pad_dataset__(self.x_evaluation, channels, to_pad)
        
        self.y_evaluation = tf.keras.utils.to_categorical(self.y_evaluation, self.num_classes)