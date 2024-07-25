import numpy as np
from keract import get_activations

from process.model_graph import * 


class ActivationsDefault:
    def __init__(self, model, model_graph, loss, optimizer, metric, test_dataset):
        self.model = model
        self.model_graph = model_graph
        self.loss = loss
        self.optimizer = optimizer
        self.metric = metric
        self.x_test, self.y_test = test_dataset

    def get_labels(self):
        return self.y_test

    
    def compile_model(self):
        self.model.compile(loss = self.loss, optimizer = self.optimizer, metrics = [self.metric])


    def evaluate(self):
        self.compile_model()
        return self.model.evaluate(self.x_test, self.y_test)


    def predict(self):
        self.compile_model()
        return self.model.predict(self.x_test, steps=100)


    def get_next_activation_layer(self, db_conv_layer):
        children = self.model_graph.get_children(db_conv_layer)
        for child in children:
            if self.model_graph.get_type(child) == "Activation":
                return child, self.model_graph.get_real_name(child)
        return None, None # Recursion needed in case Activation layer does not follow directly a Conv layer


    def is_output_desired(self, layer_name):
        if "activation" in layer_name:
            return False
        if "batch_norm" in layer_name or "bn" in layer_name:
            return False
        if "dropout" in layer_name:
            return False
        if "pool" in layer_name:
            return False
        if "input" in layer_name:
            return False
        if "flatten" in layer_name:
            return False
        return True


    def compute_activations_single_layer(self, repository, true_layer_name, layer, layer_filename):
        layer_name = layer.name
        if self.is_output_desired(true_layer_name):
            # print("Activations of layer : ", layer_name, layer.output_shape)
            # 1) Extract the activations
            instances_shape = (self.x_test.shape[0], *[i for i in layer.output_shape[1:]])
            # print("Instances_shape : ", instances_shape)
            instances = np.ndarray(instances_shape, dtype=np.float64)
            start = 0
            step = 200
            stop = len(self.x_test)
            while start < stop:
                keract_inputs = self.x_test[start:min(start+step, stop)]
                instances[start:min(start+step, stop)] = get_activations(model=self.model, x=keract_inputs, layer_names=layer_name).get(layer_name)
                start += step

            # print("Extraction DONE")
            # 2) Normalize activations per layer
            # Compute the number max of instances to treat at a 
            # time according to the memory capacities
            nb_data = 64 # Type : Float64
            shape = np.shape(instances)
            dims = len(shape)
            for length in range(1, dims):
                nb_data *= shape[length]

            min_val = []
            max_val = []
            memory_limit = 8000000000
            nb_inst_to_process = memory_limit // nb_data
            step = 0
            while step < shape[0]:
                # Slice data according to memory limits
                data_sliced = instances[step : min(step + nb_inst_to_process, shape[0])]

                # Find min, max for each slice
                sliced_min = np.amin(data_sliced, axis=tuple(range(data_sliced.ndim - 1)))
                sliced_max = np.amax(data_sliced, axis=tuple(range(data_sliced.ndim - 1)))

                min_val.append(sliced_min.reshape(sliced_min.shape + (1,)*(dims - sliced_min.shape[0])))
                max_val.append(sliced_max.reshape(sliced_max.shape + (1,)*(dims - sliced_max.shape[0])))
                
                # Increase step
                step += nb_inst_to_process
            min_val = np.amin(min_val)
            max_val = np.amax(max_val)
            max_min = max_val - min_val

            step = 0
            while step < shape[0]:
                # 1) Slice data according to memory limits
                data_sliced = instances[step : min(step + nb_inst_to_process, shape[0])] # View on instances
                data_sliced -= min_val
                data_sliced /= max_min

                # Remove nan values
                err = np.isnan(data_sliced)
                data_sliced[err] = 0

                # Remove infinite values
                err = np.isinf(data_sliced)
                data_sliced[err] = 0
                
                # Increase step
                step += nb_inst_to_process

            # Write instances to files
            print("DB_NAME : ", layer_name, " ", layer_filename)
            if layer_filename is None:
                print("The activation maps of the layer : ", layer_name, " could not be saved because the layer does not exist.")
            else:
                np.save(repository + layer_filename, instances)


    def compute_normalized_activations(self, repository, get_db_name):
        # Compile model in case it is not done already
        self.compile_model()
        # Repository should contain "/"
        self.model.summary()
        for layer in self.model.layers:
            true_layer_name = layer.name
            if "conv" in layer.name or "dense" in layer.name:
                # TODO: Check whether Activation is a function within a layer or an individual layer
                true_layer_db_name = get_db_name(true_layer_name)
                activ_db_name, activ_real_name = self.get_next_activation_layer(layer, true_layer_db_name)
                if activ_db_name is None:
                    self.compute_activations_single_layer(repository, true_layer_name, layer, true_layer_db_name)    
                else:
                    activation_layer = self.model.get_layer(name=activ_real_name)
                    self.compute_activations_single_layer(repository, true_layer_name, activation_layer, true_layer_db_name)
            else:
                true_layer_db_name = get_db_name(true_layer_name)
                self.compute_activations_single_layer(repository, true_layer_name, layer, true_layer_db_name)