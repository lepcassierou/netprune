from architectures.abstract_architecture import AbstractArchitecture
import tensorflow as tf

class Lenet300100(AbstractArchitecture):
    def __init__(self, input_shape, nb_classes):
        super().__init__(input_shape, nb_classes)
        
    
    def build_architecture(self):
        l0 = tf.keras.layers.Input(self.input_shape)

        flatt = tf.keras.layers.Flatten()(l0)
        fc = tf.keras.layers.Dense(300)(flatt)
        act1 = tf.keras.layers.Activation('relu')(fc)
        fc2 = tf.keras.layers.Dense(100)(act1)
        act2 = tf.keras.layers.Activation('relu')(fc2)
        softmax = tf.keras.layers.Dense(self.nb_classes, activation='softmax', name='predictions')(act2)

        return tf.keras.models.Model(inputs = l0, outputs = softmax)