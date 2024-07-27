import numpy as np

from metrics.abstract_metric import DataAwareMetric


# Data-aware metric Hu et al.
class APoZ(DataAwareMetric):
    def __init__(self, data) -> None:
        super().__init__(data)
        
        
    def compute_metric(self, threshold=1e-4):
        data_shape = np.shape(self.data)
        data_dims = np.ndim(self.data)
        nb_samples = data_shape[0]
        nb_channels = 1 # Other layers
        if data_dims > 2: # Conv layers
            nb_channels = np.prod(data_shape[1:data_dims-1])
        
        apoz = np.ndarray((data_shape[-1]), dtype=np.float32)
        for channel in range(len(apoz)):
            apoz[channel] = np.count_nonzero(self.data[..., channel] < threshold)
        apoz /= (nb_samples * nb_channels)
        apoz *= 100.
        return apoz