class DefaultDatasetParams():
    def __init__(self) -> None:
        self.init_data_augmentation_params()
        self.init_subdatasets_generic_name()
        self.init_classes()
        self.init_images()


    def init_data_augmentation_params(self):
        self.rescale = 1. / 255.
        self.horizontal_flip = True
        self.vertical_flip = False
        self.zoom_range = 0.3
        self.rotation_range = 15.
        self.batch_size = 64
    
        
    def init_subdatasets_generic_name(self):
        self.train = "train"
        self.test = "test"
        self.val = "validation"
        self.eval = "evaluation"
        
        
    def init_classes(self):
        self.num_classes = 2
        self.classes_label = ('cats', 'dogs')
        
        
    def init_images(self):
        width = 128
        height = 128
        channels = 3
        self.images_size = (width, height)
        self.images_dims = (width, height, channels)