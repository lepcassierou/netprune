class AvailableParameters():
    @staticmethod
    def get_datasets():
        return ['cifar10', 'fashion_mnist', 'mnist', 'cats_vs_dogs']
    
    
    @staticmethod
    def get_models():
        return ['lenet5', 'lenet300-100', 'lenet_4_variant', 'vgg16', 'two-layer', 'custom']
    
    
    @staticmethod
    def get_optimizers():
        return ['Adadelta', 'Adagrad', 'Adam', 'Adamax', 'Ftrl', 'Nadam', 'Optimizer', 'RMSprop', 'SGD']
    
    
    @staticmethod
    def get_losses():
        return ['BinaryCrossentropy', 'CategoricalCrossentropy', 'CategoricalHinge', 'CosineSimilarity', 'Hinge', 'Huber', 'KLD', 'KLDivergence', 'LogCosh', 'Loss', 'MAE', 'MAPE', 'MSE', 'MSLE', 'MeanAbsoluteError', 'MeanAbsolutePercentageError', 'MeanSquaredError', 'MeanSquaredLogarithmicError', 'Poisson', 'Reduction', 'SparseCategoricalCrossentropy', 'SquaredHinge']
    
    
    @staticmethod
    def get_metrics():
        return ['AUC', 'Accuracy', 'BinaryAccuracy', 'BinaryCrossentropy', 'CategoricalAccuracy', 'CategoricalCrossentropy', 'CategoricalHinge', 'CosineSimilarity', 'FalseNegatives', 'FalsePositives', 'Hinge', 'KLD', 'KLDivergence', 'LogCoshError', 'MAE', 'MAPE', 'MSE', 'MSLE', 'Mean', 'MeanAbsoluteError', 'MeanAbsolutePercentageError', 'MeanIoU', 'MeanRelativeError', 'MeanSquaredError', 'MeanSquaredLogarithmicError', 'MeanTensor', 'Metric', 'Poisson', 'Precision', 'PrecisionAtRecall', 'Recall', 'RecallAtPrecision', 'RootMeanSquaredError', 'SensitivityAtSpecificity', 'SparseCategoricalAccuracy', 'SparseCategoricalCrossentropy', 'SparseTopKCategoricalAccuracy', 'SpecificityAtSensitivity', 'SquaredHinge', 'Sum', 'TopKCategoricalAccuracy', 'TrueNegatives', 'TruePositives']