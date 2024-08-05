from abc import abstractmethod
import gc
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import model_from_json

from process.abstract_tr_ft import AbstractTrFt



class AbstractFineTuning(AbstractTrFt):
    def __init__(self, dataset_name='mnist', model_name='vgg16', epochs=10, batch_size=128, val_split_ratio=0.1, optimizer_name='Nadam', loss_name = 'CategoricalCrossentropy', metric_name='CategoricalAccuracy'):
        super().__init__(dataset_name, model_name, epochs, batch_size, val_split_ratio, optimizer_name, loss_name, metric_name)
    
    
    def __get_ft_filters_union_per_layer__(self, filters_per_metric):
        list_of_filters = []
        for metric, filters_list in filters_per_metric.items():
            if list_of_filters == []:
                list_of_filters = filters_list
            else:
                for filter_i in filters_list:
                    if filter_i not in list_of_filters:
                        list_of_filters.append(filter_i)
        return list_of_filters
                        
    
    def __compute_fintuning_filters_union__(self, finetuning_filters):
        # 1) Retrieve the indices of the pruned channels
        union_filters_list = {}
        if finetuning_filters == {}:
            print("No filters selected")
            self.model = model_from_json(self.reference_model.to_json())
        else:
            for layer_name, filters_per_metric in finetuning_filters.items():
                union_filters_list[layer_name] = self.__get_ft_filters_union_per_layer__(filters_per_metric)
                
                config = self.reference_model.get_layer(layer_name).get_config()
                if "filters" in config: # Convolution
                    self.reference_model.get_layer(layer_name).filters = len(union_filters_list[layer_name])
                elif "units" in config: # Dense
                    self.reference_model.get_layer(layer_name).units = len(union_filters_list[layer_name])
            self.model = model_from_json(self.reference_model.to_json())
        return union_filters_list
    
    
    def __layer_is_batchnorm__(self, config):
        return "batch_norm" in config["name"] or "bn" in config["name"]
    
    
    def __list_of_filters_to_keep__(self, ref_layer, layer, union_filters_list, filters_indices_all_layers, layer_index, curr_paramd_layer_index):
        nb_filters = layer.output_shape[-1]
        filters_list = None
        if ref_layer.name in union_filters_list:
            filters_list = np.asarray(union_filters_list[ref_layer.name])
            filters_list = np.sort(filters_list)
        else:
            filters_list = np.asarray(range(nb_filters))
        
        # Save the filters list for the next parameterized layer
        filters_indices_all_layers.append({
            "layer_index" : layer_index,
            "filters_list" : filters_list,
        })
        curr_paramd_layer_index += 1
        return filters_list, filters_indices_all_layers, curr_paramd_layer_index
    
    
    def __process_bias__(self, config, old_weights, filters_list, new_weights_w, layer):
        if config['use_bias']:
            old_weights_bias = old_weights[1]
            new_weights_bias = old_weights_bias[filters_list]

            new_weights = []
            new_weights.append(new_weights_w)
            new_weights.append(new_weights_bias)
            layer.set_weights(new_weights)
        else:
            new_weights = []
            new_weights.append(new_weights_w)
            layer.set_weights(new_weights)
        return layer
        
    
    def __process_first_weighted_layers__(self, old_weights, ref_layer, layer, union_filters_list, filters_indices_all_layers, layer_index, curr_paramd_layer_index, config):
        old_weights_w = old_weights[0]
        dim = layer.input_shape
        if len(dim) == 1:
            dim = dim[0]
        indices_sort_input_dimension = range(dim[-1])

        filters_list, filters_indices_all_layers, curr_paramd_layer_index = self.__list_of_filters_to_keep__(ref_layer, layer, union_filters_list, filters_indices_all_layers, layer_index, curr_paramd_layer_index)
        
        new_weights_w = None
        if len(old_weights_w.shape) == 2:
            new_weights_w = old_weights_w[indices_sort_input_dimension, :]
            new_weights_w = new_weights_w[:, filters_list]
        else: 
            new_weights_w = old_weights_w[:, :, indices_sort_input_dimension, :]
            new_weights_w = new_weights_w[:, :, :, filters_list]

        layer = self.__process_bias__(config, old_weights, filters_list, new_weights_w, layer)
        
        layer._trainable = True
        return filters_indices_all_layers, curr_paramd_layer_index
    
    
    def __process_other_weighted_layers__(self, old_weights, ref_layer, layer, union_filters_list, filters_indices_all_layers, layer_index, curr_paramd_layer_index, config):
        old_weights_w = old_weights[0]
        indices_sort_input_dimension = np.sort(np.asarray(filters_indices_all_layers[curr_paramd_layer_index-1]["filters_list"]))

        filters_list, filters_indices_all_layers, curr_paramd_layer_index = self.__list_of_filters_to_keep__(ref_layer, layer, union_filters_list, filters_indices_all_layers, layer_index, curr_paramd_layer_index)

        # Case of flatten that changes the weights to retrieve
        last_paramd_layer_index = filters_indices_all_layers[curr_paramd_layer_index-2]["layer_index"]
        last_paramd_layer = self.reference_model.get_layer(index=last_paramd_layer_index)
        is_first_fc = "units" in config and "filters" in last_paramd_layer.get_config()
        if is_first_fc:
            # TODO: Do not work if the flatten layer is not called "flatten", then, it does not work for multiple branches
            nopif = self.reference_model.get_layer(name="flatten").output_shape[-1] // last_paramd_layer.output_shape[-1] # Number of parameters in flatten equivalent to a channel in its previous layer
            flatten_sort_list_output = []
            for x in indices_sort_input_dimension:
                for nopif_index in range(nopif):
                    flatten_sort_list_output.append(x*nopif + nopif_index)
            new_weights_w = None
            if len(old_weights_w.shape) == 2:
                new_weights_w = old_weights_w[flatten_sort_list_output, :] # TODO: Empty flatten_list check ?
                new_weights_w = new_weights_w[:, filters_list]
            else: 
                new_weights_w = old_weights_w[:, :, flatten_sort_list_output, :]
                new_weights_w = new_weights_w[:, :, :, filters_list]

            layer = self.__process_bias__(config, old_weights, filters_list, new_weights_w, layer)

            layer._trainable = True
        else:
            new_weights_w = None
            if len(old_weights_w.shape) == 2:
                new_weights_w = old_weights_w[indices_sort_input_dimension, :]
                new_weights_w = new_weights_w[:, filters_list]
            else: 
                new_weights_w = old_weights_w[:, :, indices_sort_input_dimension, :]
                new_weights_w = new_weights_w[:, :, :, filters_list]

            if config['use_bias']:
                old_weights_bias = old_weights[1]
                new_weights_bias = old_weights_bias[filters_list]
                new_weights = []
                new_weights.append(new_weights_w)
                new_weights.append(new_weights_bias)

                layer.set_weights(new_weights)
            else:
                new_weights = []
                new_weights.append(new_weights_w)
                layer.set_weights(new_weights)
            layer._trainable = True
    
    
    def build_model_with_weights(self, finetuning_filters={}, filepath=''):
        self.reference_model = tf.keras.models.load_model(filepath, compile=False)
        self.reference_model.summary()
        union_filters_list = self.__compute_fintuning_filters_union__(finetuning_filters)
        

        # 2) Copy the right subset of old weights into the pruned model
        curr_paramd_layer_index = 0 # Count the number of parameterized layers (Conv, FC) 
        filters_indices_all_layers = []
        for layer_index, layer in enumerate(self.model.layers):
            ref_layer = self.reference_model.get_layer(index=layer_index)
            config = self.reference_model.get_layer(index=layer_index).get_config()
            if not self.__layer_is_batchnorm__(config):
                old_weights = ref_layer.get_weights()
                if len(old_weights) > 0: # Only weighted layers (Conv, FC)
                    if curr_paramd_layer_index == 0:
                        self.__process_first_weighted_layers__(old_weights, ref_layer, layer, union_filters_list, filters_indices_all_layers, layer_index, curr_paramd_layer_index, config)
                    else:
                        self.__process_other_weighted_layers__(old_weights, ref_layer, layer, union_filters_list, filters_indices_all_layers, layer_index, curr_paramd_layer_index, config)
    
    
    
    ####### Others #######
    def validate(self, filename):
        """ Evaluate the model on the evaluation dataset. Filename is the path to the model .h5 """
        self.load_model_from_file(filename)
        if self.custom_dataset:
            x_eval = np.load(f"{self.out_evaluation_dir}/x_eval")
            y_eval = np.load(f"{self.out_evaluation_dir}/y_eval")
            perfs = self.model.evaluate(x_eval, y_eval)
            del x_eval, y_eval
            gc.collect()
            return perfs
        else:
            return self.model.evaluate(self.x_evaluation, self.y_evaluation)