from architectures.abstract_architecture import AbstractArchitecture
import tensorflow as tf

class DynNetSurgLenet5(AbstractArchitecture):
    def __init__(self, input_shape, nb_classes):
        super().__init__(input_shape, nb_classes)
        
    
    def build_architecture(self):
        l0 = tf.keras.layers.Input(self.input_shape)

        conv1 = tf.keras.layers.Conv2D(20, kernel_size = (5, 5), padding='valid')(l0)
        act1 = tf.keras.layers.Activation('relu')(conv1)
        maxpool1 = tf.keras.layers.MaxPooling2D(pool_size=(2,2), padding='same')(act1)
        conv2 = tf.keras.layers.Conv2D(50, kernel_size = (5, 5), padding='valid')(maxpool1)
        act2 = tf.keras.layers.Activation('relu')(conv2)
        maxpool2 = tf.keras.layers.MaxPooling2D(pool_size=(2,2), padding='same')(act2)
        flatt = tf.keras.layers.Flatten()(maxpool2)
        fc = tf.keras.layers.Dense(500)(flatt)
        act3 = tf.keras.layers.Activation('relu')(fc)
        softmax = tf.keras.layers.Dense(self.nb_classes, activation='softmax', name='predictions')(act3)

        return tf.keras.models.Model(inputs = l0, outputs = softmax)