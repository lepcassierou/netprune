from handler.information import Information


class TrainCheckpoint():
    def __init__(self, mongo, scenario_id) -> None:
        self.mongo = mongo
        self.info = Information(self.mongo)
        self.scenario_id = scenario_id


    def train_checkpoint(self, epoch, epoch_total, step, step_total, acc, loss):
        scen = self.mongo.get_scenario(self.scenario_id)
        if type(scen) == type(None):
            return False
        tmp = (epoch/epoch_total)*100 + (step/step_total)
        self.info.update_train_metrics(self.scenario_id, acc, loss, tmp)
        # stop or continue
        
        if scen['status'] == 'stop':
            self.info.training_interruption(self.scenario_id)
            return False
        self.info.training_epoch(self.scenario_id, epoch, epoch_total, step, step_total)
        return True



class TestCheckpoint():
    def __init__(self, mongo, scenario_id) -> None:
        self.mongo = mongo
        self.info = Information(self.mongo)
        self.scenario_id = scenario_id
    
    
    def test_checkpoint(self, train_acc, val_acc, val_loss):
        self.info.update_val_metrics(self.scenario_id, val_acc, val_loss, train_acc)