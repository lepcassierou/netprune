from architectures.abstract_architecture import AbstractArchitecture
import tensorflow as tf

class CatsDogsConvNet(AbstractArchitecture):
    def __init__(self, input_shape, nb_classes):
        super().__init__(input_shape, nb_classes)
        
    
    def build_architecture(self):
        l0 = tf.keras.layers.Input(self.input_shape, name='image_input')

        conv1 = tf.keras.layers.Conv2D(64, kernel_size=(3, 3), padding='same')(l0)  # valid
        bn1 = tf.keras.layers.BatchNormalization()(conv1)
        act1 = tf.keras.layers.Activation('relu')(bn1)
        maxpool1 = tf.keras.layers.MaxPooling2D(pool_size=(2, 2), padding='same')(act1)

        conv2 = tf.keras.layers.Conv2D(128, kernel_size=(3, 3), padding='same')(maxpool1)  # valid
        bn2 = tf.keras.layers.BatchNormalization()(conv2)
        act2 = tf.keras.layers.Activation('relu')(bn2)
        maxpool2 = tf.keras.layers.MaxPooling2D(pool_size=(2, 2), padding='same')(act2)

        conv3 = tf.keras.layers.Conv2D(256, kernel_size=(3, 3), padding='same')(maxpool2)  # valid
        bn3 = tf.keras.layers.BatchNormalization()(conv3)
        act3 = tf.keras.layers.Activation('relu')(bn3)

        conv4 = tf.keras.layers.Conv2D(256, kernel_size=(3, 3), padding='same')(act3)  # valid
        bn4 = tf.keras.layers.BatchNormalization()(conv4)
        act4 = tf.keras.layers.Activation('relu')(bn4)
        maxpool4 = tf.keras.layers.MaxPooling2D(pool_size=(2, 2), padding='same')(act4)

        conv5 = tf.keras.layers.Conv2D(512, kernel_size=(3, 3), padding='same')(maxpool4)  # valid
        bn5 = tf.keras.layers.BatchNormalization()(conv5)
        act5 = tf.keras.layers.Activation('relu')(bn5)

        conv6 = tf.keras.layers.Conv2D(512, kernel_size=(3, 3), padding='same')(act5)  # valid
        bn6 = tf.keras.layers.BatchNormalization()(conv6)
        act6 = tf.keras.layers.Activation('relu')(bn6)
        maxpool6 = tf.keras.layers.MaxPooling2D(pool_size=(2, 2), padding='same')(act6)

        conv7 = tf.keras.layers.Conv2D(512, kernel_size=(3, 3), padding='same')(maxpool6)  # valid
        bn7 = tf.keras.layers.BatchNormalization()(conv7)
        act7 = tf.keras.layers.Activation('relu')(bn7)
        pool7 = tf.keras.layers.MaxPooling2D(pool_size=(2, 2), padding='same')(act7)

        flatt = tf.keras.layers.Flatten()(pool7)
        softmax = tf.keras.layers.Dense(self.nb_classes, activation='softmax', name='predictions')(flatt)

        return tf.keras.models.Model(inputs=l0, outputs=softmax)