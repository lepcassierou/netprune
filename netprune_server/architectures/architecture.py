from architectures.two_conv_net import TwoConvNet
from architectures.lenet5 import Lenet5
from architectures.lenet300_100 import Lenet300100
from architectures.lenet4_variant import DynNetSurgLenet5
from architectures.vgg16_2fc import VGG16BN
from architectures.cats_dogs_convnet import CatsDogsConvNet


class ArchitectureChooser():
    def __init__(self, architecture_name) -> None:
        self.architecture_name = architecture_name
        
        
    def choose_architecture(self, input_shape, nb_classes):
        model = None
        if self.architecture_name == "two-layer":
            model = TwoConvNet(input_shape, nb_classes)
        # if self.architecture_name == "cats_dogs_convnet":
        if self.architecture_name == "custom":
            model = CatsDogsConvNet(input_shape, nb_classes)
        if self.architecture_name == "lenet5": 
            model = Lenet5(input_shape, nb_classes)
        if self.architecture_name == "lenet300-100":
            model = Lenet300100(input_shape, nb_classes)
        if self.architecture_name == "lenet_4_variant":
            model = DynNetSurgLenet5(input_shape, nb_classes)
        if self.architecture_name == "vgg16":
            model = VGG16BN(input_shape, nb_classes)
        print("Built architecture", model)
        if model is not None:
            return model.build_architecture()
        return None