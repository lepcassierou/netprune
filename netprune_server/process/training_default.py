import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import time

from abstract_training import AbstractTraining
from handler.console_information import ConsoleInformation
from train_test_steps import TrainStep, TestStep

class TrainingDefault(AbstractTraining):
    def __init__(self, dataset_name='mnist', model_name='vgg16', epochs=10, batch_size=128, val_split_ratio=0.1, optimizer_name='Nadam', loss_name='CategoricalCrossentropy', metric_name='CategoricalAccuracy'):
        super().__init__(dataset_name, model_name, epochs, batch_size, val_split_ratio, optimizer_name, loss_name, metric_name)
        self.console_info = ConsoleInformation()
        
        
    def dataset_name_to_dataset(self, name):
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
        
        
    def load_dataset(self, dataset_name='', model_name='', batch_size=0, to_pad=False, augment_data=False, seed=0):
        self.random_seed = [ord(i) for i in list(seed)]
        dataset, val_split_ratio, test_set_split_ratio = self.dataset_name_to_dataset(dataset_name)

        if model_name != '':
            self.model_name = model_name
            
        (x_train, y_train), (x_test, y_test) = dataset.load_data()
        self.num_classes = np.amax(y_train)+1
        x_train, y_train = self.cut_eval_dataset(x_train, y_train, self.num_classes, self.model_name, test_set_split_ratio)
        
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
        self.val_dataset = val_dataset.batch(batch_size)
        self.x_test = x_test
        self.y_test = y_test
        print(np.shape(self.x_train), np.shape(self.y_train))
    
    
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
    
    
    def train(self, train_checkpoint, test_checkpoint, checkpoint_file_path):
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
                self.console_info.advancement(40, step, nb_steps)
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
            
            
            
            
