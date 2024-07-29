import tensorflow as tf


class GPUSetup():
    @staticmethod
    def gpu_setup():
        physical_devices = tf.config.experimental.list_physical_devices('GPU')
        if len(physical_devices) > 0:
            for dev in physical_devices:
                tf.config.experimental.set_memory_growth(dev, True)