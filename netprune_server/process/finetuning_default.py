from process.abstract_finetuning import AbstractFineTuning

class FineTuningDefault(AbstractFineTuning):
    pass
    # def __init__(self, dataset_name='mnist', model_name='vgg16', epochs=10, batch_size=128, val_split_ratio=0.1, optimizer_name='Nadam', loss_name='CategoricalCrossentropy', metric_name='CategoricalAccuracy'):
    #     super().__init__(dataset_name, model_name, epochs, batch_size, val_split_ratio, optimizer_name, loss_name, metric_name)