import numpy as np
import os

from metrics.discriminability import Discriminability
from metrics.apoz import APoZ
from metrics.l1norm import L1Norm


class MetricsDefault:
    def __init__(self, trained_model, norm_data_path, nb_classes, test_dataset):
        self.norm_data_path = norm_data_path
        self.nb_classes = nb_classes
        self.x_test, self.y_test = test_dataset
        self.MEMORY_LIMIT = 8000000000 
        self.trained_model = trained_model
        

    def metrics_from_normalized_data(self, get_layername_from_db_name, save_metrics_to_db):
        for file in os.listdir(self.norm_data_path):
            if ".npy" in file:
                print("To load : ", file)
                norm_data = np.load(os.path.join(self.norm_data_path, file))
                file_name = get_layername_from_db_name(file.split('.npy')[0])
                print("Loaded file : ", file, file_name)
                metrics = self.compute_metrics(file_name, norm_data)
                
                # Write_aggregated_data_to_file(norm_data, aggregated_directory, file)
                save_metrics_to_db(file.split(".npy", 1)[0], metrics)
                del norm_data
                del metrics
                
                
    def to_mongo_obj(self, data):
        return data.tolist()
    
    
    def format_data_shape(self, data):
        if np.ndim(data) == 2:
            return data[:, None, None, :]
        elif np.ndim(data) == 4:
            return data
        else:
            raise NotImplementedError("Data shape is not supported : Shape =", np.shape(data))
        

    def compute_metrics(self, filename, data):
        corrected_data = self.format_data_shape(data)
        data_shape = corrected_data.shape

        data_squeezed = self.compute_activation_metric(corrected_data) # shape = (nb_instances, nb_filters)

        # Create an array containing the instances indices that belong to each cell of the confusion matrix
        indices_all_class = self.create_instance_indices_array()
        indices_all_class = np.asarray(indices_all_class)

        # Compute the average of each instance activations for each filter, for each class
        data_average = self.compute_average_per_class(indices_all_class, data_squeezed) # shape = [nb_class, nb_filters]

        ####### Compute filter score metrics #######
        discriminability = Discriminability(corrected_data).compute_metric(indices_all_class)
        print("Computed metric DISCRIMINABILITY")
        
        apoz = APoZ(corrected_data).compute_metric()
        print("Computed metric APoZ")
        
        l1norm_activ = L1Norm(corrected_data).compute_metric()
        print("Computed metric ACTIV_NORM")

        nb_filters = data_shape[-1]
        statistics = {}
        filters_obj = []

        for filter_num in range(nb_filters):
            filters_obj.append({
                'id' : filter_num, 
                'classes' : self.to_mongo_obj(data_average[:, filter_num]),
                'metrics' : {
                    'm0' : filter_num,
                    'm1' : self.to_mongo_obj(discriminability[filter_num]),
                    'm2' : self.to_mongo_obj(apoz[filter_num]),
                    'm3' : self.to_mongo_obj(l1norm_activ[filter_num]),
                },
            })
        
        metrics_obj = {
            'm0' : {
                'title' : 'Class Pairwise Difference',
                'desc' : 'Pairwise difference between the average activations of two selected classes.',
                'order' : "ascending",
            },
            'm1' : {
                'title' : 'Discriminability',
                'desc' : 'Sum of distances between every two classes, computed by averaging the activation maps of every sample of a class',
                'order' : 'descending'
            },
            'm2' : {
                'title' : 'APoZ',
                'desc' : 'Average Percentage of Zeros within activation maps',
                'order' : 'ascending'
            },
            'm3' : {
                'title' : 'L1-Norm of activations',
                'desc' : 'L1-Norm of activation maps',
                'order' : 'descending'
            }
        }

        statistics['filters'] = filters_obj
        statistics['metrics'] = metrics_obj
        return statistics


    def compute_activation_metric(self, data):
        shape = data.shape
        data_float_size = 64
        dims = len(shape)
        for length in range(1, dims):
            data_float_size *= shape[length]

        nb_inst_to_process = self.MEMORY_LIMIT // data_float_size
        activations_count = shape[1] * shape[2]

        # Compute sum of data along axis 1 and 2, by chunk
        step = 0
        data_sum = np.zeros((shape[0], shape[-1]), dtype=np.float64)
        while step < shape[0]:
            max_boundary = min(step + nb_inst_to_process, shape[0])
            data_sliced = np.asarray(data[step:max_boundary], dtype=np.float64)
            data_sum[step:max_boundary] = np.sum(data_sliced, axis=(1,2))
            step += nb_inst_to_process
        return data_sum / activations_count


    def create_instance_indices_array(self):
        labels = np.argmax(self.y_test, axis = 1)
        if np.argwhere(labels < 0).size > 0:
            raise IndexError("Class prediction number should not be less than 0")
        if np.argwhere(labels >= self.nb_classes).size > 0:
            raise IndexError("Class prediction number should not exceed the number of classes")
        indices_all_labels = []
        for num_class in range(self.nb_classes):
            indices_per_class = (labels == num_class).nonzero()[0]
            indices_all_labels.append(indices_per_class)
        return indices_all_labels


    def compute_average_per_class(self, indices_all_class, squeezed_data):
        average_per_class = []
        ind_dims = np.ndim(indices_all_class)
        if ind_dims == 1:
            for indices in indices_all_class:
                nb_indices = len(indices)
                if nb_indices > 0:
                    average_values = np.mean(squeezed_data[indices], axis=0)
                    average_per_class.append(average_values)
            return np.asarray(average_per_class, dtype=np.float64)
        else:
            return None