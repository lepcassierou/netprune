from architectures.abstract_architecture import AbstractArchitecture
import tensorflow as tf

class VGG16BN(AbstractArchitecture):
    def __init__(self, input_shape):
        super().__init__(input_shape)
        
        
    def __conv_bn_relu__(self, inputs, filters, kernel_size=3, strides=1, padding='SAME', weight_decay=0.0001, rate=0.4, drop=True):
        k_initializer = tf.keras.initializers.he_normal()
        conv = tf.keras.layers.Conv2D(filters=filters, kernel_size=kernel_size, strides=strides, padding=padding, kernel_initializer=k_initializer, kernel_regularizer=tf.keras.regularizers.l2(weight_decay))(inputs)
        batch_norm = tf.keras.layers.BatchNormalization(epsilon=1e-3)(conv)
        activation = tf.keras.layers.Activation(activation="relu")(batch_norm)
        if drop:
            return tf.keras.layers.Dropout(rate=rate)(activation)
        else:
            return batch_norm
        
    
    def build_architecture(self):
        # https://www.kaggle.com/jahongir7174/vgg16-cifar10
        l0 = tf.keras.layers.Input(self.input_shape)

        conv1 = self.__conv_bn_relu__(l0, filters=64, kernel_size=[3, 3], rate=0.3)
        conv2 = self.__conv_bn_relu__(conv1, filters=64, kernel_size=[3, 3], drop=False)
        max_pooling1 = tf.keras.layers.MaxPooling2D(pool_size=(2, 2))(conv2)
        
        conv3 = self.__conv_bn_relu__(max_pooling1, filters=128, kernel_size=[3, 3])
        conv4 = self.__conv_bn_relu__(conv3, filters=128, kernel_size=[3, 3], drop=False)
        max_pooling2 = tf.keras.layers.MaxPooling2D(pool_size=(2, 2))(conv4)
        
        conv5 = self.__conv_bn_relu__(max_pooling2, filters=256, kernel_size=[3, 3])
        conv6 = self.__conv_bn_relu__(conv5, filters=256, kernel_size=[3, 3])
        conv7 = self.__conv_bn_relu__(conv6, filters=256, kernel_size=[3, 3], drop=False)
        max_pooling3 = tf.keras.layers.MaxPooling2D(pool_size=(2, 2))(conv7)
        
        conv11 = self.__conv_bn_relu__(max_pooling3, filters=512, kernel_size=[3, 3])
        conv12 = self.__conv_bn_relu__(conv11, filters=512, kernel_size=[3, 3])
        conv13 = self.__conv_bn_relu__(conv12, filters=512, kernel_size=[3, 3], drop=False)
        max_pooling5 = tf.keras.layers.MaxPooling2D(pool_size=(2, 2))(conv13)
        
        conv14 = self.__conv_bn_relu__(max_pooling5, filters=512, kernel_size=[3, 3])
        conv15 = self.__conv_bn_relu__(conv14, filters=512, kernel_size=[3, 3])
        conv16 = self.__conv_bn_relu__(conv15, filters=512, kernel_size=[3, 3], drop=False)
        max_pooling6 = tf.keras.layers.MaxPooling2D(pool_size=(2, 2))(conv16)
        
        flat = tf.keras.layers.Flatten()(max_pooling6)
        drop_out = tf.keras.layers.Dropout(rate=0.5)(flat)

        dense1 = tf.keras.layers.Dense(units=512, kernel_regularizer=tf.keras.regularizers.l2(0.0005))(drop_out)
        batch_norm = tf.keras.layers.BatchNormalization()(dense1)
        activation = tf.keras.layers.Activation('relu')(batch_norm)

        drop_out2 = tf.keras.layers.Dropout(rate=0.5)(activation)
        dense2 = tf.keras.layers.Dense(units=10)(drop_out2)
        softmax = tf.keras.layers.Activation('softmax')(dense2)

        return tf.keras.models.Model(inputs = l0, outputs = softmax)