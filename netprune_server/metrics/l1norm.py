import numpy as np

from metrics.abstract_metric import DataAwareMetric


class L1Norm(DataAwareMetric):
    def __init__(self, data) -> None:
        super().__init__(data)
        
        
    def compute_metric(self):
        # Shape data : (nb_images, ker_w, ker_h, nb_filters)
        start = 0
        step = 200
        stop = len(self.data)
        nb_filters = np.shape(self.data)[-1]
        norm = np.zeros(nb_filters)
        while start < stop:
            norm += np.sum(np.abs(self.data[start:min(start+step, stop)]), axis=(0, 1, 2))
            start += step
        return norm