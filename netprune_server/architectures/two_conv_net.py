from architectures.abstract_architecture import AbstractArchitecture
import tensorflow as tf

class TwoConvNet(AbstractArchitecture):
    def __init__(self, input_shape):
        super().__init__(input_shape)
        
        
    def __conv_bn_relu__(self, inputs, filters, kernel_size=3, strides=1, padding='SAME', rate=0.4, drop=True):
        conv = tf.keras.layers.Conv2D(filters=filters, kernel_size=kernel_size, strides=strides, padding=padding)(inputs)
        batch_norm = tf.keras.layers.BatchNormalization()(conv)
        activation = tf.keras.layers.Activation(activation="relu")(batch_norm)
        if drop:
            return tf.keras.layers.Dropout(rate=rate)(activation)
        else:
            return activation
        
    
    def build_architecture(self):
        l0 = tf.keras.layers.Input(self.input_shape)

        conv1 = self.__conv_bn_relu__(l0, filters=32, kernel_size=[3, 3], drop=False)
        max_pooling1 = tf.keras.layers.MaxPooling2D(pool_size=(2, 2))(conv1)
        conv2 = self.__conv_bn_relu__(max_pooling1, filters=64, kernel_size=[3, 3], drop=False)
        max_pooling2 = tf.keras.layers.MaxPooling2D(pool_size=(2, 2))(conv2)
        
        flat = tf.keras.layers.Flatten()(max_pooling2)
        dense = tf.keras.layers.Dense(units=10)(flat)
        softmax = tf.keras.layers.Activation('softmax')(dense)

        return tf.keras.models.Model(inputs = l0, outputs = softmax)