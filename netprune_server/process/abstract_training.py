from abc import ABC, abstractmethod
import tensorflow as tf
from keras_flops import get_flops
from tensorflow.python.keras import callbacks as callbacks_module


class AbstractTraining(ABC):
    @abstractmethod
    def __init__(self, dataset_name='mnist', model_name='vgg16', epochs=10, batch_size=128, val_split_ratio=0.1, optimizer_name='Nadam', loss_name = 'CategoricalCrossentropy', metric_name='CategoricalAccuracy'):
        super().__init__()
        self.gpu_setup()
        self.init_parameters(dataset_name, model_name, epochs, batch_size, val_split_ratio, optimizer_name, loss_name, metric_name)
                
        
    def gpu_setup(self,):
        physical_devices = tf.config.experimental.list_physical_devices('GPU')
        if len(physical_devices) > 0:
            for dev in physical_devices:
                tf.config.experimental.set_memory_growth(dev, True)
                
                
    def init_parameters(self, dataset_name, model_name, epochs, batch_size, val_split_ratio, optimizer_name, loss_name, metric_name):
        self.dataset_name = dataset_name
        self.model_name = model_name
        self.epochs = epochs
        self.batch_size = batch_size
        self.val_split_ratio = val_split_ratio
        self.optimizer_name = optimizer_name
        self.loss_name = loss_name
        self.metric_name = metric_name
        
        self.datasets = ['cifar10', 'fashion_mnist', 'mnist', 'cats_vs_dogs']
        self.models = ['lenet5', 'lenet300-100', 'lenet_4_variant', 'vgg16', 'vgg16_cifar', 'vgg16_cifar_2fc', 'vgg19', 'two-layer', 'cvsd_conv', 'resnet50']
        self.optimizers = ['Adadelta', 'Adagrad', 'Adam', 'Adamax', 'Ftrl', 'Nadam', 'Optimizer', 'RMSprop', 'SGD']
        self.losses = ['BinaryCrossentropy', 'CategoricalCrossentropy', 'CategoricalHinge', 'CosineSimilarity', 'Hinge', 'Huber', 'KLD', 'KLDivergence', 'LogCosh', 'Loss', 'MAE', 'MAPE', 'MSE', 'MSLE', 'MeanAbsoluteError', 'MeanAbsolutePercentageError', 'MeanSquaredError', 'MeanSquaredLogarithmicError', 'Poisson', 'Reduction', 'SparseCategoricalCrossentropy', 'SquaredHinge']
        self.metrics = ['AUC', 'Accuracy', 'BinaryAccuracy', 'BinaryCrossentropy', 'CategoricalAccuracy', 'CategoricalCrossentropy', 'CategoricalHinge', 'CosineSimilarity', 'FalseNegatives', 'FalsePositives', 'Hinge', 'KLD', 'KLDivergence', 'LogCoshError', 'MAE', 'MAPE', 'MSE', 'MSLE', 'Mean', 'MeanAbsoluteError', 'MeanAbsolutePercentageError', 'MeanIoU', 'MeanRelativeError', 'MeanSquaredError', 'MeanSquaredLogarithmicError', 'MeanTensor', 'Metric', 'Poisson', 'Precision', 'PrecisionAtRecall', 'Recall', 'RecallAtPrecision', 'RootMeanSquaredError', 'SensitivityAtSpecificity', 'SparseCategoricalAccuracy', 'SparseCategoricalCrossentropy', 'SparseTopKCategoricalAccuracy', 'SpecificityAtSensitivity', 'SquaredHinge', 'Sum', 'TopKCategoricalAccuracy', 'TrueNegatives', 'TruePositives']
        
        self.callbacks = []
        self.stop_training = None
        self.x_train = []
        self.y_train = []
        self.x_test = []
        self.y_test = []
        self.x_evaluation = []
        self.y_evaluation = []
        self.best_validation_acc = 0
                
    
    
    ####### Getters #######
    def get_datasets(self):
        return self.datasets


    def get_test_set(self):
        return self.x_test, self.y_test


    def get_models(self):
        return self.models


    def get_curr_model(self):
        return self.model


    def get_nb_classes(self):
        # TODO: More sophisticated if a model has multiple outputs
        return self.model.output_shape[-1]


    def get_model_flops(self):
        return get_flops(self.model, batch_size=1)


    def get_optimizers(self):
        return self.optimizers


    def get_optimizer(self):
        return self.optimizer


    def get_losses(self):
        return self.losses


    def get_loss(self):
        return self.loss


    def get_metrics(self):
        return self.metrics


    def get_metric(self):
        return self.metric


    def get_callbacks(self):
        return self.callbacks



    ####### Setters #######
    def set_dataset_name(self, name):
        self.dataset_name = name
        
        
    def set_model_name(self, name):
        self.model_name = name
        
        
    def set_optimizer(self, fct):
        self.optimizer = fct
        
        
    def set_optimizer_name(self, name):
        self.optimizer_name = name
        
        
    def set_loss(self, name):
        self.loss_name = name
        
        
    def set_metric_name(self, name):
        self.metric_name = name
        
        
    def set_callbacks(self):
        self.callbacks = []
        if self.model_name == "vgg16_cifar" or self.model_name == "vgg16_cifar_2fc":
            self.callbacks.append(tf.keras.callbacks.LearningRateScheduler(self.lr_scheduler))
        
        
        
    ####### Save #######
    def save_model(self, filename):
        self.model.reset_metrics()
        self.model.save(filename)
        
        
    def __get_config_nodes__(self):
        layers = []
        for layer in self.model.layers:
            tmp = layer.get_config()
            tmp['input_shape'] = layer.input_shape
            tmp['output_shape'] = layer.output_shape
            tmp['params'] = layer.count_params()
            tmp['type'] = str(type(layer)).split('.')[-1][:-2]
            layers.append(tmp)
        return layers
        
        
    def __get_config_edges__(self):
        config = self.model.get_config()
        relations = []
        for layer in config['layers']:
            if layer['inbound_nodes'] != []:
                for i_node in layer['inbound_nodes']:
                    for si_node in i_node:
                        for ssi_node in si_node:
                            if ssi_node != 0 and ssi_node != {}:
                                relations.append({'source': ssi_node, 'target': layer['name']})
        return relations
    
    
    def save_config(self):
        layers = self.__get_config_nodes__()
        edges = self.__get_config_edges__()
        return layers, edges
    
    
        
    ####### Load #######
    @abstractmethod
    def load_dataset(self, dataset_name='', model_name='', batch_size=0, to_pad, augment_data=False, seed=0):
        pass
    
    
    def load_model(self, filename):
        self.model = tf.keras.models.load_model(filename)
        print("Best model loaded \n")
        
        
    def load_optimizer(self, optimizer_name=''):
        if optimizer_name == '':
            optimizer_name = self.optimizer_name
        else:
            self.optimizer_name = optimizer_name
        self.optimizer = tf.keras.optimizers.get(optimizer_name)
        
        
    def load_loss(self, loss_name=''):
        if loss_name == '':
            loss_name = self.loss_name
        else:
            self.loss_name = loss_name
        self.loss = tf.keras.losses.get(loss_name)
        
        
    def load_metric(self, metric_name=''):
        if metric_name == '':
            metric_name = self.metric_name
        else:
            self.metric_name = metric_name
        self.metric = tf.keras.metrics.get(metric_name)
        
        
    def load_callbacks(self,):
        verbose = 1
        self.set_callbacks(None)
        self.active_callbacks = callbacks_module.CallbackList(self.callbacks, add_history=True, model=self.model, verbose=verbose, epochs=self.epochs)
        
    
    @abstractmethod
    def __load__(self,):
        pass
        
        
    
    ####### Others #######
    @abstractmethod
    def cut_eval_dataset(self, dataset_x, dataset_y, nb_classes, to_pad, model_name='', test_set_split_ratio=.166):
        pass
    
    
    def show_model(self):
        self.model.summary()
        
        
    def lr_scheduler(self, epoch):
        learning_rate = 0.1
        decay = epoch >= self.epochs*0.75 and 2 or epoch >= self.epochs*0.5 and 1 or 0
        return learning_rate * (0.1**decay)
    
    
    @abstractmethod
    def train(self,):
        pass
    
    
    def evaluate(self, filename):
        self.load_model(filename)
        return self.model.evaluate(self.x_test, self.y_test)
    
    
    def predict(self, filename):
        self.load_model(filename)
        return self.model.predict(self.x_test, steps=10)
    
    
    def compile_model(self,):
        self.model.compile(loss = self.loss, optimizer = self.optimizer, metrics = [self.metric])
    