import os
import shutil

from connector.mongo_connector import Mongo
from abstract_handler import AbstractHandler
from information import Information
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
        training_obj.load_model()
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
            self.info.set_status_ready(tmp_instance_id)
        return self.default_response()
    
    
    def __compute_flops__(self, training_obj, scenario_id, model_path):
        flops = training_obj.get_model_flops()
        size_gain = os.stat(model_path).st_size
        self.info.update_model_flops(scenario_id, size_gain, flops)
        
    
    def __compute_activations__(self, training_obj, dataset_name, model_graph):
        Activations = self.lazy.lazy_typing_activations(dataset_name)
        model = training_obj.get_curr_model()
        loss = training_obj.get_loss()
        optimizer = training_obj.get_optimizer()
        metric = training_obj.get_metric()
        test_set = training_obj.get_test_set()
        
        activations = Activations(model, model_graph, loss, optimizer, metric, test_set)
        # conf_matrix, indices_images = compute_activations_stats(mongo, tr.get_current_model(), params['scenario_id'], tmp_scen['instanceId'], activations, tr.get_nb_classes(), tr.get_current_test_dataset(), dataset_name=dataset_name)
        # mongo.push_scenario_value(params['scenario_id'], "confusionMatrix", conf_matrix)
        # mongo.push_scenario_value(params['scenario_id'], "indicesImages", indices_images)
        # nodes_list, edges_list = model_graph.remove_activation_layers_from_model_graph()
        # mongo.set_scenario_value(params['scenario_id'], 'layerNodes', nodes_list)
        # mongo.set_scenario_value(params['scenario_id'], 'layerEdges', edges_list)
    
    
    def scenario_init(self, params):
        """ Compute statistics of filters based on their activation maps 
            Parameters:
                params (any): parameters of scenario_initialisation

            Returns:
        """
        mongo = Mongo()
        self.info = Information(mongo)
        
        tmp_scen = mongo.get_scenario(params['scenario_id'])
        tmp_inst = mongo.get_instance(tmp_scen['instanceId'])
        self.info.init_progress(params['scenario_id'])
        
        dataset_name = tmp_inst['datasetName']
        Training = self.lazy.lazy_typing_training(dataset_name)
        tr = Training(dataset_name=dataset_name, model_name=tmp_inst['modelName'], epochs=tmp_inst['epochs'], batch_size=tmp_inst['batchSize'], val_split_ratio=tmp_inst['validationSplitRatio'], optimizer_name=tmp_inst['optimizerName'], loss_name=tmp_inst['lossName'], metric_name=tmp_inst['metricName'])
        
        self.__load__(tr, tmp_inst['_id'], params['scenario_id'])
        is_training_finished, model_path = self.__train_model__(mongo, tr, params['scenario_id'], tmp_scen['instanceId'], tmp_scen['_id'], tmp_inst['epochs'])
        
        self.__evaluate_model_test__(tr, model_path, params['scenario_id'])
        
        model_graph = self.__extract_model_graph__(mongo, tr, params['scenario_id'], tmp_scen['instanceId'], tmp_scen['_id'], tmp_scen['userId'])
        
        if not is_training_finished:
            return self.__training_interrupted__(mongo, tmp_scen['instanceId'], params['scenario_id'], tmp_inst['statusQueue'])
        
        self.__compute_flops__(tr, params['scenario_id'], model_path)
        
        self.__compute_activations__(tr, dataset_name, model_graph)
        
        
        
        
        
        # Activations
        # Activations = self.lazy.lazy_typing_activations(dataset_name)
        # activations = Activations(tr.get_current_model(), model_graph, tr.get_current_loss(), tr.get_current_optimizer(), tr.get_current_metric(), tr.get_current_test_dataset())
        # conf_matrix, indices_images = compute_activations_stats(mongo, tr.get_current_model(), params['scenario_id'], tmp_scen['instanceId'], activations, tr.get_nb_classes(), tr.get_current_test_dataset(), dataset_name=dataset_name)
        # mongo.push_scenario_value(params['scenario_id'], "confusionMatrix", conf_matrix)
        # mongo.push_scenario_value(params['scenario_id'], "indicesImages", indices_images)
        # nodes_list, edges_list = model_graph.remove_activation_layers_from_model_graph()
        # mongo.set_scenario_value(params['scenario_id'], 'layerNodes', nodes_list)
        # mongo.set_scenario_value(params['scenario_id'], 'layerEdges', edges_list)
        
        # # Finish
        # mongo.set_scenario_value(params['scenario_id'], 'status', 'ready')
        # mongo.set_scenario_value(params['scenario_id'], 'message', '')
        # mongo.pull_instance_value(tmp_scen['instanceId'], 'statusQueue', params['scenario_id'])
        # if len(tmp_inst['statusQueue']) == 0:
        #     mongo.set_instance_value(tmp_scen['instanceId'], 'status', 'ready')

        # del activations
        # del tr
        # del model_graph
        # return self.default_response()
        
        
        # TODO: The rest is already DONE
        
        # tr_class = lazy_typing_train(dataset_name=dataset_name)
        # tr = tr_class(dataset_name=dataset_name, model_name=tmp_inst['modelName'], epochs=tmp_inst['epochs'], batch_size=tmp_inst['batchSize'], shuffle_buffer_size=tmp_inst['shuffleBufferSize'], val_split_ratio=tmp_inst['validationSplitRatio'], optimizer_name=tmp_inst['optimizerName'], loss_name=tmp_inst['lossName'], metric_name=tmp_inst['metricName'])
        
        # Load everything
        # mongo.set_scenario_value(params['scenario_id'], 'message', 'Importing dataset...')
        # tr.load_dataset(seed=tmp_inst['_id'])
        # mongo.set_scenario_value(params['scenario_id'], 'message', 'Importing training model...')
        # tr.load_model()
        # mongo.set_scenario_value(params['scenario_id'], 'message', 'Training model initialisation...')
        # tr.load_optimizer()
        # tr.load_loss()
        # tr.load_metric()
        # tr.load_callbacks()
        # tr.compile_model()

        # Run training
        # def train_checkpoint(epoch, epoch_total, step, step_total, acc, loss):
        #     scen = mongo.get_scenario(params['scenario_id'])
        #     if type(scen) == type(None):
        #         return False
        #     mongo.set_scenario_value(params['scenario_id'], 'accuracy', float(acc))
        #     mongo.set_scenario_value(params['scenario_id'], 'loss', float(loss))
        #     tmp = (epoch/epoch_total)*100 + (step/step_total)
        #     mongo.set_scenario_value(params['scenario_id'], 'progressStep', tmp)
        #     # stop or continue
        #     if scen['status'] == 'stop':
        #         mongo.set_scenario_value(params['scenario_id'], 'message', 'Training interrupted by the user.')
        #         return False
        #     mongo.set_scenario_value(params['scenario_id'], 'message', 'Training model...#Epoch ' + str(epoch) + '/' + str(epoch_total) + '#Step ' + str(step) + '/' + str(step_total))
        #     return True

        # def test_checkpoint(train_acc, val_acc, val_loss):
        #     mongo.push_scenario_value(params['scenario_id'], 'valAccuracies', float(val_acc))
        #     mongo.push_scenario_value(params['scenario_id'], 'losses', float(val_loss))
        #     mongo.push_scenario_value(params['scenario_id'], 'trainAccuracies', float(train_acc))

        # finished = True
        # path = os.getcwd()
        # dest_path = 'models/' + str(tmp_scen['instanceId']) + "/" + str(tmp_scen['_id'])
        # if not os.path.exists(path + "/" + dest_path):
        #     os.makedirs(dest_path)
        # filepath = path + '/' + dest_path + '/' + params['scenario_id'] + '.h5'

        # if tmp_inst['epochs'] > 0:
        #     finished = tr.train(train_checkpoint, test_checkpoint, filepath)
        # else:
        #     # Save model
        #     mongo.set_scenario_value(params['scenario_id'], 'message', 'Saving the training model...')
        #     tr.saveModel(filepath)

        # # Evaluation on Test dataset
        # evaluation = tr.evaluate(filepath)
        # mongo.set_scenario_value(params['scenario_id'], 'loss', float(evaluation[0]))
        # mongo.set_scenario_value(params['scenario_id'], 'accuracy', float(evaluation[1]))

        # mongo.set_scenario_value(params['scenario_id'], 'message', "Extracting the model's layers...")
        # layers_nodes, layers_edges = tr.saveConfig()

        # # Build layers
        # nodes = []
        # edges = []
        # layersMap = {}
        # size = 0
        # for layer in layers_nodes:
        #     layer['instanceId'] = tmp_scen['instanceId']
        #     layer['scenarioId'] = tmp_scen['_id']
        #     layer['userId'] = tmp_scen['userId']
        #     tmp = mongo.insert_layer(layer)
        #     nodes.append(str(tmp))
        #     layersMap[layer['name']] = str(tmp)
        #     size += layer['params']
        # for l_edge in layers_edges:
        #     tmp = {}
        #     tmp['source'] = layersMap[l_edge['source']]
        #     tmp['target'] = layersMap[l_edge['target']]
        #     edges.append(tmp)
        # mongo.set_scenario_value(params['scenario_id'], 'networkSize', size)

        # # Build Abstract Graph of model for later (when computing activation)
        # model_graph = ModelGraph(nodes, layers_nodes, edges)

        # if not is_training_finished:
        #     mongo.pull_instance_value(tmp_scen['instanceId'], 'statusQueue', params['scenario_id'])
        #     if len(tmp_inst['statusQueue']) == 1:
        #         mongo.set_instance_value(tmp_scen['instanceId'], 'status', 'ready')
        #     return {
        #         "statusCode": 200,
        #         "body": True,
        #     }

        # Compute flops
        # mongo.set_scenario_value(params['scenario_id'], 'sizeGain', os.stat(model_path).st_size)
        # flops = tr.get_model_flops()
        # mongo.set_scenario_value(params['scenario_id'], 'flops', flops)

        # # Compute activations
        # # activations = Activations(tr.get_current_model(), model_graph, tr.get_current_loss(), tr.get_current_optimizer(), tr.get_current_metric(), tr.get_current_test_dataset())
        # activations_class = lazy_typing_act(dataset_name=dataset_name)
        # activations = activations_class(tr.get_current_model(), model_graph, tr.get_current_loss(), tr.get_current_optimizer(), tr.get_current_metric(), tr.get_current_test_dataset())
        # conf_matrix, indices_images = compute_activations_stats(mongo, tr.get_current_model(), params['scenario_id'], tmp_scen['instanceId'], activations, tr.get_nb_classes(), tr.get_current_test_dataset(), dataset_name=dataset_name)
        # mongo.push_scenario_value(params['scenario_id'], "confusionMatrix", conf_matrix)
        # mongo.push_scenario_value(params['scenario_id'], "indicesImages", indices_images)
        # nodes_list, edges_list = model_graph.remove_activation_layers_from_model_graph()
        # mongo.set_scenario_value(params['scenario_id'], 'layerNodes', nodes_list)
        # mongo.set_scenario_value(params['scenario_id'], 'layerEdges', edges_list)

        
        
        
        
    
    
    def scenario_deletion(self, params):
        path = os.getcwd()
        to_rm = f"{path}/models/{params['instance_id']}/{params['scenario_id']}/"
        shutil.rmtree(to_rm)
        return self.default_response()
    
    
    def scenario_inheritance(self, params):
        pass
    
    
    