from abc import ABC, abstractmethod
from keras_flops import get_flops
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import time

from handler.console_information import ConsoleInformation
from process.available_parameters import AvailableParameters
from process.gpu_setup import GPUSetup
from process.train_test_steps import TrainStep, TestStep


class AbstractTrFt(ABC):
    @abstractmethod
    def __init__(self, dataset_name='mnist', model_name='vgg16', epochs=10, batch_size=128, val_split_ratio=0.1, optimizer_name='Nadam', loss_name = 'CategoricalCrossentropy', metric_name='CategoricalAccuracy'):
        super().__init__()
        GPUSetup.gpu_setup()
        self.init_parameters(dataset_name, model_name, epochs, batch_size, val_split_ratio, optimizer_name, loss_name, metric_name)
        self.console_info = ConsoleInformation()
        
        
    def init_parameters(self, dataset_name, model_name, epochs, batch_size, val_split_ratio, optimizer_name, loss_name, metric_name):
        self.dataset_name = dataset_name
        self.model_name = model_name
        self.epochs = epochs
        self.batch_size = batch_size
        self.val_split_ratio = val_split_ratio
        self.optimizer_name = optimizer_name
        self.loss_name = loss_name
        self.metric_name = metric_name
        print("Dataset name: ", self.dataset_name)
        print("Model name: ", self.model_name)
        print("Epochs: ", self.epochs)
        print("Batch size: ", self.batch_size)
        print("Val split ratio: ", self.val_split_ratio)
        print("Optimizer name: ", self.optimizer_name)
        print("Loss name: ", self.loss_name)
        print("Metric name: ", self.metric_name)
        
        self.datasets = AvailableParameters.get_datasets()
        self.models = AvailableParameters.get_models()
        self.optimizers = AvailableParameters.get_optimizers()
        self.losses = AvailableParameters.get_losses()
        self.metrics = AvailableParameters.get_metrics()
        
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
        
        
    def set_callbacks(self, filepath=None):
        self.callbacks = [tf.keras.callbacks.LearningRateScheduler(self.__lr_scheduler__)]
        
        
    def __lr_scheduler__(self, epoch):
        learning_rate = 0.1
        decay = epoch >= self.epochs*0.75 and 2 or epoch >= self.epochs*0.5 and 1 or 0
        return learning_rate * (0.1**decay)        
        
        
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
    def load_model_from_file(self, filename=''):
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
        
    
    @abstractmethod
    def load_callbacks(self, filepath=None):
        pass
    
    
    def load_dataset(self, dataset_name='', model_name='', batch_size=0, to_pad=False, augment_data=False, seed=0):
        self.random_seed = [ord(i) for i in list(seed)]
        dataset, val_split_ratio, test_set_split_ratio = self.__dataset_name_to_dataset__(dataset_name)

        if model_name != '':
            self.model_name = model_name
            
        (x_train, y_train), (x_test, y_test) = dataset.load_data()
        self.num_classes = np.amax(y_train)+1
        x_train, y_train = self.cut_eval_dataset(x_train, y_train, self.num_classes, to_pad, self.model_name, test_set_split_ratio)
        
        x_train, channels = self.__reshape_dataset_to_four_dims__(x_train)
        x_test, _ = self.__reshape_dataset_to_four_dims__(x_test)
        x_train = self.__dataset_to_float__(x_train)
        x_test = self.__dataset_to_float__(x_test)
        
        x_train = self.__normalize_dataset__(x_train, channels, is_train_set=True)
        x_test = self.__normalize_dataset__(x_test, channels)
            
        y_train = tf.keras.utils.to_categorical(y_train, self.num_classes)
        y_test = tf.keras.utils.to_categorical(y_test, self.num_classes)
        
        x_train = self.__pad_dataset__(x_train, channels, to_pad)
        x_test = self.__pad_dataset__(x_test, channels, to_pad)
        
        if val_split_ratio > 0:
            self.val_split_ratio = val_split_ratio
        if batch_size > 0:
            self.batch_size = batch_size
        shuffle_buffer_size = 1024
            
        train_set_size = int(self.val_split_ratio * len(x_train))
        self.x_train = x_train[:-train_set_size]
        self.y_train = y_train[:-train_set_size]
        train_dataset = tf.data.Dataset.from_tensor_slices((self.x_train, self.y_train))
        self.train_dataset = train_dataset.shuffle(buffer_size=shuffle_buffer_size).batch(self.batch_size)
        
        self.augment_data = augment_data
        if augment_data:
            self.__setup_data_augmentation__()
            
        val_dataset = tf.data.Dataset.from_tensor_slices((x_train[-train_set_size:], y_train[-train_set_size:]))
        self.val_dataset = val_dataset.batch(self.batch_size)
        self.x_test = x_test
        self.y_test = y_test
        print(np.shape(self.x_train), np.shape(self.y_train))
    
    
    ####### Others #######
    def show_model(self):
        self.model.summary()
        
        
    def __dataset_name_to_dataset__(self, name):
        if name != '':
            self.dataset_name = name
        dataset = None
        val_split_ratio = None
        test_set_split_ratio = None
        if self.dataset_name == 'cifar10':
            dataset = tf.keras.datasets.cifar10
            val_split_ratio = 1/9
            test_set_split_ratio = .1
        if self.dataset_name == 'fashion_mnist':
            dataset = tf.keras.datasets.fashion_mnist
            val_split_ratio = 1/11
            test_set_split_ratio = 1/12
        if self.dataset_name == 'mnist':
            dataset = tf.keras.datasets.mnist
            val_split_ratio = 1/11
            test_set_split_ratio = 1/12
        return dataset, val_split_ratio, test_set_split_ratio
        
        
    def cut_eval_dataset(self, dataset_x, dataset_y, nb_classes, to_pad, model_name='', test_set_split_ratio=.166):
        # 1) Simplify dimension of dataset_y
        dataset_y = np.asarray(dataset_y).squeeze()
            
        # 2) Extract elements by class
        dataset_x1 = []
        dataset_y1 = []
        dataset_x2 = []
        dataset_y2 = []
        
        # 3) Split each class elements into two sub-datasets
        permutations_per_class = []
        for num_class in range(nb_classes):
            indices_per_class = np.argwhere(dataset_y == num_class).flatten()
            size_of_indices = int(round(len(indices_per_class) * (1 - test_set_split_ratio)))

            permutation = np.random.RandomState(seed=self.random_seed).permutation(indices_per_class)
            
            x1 = dataset_x[ permutation[:size_of_indices] ] # Biggest dataset
            y1 = dataset_y[ permutation[:size_of_indices] ]
            x2 = dataset_x[ permutation[size_of_indices:] ] # Smallest dataset
            y2 = dataset_y[ permutation[size_of_indices:] ]

            # Checks validity
            assert len(np.argwhere(y1 == num_class).flatten()) == len(y1), "The dataset splitting did mess up with the class indices"
            assert len(np.argwhere(y2 == num_class).flatten()) == len(y2), "The dataset splitting did mess up with the class indices"

            # Saves the smallest dataset indices to use it later as a new test set
            permutations_per_class.append(permutation[size_of_indices:].tolist())

            for i in range(len(x1)):
                dataset_x1.append(x1[i])
                dataset_y1.append(y1[i])
            for i in range(len(x2)):
                dataset_x2.append(x2[i])
                dataset_y2.append(y2[i])

        dataset_x1 = np.asarray(dataset_x1)
        dataset_y1 = np.asarray(dataset_y1)
        dataset_x2 = np.asarray(dataset_x2)
        dataset_y2 = np.asarray(dataset_y2)

        # Shuffles the datasets because the classes are not mixed up
        p2 = np.random.RandomState(seed=self.random_seed).permutation(range(len(dataset_y1)))
        dataset_x1 = dataset_x1[p2]
        dataset_y1 = dataset_y1[p2]
        p3 = np.random.RandomState(seed=self.random_seed).permutation(range(len(dataset_y2)))
        dataset_x2 = dataset_x2[p3]
        dataset_y2 = dataset_y2[p3]

        # Format evaluation set
        dataset_x2, channels = self.__reshape_dataset_to_four_dims__(dataset_x2)
    
        #Convert to float
        dataset_x2 = self.__dataset_to_float__(dataset_x2)
    
        #Normalize inputs from [0; 255] to [0; 1]
        dataset_x2 = self.__normalize_dataset__(dataset_x2, channels)
        
        if model_name != '':
            self.model_name = model_name

        dataset_x2 = self.__pad_dataset__(dataset_x2, channels, to_pad)
        dataset_y2 = tf.keras.utils.to_categorical(dataset_y2, self.num_classes)
        self.x_evaluation = dataset_x2
        self.y_evaluation = dataset_y2

        return dataset_x1, dataset_y1
    
    
    def __setup_generator__(self,):
        if self.augment_data:
            return self.datagen.flow(self.x_train, self.y_train, batch_size=self.batch_size)
        else:
            return self.train_dataset
         
        
    def train(self, train_checkpoint = None, test_checkpoint = None, checkpoint_file_path = None):
        if train_checkpoint is None:
            self.console_info.train_fct_incorrect()
        if test_checkpoint is None:
            self.console_info.test_fct_incorrect()
        if checkpoint_file_path is None:
            self.console_info.file_path_incorrect()
            
        self.active_callbacks.on_train_begin()
        step_total = len(self.x_train)*(1-self.val_split_ratio)
        step_mod = (step_total/self.batch_size)/10
        train_step = TrainStep()
        test_step = TestStep()
        self.console_info.print_line()
        generator = self.__setup_generator__()
        
        for epoch in range(self.epochs):
            epoch_is_better = False
            self.console_info.epochs_info(epoch+1, self.epochs)
            start_time = time.time()
            
            nb_steps = len(self.x_train) / self.batch_size
            for step, (x_batch_train, y_batch_train) in enumerate(generator):
                loss_value = train_step(x_batch_train, y_batch_train, self.model, self.optimizer, self.loss, self.metric)
                self.console_info.print_advancement(40, step, nb_steps)
                # Log every 200 batches.
                if step % int(step_mod) == 0:
                    # Can be interrupted
                    if not train_checkpoint(epoch, self.epochs, step * self.batch_size, step_total, self.metric.result(), loss_value):
                        return False
                if step >= nb_steps:
                    # Manually break the loop because the generator loops indefinitely
                    break
            
            # Display metrics at the end of each epoch.
            train_acc = self.metric.result()
            str_epoch = self.console_info.advancement(20, 1, 1)
            str_epoch += self.console_info.train_acc_str(train_acc)
            # Reset training metrics at the end of each epoch
            self.metric.reset_states()
            # Run a validation loop at the end of each epoch.
            for x_batch_val, y_batch_val in self.val_dataset:
                # External test step
                loss_value = test_step(x_batch_val, y_batch_val, self.model, self.metric, self.loss)
            val_acc = self.metric.result()
            # Save model if it obtained the best performances on the validation dataset
            if val_acc > self.best_validation_acc:
                self.best_validation_acc = val_acc
                self.save_model(checkpoint_file_path)
                epoch_is_better = True
            test_checkpoint(train_acc, val_acc, loss_value)
            self.metric.reset_states()
            str_epoch += self.console_info.val_acc_loss_str(val_acc, loss_value, time.time() - start_time)
            self.console_info.print_str_epoch(str_epoch, epoch_is_better)
            dict_val_loss = { "val_loss": loss_value }
            self.active_callbacks.on_epoch_end(epoch, logs=dict_val_loss)
            if self.model.stop_training:
                break
        # self.active_callbacks.on_train_end()
        return True
        
        
    def evaluate(self, filename):
        self.load_model_from_file(filename)
        return self.model.evaluate(self.x_test, self.y_test)
    
    
    def predict(self, filename):
        self.load_model_from_file(filename)
        return self.model.predict(self.x_test, steps=10)
    
    
    def compile_model(self,):
        self.model.compile(loss = self.loss, optimizer = self.optimizer, metrics = [self.metric])
        
        
    def __reshape_dataset_to_four_dims__(self, x):
        img_rows, img_cols, channels = x.shape[1], x.shape[2], 1
        if np.ndim(x) == 4:
            channels = np.shape(x)[3]
        x = x.reshape(x.shape[0], img_rows, img_cols, channels)
        return x, channels
    
    
    def __dataset_to_float__(self, x):
        return x.astype(np.float32)
    
    
    def __normalize_dataset__(self, x, channels, is_train_set=False):
        if channels == 1:
            return x / 255
        else:
            if is_train_set:
                self.train_mean = np.mean(x, axis=(0, 1, 2, 3))
                self.train_std = np.std(x, axis=(0, 1, 2, 3)) + 1e-7
            x -= self.train_mean
            x /= self.train_std
            return x
        
    
    def __pad_dataset__(self, x, channels, to_pad=False):
        if not to_pad:
            return x
        if channels == 1:
            x = tf.pad(x, [[0, 0], [2, 2], [2, 2], [0, 0]]).numpy()
            return x.repeat(3, axis=3)
        return x
    
    
    def __setup_data_augmentation__(self, ):
        self.datagen = ImageDataGenerator(
            featurewise_center=False,  # set input mean to 0 over the dataset
            samplewise_center=False,  # set each sample mean to 0
            featurewise_std_normalization=False,  # divide inputs by std of the dataset
            samplewise_std_normalization=False,  # divide each input by its std
            zca_whitening=False,  # apply ZCA whitening
            rotation_range=15,  # randomly rotate images in the range (degrees, 0 to 180)
            width_shift_range=0.1,  # randomly shift images horizontally (fraction of total width)
            height_shift_range=0.1,  # randomly shift images vertically (fraction of total height)
            horizontal_flip=True,  # randomly flip images
            vertical_flip=False)  # randomly flip images
        # (std, mean, and principal components if ZCA whitening is applied).
        self.datagen.fit(self.x_train)