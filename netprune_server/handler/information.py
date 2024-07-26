class Information():
    def __init__(self, mongo) -> None:
        self.mongo = mongo
        
    ######################################
    # Updates                            #
    ######################################
    def init_progress(self, scenario_id):
        self.mongo.set_scenario_value(scenario_id, "progressStep", 0)
        self.mongo.set_scenario_value(scenario_id, "progressTotal", 100)
        
        
    def update_train_metrics(self, scenario_id, acc, loss, progress):
        self.mongo.set_scenario_value(scenario_id, 'accuracy', float(acc))
        self.mongo.set_scenario_value(scenario_id, 'loss', float(loss))
        self.mongo.set_scenario_value(scenario_id, 'progressStep', progress)
        
    
    def update_val_metrics(self, scenario_id, val_acc, val_loss, train_acc):
        self.mongo.push_scenario_value(scenario_id, 'valAccuracies', float(val_acc))
        self.mongo.push_scenario_value(scenario_id, 'losses', float(val_loss))
        self.mongo.push_scenario_value(scenario_id, 'trainAccuracies', float(train_acc))
        
        
    def update_test_metrics(self, scenario_id, test_results):
        self.mongo.set_scenario_value(scenario_id, 'loss', float(test_results[0]))
        self.mongo.set_scenario_value(scenario_id, 'accuracy', float(test_results[1]))
        
        
    def update_model_size(self, scenario_id, size):
        self.mongo.set_scenario_value(scenario_id, 'networkSize', size)
        
        
    def update_model_flops(self, scenario_id, size_gain, flops):
        self.mongo.set_scenario_value(scenario_id, 'sizeGain', size_gain)
        self.mongo.set_scenario_value(scenario_id, 'flops', flops)
    
    
    def update_layer_nodes_edges(self, scenario_id, nodes, edges):
        self.mongo.set_scenario_value(scenario_id, 'layerNodes', nodes)
        self.mongo.set_scenario_value(scenario_id, 'layerEdges', edges)
        
        
    def push_confusion(self, scenario_id, conf_matrix, img_ind_matrix):
        self.mongo.push_scenario_value(scenario_id, "confusionMatrix", conf_matrix)
        self.mongo.push_scenario_value(scenario_id, "indicesImages", img_ind_matrix)
        
        
    def set_instance_status_ready(self, instance_id):
        self.mongo.set_instance_value(instance_id, 'status', 'ready')
        
        
    def set_scenario_status_ready(self, scenario_id):
        self.mongo.set_scenario_value(scenario_id, 'status', 'ready')
        self.mongo.set_scenario_value(scenario_id, 'message', '')
        
        
    ######################################
    # Messages                           #
    ######################################
    def loading_dataset(self, scenario_id):
        self.mongo.set_scenario_value(scenario_id, "message", "Loading dataset...")
        
        
    def loading_model(self, scenario_id):
        self.mongo.set_scenario_value(scenario_id, "message", "Loading model...")
        
        
    def preparing_model(self, scenario_id):
        self.mongo.set_scenario_value(scenario_id, "message", "Preparing model...")
        
        
    def training_interruption(self, scenario_id):
        self.mongo.set_scenario_value(scenario_id, "message", "Training interrupted by the user...")
        
        
    def training_epoch(self, scenario_id, epoch, epoch_total, step, step_total):
        self.mongo.set_scenario_value(scenario_id, 'message', f'Training model... #Epoch {epoch}/{epoch_total} #Step {step}/{step_total}')
        
        
    def saving_training_model(self, scenario_id):
        self.mongo.set_scenario_value(scenario_id, 'message', "Saving the training model...")