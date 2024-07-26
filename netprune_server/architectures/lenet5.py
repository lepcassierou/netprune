from architectures.abstract_architecture import AbstractArchitecture
import tensorflow as tf

class Lenet5(AbstractArchitecture):
    def __init__(self, input_shape):
        super().__init__(input_shape)
        
    
    def build_architecture(self):
        c0 = tf.keras.layers.Input(self.input_shape)
        c1 = tf.keras.layers.Conv2D(6, kernel_size = (3, 3), padding='same')(c0)
        c2 = tf.keras.layers.Activation('relu')(c1)
        c3 = tf.keras.layers.MaxPooling2D(pool_size=(2,2), padding='same')(c2)
        c4 = tf.keras.layers.Conv2D(16, kernel_size = (5, 5), padding='valid')(c3)
        c5 = tf.keras.layers.Activation('relu')(c4)
        c6 = tf.keras.layers.MaxPooling2D(pool_size=(2,2), padding='same')(c5)
        c7 = tf.keras.layers.Flatten()(c6)
        c8 = tf.keras.layers.Dense(120)(c7)
        c9 = tf.keras.layers.Activation('relu')(c8)
        c10 = tf.keras.layers.Dense(84)(c9)
        c11 = tf.keras.layers.Activation('relu')(c10)
        c12 = tf.keras.layers.Dense(10, activation='softmax', name='predictions')(c11)

        return tf.keras.models.Model(inputs = c0, outputs = c12)