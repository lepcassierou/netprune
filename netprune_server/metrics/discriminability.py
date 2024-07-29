import numpy as np

from metrics.abstract_metric import DataAwareMetric


class Discriminability(DataAwareMetric):
    def __init__(self, data) -> None:
        super().__init__(data)
        
        
    def __compute_nb_instances_to_process__(self, ):
        shape = np.shape(self.data)
        dims = np.ndim(self.data)
        initial_size = 1
        for length in range(1, dims):
            initial_size *= shape[length]
        return self.MEMORY_LIMIT // (initial_size * self.data_float_size)
        
        
    def __compute_average_activation_map_per_class__(self, indices_all_class):
        data_shape = np.shape(self.data)
        nb_inst_to_process = self.__compute_nb_instances_to_process__()
        
        # Compute sum of activation_maps to determine one average AM per class
        ind_dims = np.ndim(indices_all_class)
        if ind_dims == 1:
            nb_classes = len(indices_all_class)
            am_sum = np.zeros((nb_classes, data_shape[1], data_shape[2], data_shape[3]), dtype=np.float64)
            for num_class in range(nb_classes):
                step = 0
                indices = indices_all_class[num_class]
                while step < len(indices):
                    max_boundary = min(step + nb_inst_to_process, len(indices))
                    am_sliced = np.array(self.data[indices[step:max_boundary]], dtype=np.float64)
                    am_sum[num_class] = np.sum(am_sliced, axis=0)
                    del am_sliced
                    step += nb_inst_to_process
                am_sum[num_class] /= len(indices)
            return am_sum
        else:
            return None


    def compute_metric(self, indices_all_class):
        activation_map_per_class = self.__compute_average_activation_map_per_class__(indices_all_class)
        distances = []
        for class_i in range(len(activation_map_per_class)):
            for class_j in range(class_i+1, len(activation_map_per_class)):
                mse = (activation_map_per_class[class_i] - activation_map_per_class[class_j])
                distances.append( np.sqrt(np.sum(mse*mse, axis=(0, 1))) )
        distances = np.asarray(distances)
        return np.mean(distances, axis=0)