import gc
import os
import shutil

from connector.mongo_connector import Mongo
from handler.abstract_handler import AbstractHandler
from handler.information import Information
from handler.db_layer_name import LayerName2DBName, DBName2LayerName, StatsSaver
from process.confusion_matrix import ConfusionMatrix
from process.lazy_typing import LazyTyping
from process.model_graph import ModelGraph
from process.train_test_checkpoints import TrainCheckpoint, TestCheckpoint


class ScenarioHandler(AbstractHandler):
    def __init__(self) -> None:
        self.info = None
        self.lazy = LazyTyping()
        
        
    def __load__(self, training_obj, instance_id, scenario_id):
        self.info.loading_dataset(scenario_id)
        training_obj.load_dataset(seed=instance_id)
        self.info.loading_model(scenario_id)
        training_obj.load_architecture()
        self.info.preparing_model(scenario_id)
        training_obj.load_optimizer()
        training_obj.load_loss()
        training_obj.load_metric()
        training_obj.load_callbacks()
        training_obj.compile_model()
    
    
    def __train_model__(self, mongo, training_obj, scenario_id, tmp_instance_id, tmp_scenario_id, epochs):
        train_c = TrainCheckpoint(mongo, scenario_id)
        test_c = TestCheckpoint(mongo, scenario_id)
        is_training_finished = True
        path = os.getcwd()
        dest_path = f"models/{tmp_instance_id}/{tmp_scenario_id}"
        if not os.path.exists(f"{path}/{dest_path}"):
            os.makedirs(dest_path)
        model_path = f"{path}/{dest_path}/{scenario_id}.h5"

        if epochs > 0:
            is_training_finished = training_obj.train(train_c.train_checkpoint, test_c.test_checkpoint, model_path)
        else:
            # Save model
            self.info.saving_training_model(scenario_id)
            training_obj.save_model(model_path)
        return is_training_finished, model_path
    
    
    def __evaluate_model_test__(self, training_obj, model_path, scenario_id):
        evaluation = training_obj.evaluate(model_path)
        self.info.update_test_metrics(scenario_id, evaluation)
        
        
    def __extract_model_graph__(self, mongo, training_obj, scenario_id, tmp_instance_id, tmp_scenario_id, tmp_user_id):
        mongo.set_scenario_value(scenario_id, 'message', "Extracting the model's layers...")
        layers_nodes, layers_edges = training_obj.save_config()

        # Build layers
        nodes = []
        edges = []
        layers_map = {}
        size = 0
        for layer in layers_nodes:
            layer['instanceId'] = tmp_instance_id
            layer['scenarioId'] = tmp_scenario_id
            layer['userId'] = tmp_user_id
            tmp = mongo.insert_layer(layer)
            nodes.append(str(tmp))
            layers_map[layer['name']] = str(tmp)
            size += layer['params']
        for l_edge in layers_edges:
            tmp = {}
            tmp['source'] = layers_map[l_edge['source']]
            tmp['target'] = layers_map[l_edge['target']]
            edges.append(tmp)
        self.info.update_model_size(scenario_id, size)
        # Build Abstract Graph of model for later (when computing activation)
        return ModelGraph(nodes, layers_nodes, edges)
    
    
    def __training_interrupted__(self, mongo, tmp_instance_id, scenario_id, tmp_instance_status):
        mongo.pull_instance_value(tmp_instance_id, 'statusQueue', scenario_id)
        if len(tmp_instance_status) == 1:
            self.info.set_instance_status_ready(tmp_instance_id)
        return self.default_response()
    
    
    def __compute_flops__(self, training_obj, scenario_id, model_path):
        flops = training_obj.get_model_flops()
        size_gain = os.stat(model_path).st_size
        self.info.update_model_flops(scenario_id, size_gain, flops)
        
    
    def __compute_activations_stats__(self, mongo, model, scenario_id, instance_id, activations, nb_classes, test_dataset, dataset_name=None):
        """ Compute statistics of filters based on their activation maps 
            Parameters:
                mongo (any): database object
                model (tf-keras Model): model that has been trained
                scenario_id (string): id of scenario
                instance_id (string): id of instance
                activations (ndarray): normalized activation maps per layer
                nb_classes (int): number of classes
                test_dataset (ndarray): test dataset

            Returns:
                List, List : confusion matrix, images indices that belong to each cell of confusion matrix 
        """
        # Extract and normalize activations per filter
        db_layers = mongo.get_layers_by_scenario_id(scenario_id)
        ln2db = LayerName2DBName(db_layers)
        db2ln = DBName2LayerName(mongo)
        stats_saver = StatsSaver(mongo)
        
        repository = f"models/{instance_id}/{scenario_id}/"

        # Compute statistics
        activations.compute_normalized_activations(repository, ln2db.get_db_name_from_layername)

        Statistics = self.lazy.lazy_typing_stats(dataset_name=dataset_name)
        stats = Statistics(model, repository, nb_classes, test_dataset)
        stats.statistics_from_normalized_data(db2ln.get_layername_from_db_name, stats_saver.save_statistics_to_db)

        cm = ConfusionMatrix(nb_classes)
        confusion_matrix, confusion_images = cm.compute_confusion_matrices(activations)
        return confusion_matrix, confusion_images
    
    
    def __compute_activations__(self, mongo, training_obj, dataset_name, model_graph, scenario_id, tmp_instance_id):
        Activations = self.lazy.lazy_typing_activations(dataset_name)
        model = training_obj.get_curr_model()
        loss = training_obj.get_loss()
        optimizer = training_obj.get_optimizer()
        metric = training_obj.get_metric()
        test_set = training_obj.get_test_set()
        nb_classes = training_obj.get_nb_classes()
        
        activations = Activations(model, model_graph, loss, optimizer, metric, test_set)
        conf_matrix, indices_images = self.__compute_activations_stats__(mongo, model, scenario_id, tmp_instance_id, activations, nb_classes, test_set, dataset_name=dataset_name)
        
        self.info.push_confusion(scenario_id, conf_matrix, indices_images)
        del activations
        
    
    def __remove_activation_layers__(self, model_graph, scenario_id):
        nodes_list, edges_list = model_graph.remove_activation_layers_from_model_graph()
        self.info.update_layer_nodes_edges(scenario_id, nodes_list, edges_list)
    
    
    def scenario_init(self, params):
        """ Compute statistics of filters based on their activation maps 
            Parameters:
                params (any): parameters of scenario_initialisation

            Returns:
        """
        mongo = Mongo()
        self.info = Information(mongo)
        
        scenario_id = params['scenario_id']
        tmp_scen = mongo.get_scenario(scenario_id)
        tmp_instance_id = tmp_scen['instanceId']
        tmp_inst = mongo.get_instance(tmp_instance_id)
        self.info.init_progress(scenario_id)
        
        dataset_name = tmp_inst['datasetName']
        Training = self.lazy.lazy_typing_training(dataset_name)
        tr = Training(dataset_name=dataset_name, model_name=tmp_inst['modelName'], epochs=tmp_inst['epochs'], batch_size=tmp_inst['batchSize'], val_split_ratio=tmp_inst['validationSplitRatio'], optimizer_name=tmp_inst['optimizerName'], loss_name=tmp_inst['lossName'], metric_name=tmp_inst['metricName'])
        
        self.__load__(tr, tmp_inst['_id'], scenario_id)
        is_training_finished, model_path = self.__train_model__(mongo, tr, scenario_id, tmp_instance_id, tmp_scen['_id'], tmp_inst['epochs'])
        
        self.__evaluate_model_test__(tr, model_path, scenario_id)
        
        model_graph = self.__extract_model_graph__(mongo, tr, scenario_id, tmp_instance_id, tmp_scen['_id'], tmp_scen['userId'])
        
        if not is_training_finished:
            return self.__training_interrupted__(mongo, tmp_instance_id, scenario_id, tmp_inst['statusQueue'])
        
        self.__compute_flops__(tr, scenario_id, model_path)
        
        self.__compute_activations__(mongo, tr, dataset_name, model_graph, scenario_id, tmp_instance_id)
        
        self.__remove_activation_layers__(model_graph, scenario_id)
        
        self.info.set_scenario_status_ready(scenario_id)
        
        mongo.pull_instance_value(tmp_instance_id, 'statusQueue', scenario_id)
        if len(tmp_inst['statusQueue']) == 0:
            mongo.set_instance_value(tmp_instance_id, 'status', 'ready')
        
        del tr
        del model_graph
        gc.collect()
        return self.default_response()
        
    
    def scenario_deletion(self, params):
        path = os.getcwd()
        to_rm = f"{path}/models/{params['instance_id']}/{params['scenario_id']}/"
        shutil.rmtree(to_rm)
        return self.default_response()
    
    
    def scenario_inheritance(self, params):
        pass
    
    
    