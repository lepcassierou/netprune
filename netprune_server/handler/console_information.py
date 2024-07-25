from process.colors import bcolors

class ConsoleInformation():
    def __init__(self) -> None:
        pass
    
    
    def print_line(self):
        print("\n")
        
        
    def epochs_info(self, epoch, nb_epochs):
        print(f"Epoch {epoch} / {nb_epochs}")
        
        
    def advancement(self, nb_char, num_batch, nb_batch):
        nb_equals = int((nb_char-1)*(num_batch+1) // nb_batch)
        adv = "["
        for _ in range(nb_equals):
            adv += '='
        adv += '>'
        for _ in range(nb_char - nb_equals - 1):
            adv += '.'
        adv += ']'
        return adv
        
        
    def print_advancement(self, nb_char, num_batch, nb_batch):
        print(self.advancement(nb_char, num_batch, nb_batch), end='\r')
        
        
    def train_acc_str(self, train_metric):
        return f" Train_acc: {round(float(train_metric), 4)} | "
    
    
    def val_acc_loss_str(self, val_metric, val_loss, delta_time):
        return f"Val_acc: {round(float(val_metric), 4)} | Val_loss: {round(float(val_loss), 4)} | Time: {round(float(delta_time), 4)}\n"
    
    
    def print_str_epoch(self, str_epoch, epoch_is_better):
        if epoch_is_better:
            print(f"{bcolors.OKGREEN}{str_epoch}{bcolors.ENDC}")
        else:
            print(f"{bcolors.FAIL}{str_epoch}{bcolors.ENDC}")
            
            
    def train_fct_incorrect(self):
        print("train_checkpoint is not a function")
            
            
    def test_fct_incorrect(self):
        print("test_checkpoint is not a function")
            
            
    def file_path_incorrect(self):
        print("checkpoint_file_path is None")