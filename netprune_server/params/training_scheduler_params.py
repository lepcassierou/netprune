import tensorflow as tf

""" !!! The documentation of the parameters is taken from www.tensorflow.org !!! """
class TrainingScheduler():
    def __init__(self) -> None:
        self.initial_lr = 1e-3
        self.scheduler = False
        self.early_stopping = True
        self.lr_reduce_on_plateau = False
        self.params_scheduler()
        self.params_lr_reduce_on_plateau()
        self.params_early_stopping()
        
        
    def __lr_scheduler__(self, epoch):
        decay = epoch >= self.epochs*0.75 and 2 or epoch >= self.epochs*0.5 and 1 or 0
        return self.start_lr * (0.1**decay)
    
    
    def params_scheduler(self):
        self.scheduler_verbose = 0 # Integer. 0: quiet, 1: log update messages. 
        self.scheduler_fct = self.__lr_scheduler__ # A function that takes an epoch index (integer, indexed from 0) and current learning rate (float) as inputs and returns a new learning rate as output (float). 
        
        
    def params_lr_reduce_on_plateau(self):
        self.rlrop_monitor='val_loss' # String. Quantity to be monitored. 
        self.rlrop_factor = 0.1 # Float. Factor by which the learning rate will be reduced. new_lr = lr * factor. 
        self.rlrop_patience = 10 # Integer. Number of epochs with no improvement after which learning rate will be reduced. 
        self.rlrop_verbose = 0 # Integer. 0: quiet, 1: update messages. 
        self.rlrop_mode = 'auto' # String. One of {'auto', 'min', 'max'}. In 'min' mode, the learning rate will be reduced when the quantity monitored has stopped decreasing; in 'max' mode it will be reduced when the quantity monitored has stopped increasing; in 'auto' mode, the direction is automatically inferred from the name of the monitored quantity. 
        self.rlrop_min_delta = 1e-4 # Float. Threshold for measuring the new optimum, to only focus on significant changes. 
        self.rlrop_cooldown = 0 # Integer. Number of epochs to wait before resuming normal operation after the learning rate has been reduced. 
        self.rlrop_min_lr = 0.0 # Float. Lower bound on the learning rate. 
        
        
    def params_early_stopping(self):
        self.es_monitor = 'val_loss' # Quantity to be monitored. Defaults to "val_loss". 
        self.es_min_delta = 1e-4 # Minimum change in the monitored quantity to qualify as an improvement, i.e. an absolute change of less than min_delta, will count as no improvement. Defaults to 0. 
        self.es_patience = 5 # Number of epochs with no improvement after which training will be stopped. Defaults to 0. 
        self.es_verbose = 0 # Verbosity mode, 0 or 1. Mode 0 is silent, and mode 1 displays messages when the callback takes an action. Defaults to 0. 
        self.es_mode = 'auto' # One of {"auto", "min", "max"}. In min mode, training will stop when the quantity monitored has stopped decreasing; in "max" mode it will stop when the quantity monitored has stopped increasing; in "auto" mode, the direction is automatically inferred from the name of the monitored quantity. Defaults to "auto". 
        self.es_baseline = None # Baseline value for the monitored quantity. If not None, training will stop if the model doesn't show improvement over the baseline. Defaults to None. 
        self.es_restore_best_weights = True # Whether to restore model weights from the epoch with the best value of the monitored quantity. If False, the model weights obtained at the last step of training are used. An epoch will be restored regardless of the performance relative to the baseline. If no epoch improves on baseline, training will run for patience epochs and restore weights from the best epoch in that set. Defaults to False. 
        
        
    def get_optimizer_from_name(self, optimizer_name):
        if optimizer_name.lower() == "adadelta":
            return self.params_adadelta()
        if optimizer_name.lower() == "adagrad":
            return self.params_adagrad()
        if optimizer_name.lower() == "adam":
            return self.params_adam()
        if optimizer_name.lower() == "adamax":
            return self.params_adamax()
        if optimizer_name.lower() == "ftrl":
            return self.params_ftrl()
        if optimizer_name.lower() == "nadam":
            return self.params_nadam()
        if optimizer_name.lower() == "rmsprop":
            return self.params_rmsprop()
        if optimizer_name.lower() == "sgd":
            return self.params_sgd()
        else:
            raise ValueError(f"No optimizer is defined for optimizer name: {optimizer_name}")
        
        
    def params_adadelta(self):
        return tf.keras.optimizers.Adadelta(
            learning_rate = self.initial_lr,
            rho = 0.95,
            epsilon = 1e-07,
            name = 'adadelta',
        )
        
        
    def params_adagrad(self):
        return tf.keras.optimizers.Adagrad(
            learning_rate = self.initial_lr,
            initial_accumulator_value = 0.1,
            epsilon = 1e-07,
            name = 'adagrad',
        )
    
    
    def params_adam(self):
        return tf.keras.optimizers.Adam(
            learning_rate = self.initial_lr,
            beta_1 = 0.9,
            beta_2 = 0.999,
            epsilon = 1e-07,
            amsgrad = False,
            name = 'adam',
        )
     
     
    def params_adamax(self):
        return tf.keras.optimizers.Adamax(
            learning_rate = self.initial_lr,
            beta_1 = 0.9,
            beta_2 = 0.999,
            epsilon = 1e-07,
            name = 'adamax',
        )
    
    
    def params_ftrl(self):
        return tf.keras.optimizers.Ftrl(
            learning_rate = self.initial_lr,
            learning_rate_power = -0.5,
            initial_accumulator_value = 0.1,
            l1_regularization_strength = 0.0,
            l2_regularization_strength = 0.0,
            l2_shrinkage_regularization_strength = 0.0,
            name = 'ftrl',
        )
    
    
    def params_nadam(self):
        return tf.keras.optimizers.Nadam(
            learning_rate = self.initial_lr,
            beta_1 = 0.9,
            beta_2 = 0.999,
            epsilon = 1e-07,
            name = 'nadam',
        )
    
    
    def params_rmsprop(self):
        return tf.keras.optimizers.RMSprop(
            learning_rate = self.initial_lr,
            rho = 0.9,
            momentum = 0.0,
            epsilon = 1e-07,
            centered = False,
            name = 'rmsprop',
        )
    
    
    def params_sgd(self):
        return tf.keras.optimizers.SGD(
            learning_rate = self.initial_lr,
            momentum = 0.9,
            nesterov = True,
            decay = 1e-6,
            name = 'SGD',
        )