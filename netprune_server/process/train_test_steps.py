import tensorflow as tf


class TrainStep():
    def __init__(self):
        return

    @tf.function
    def __call__(self, x, y, model, optimizer, loss, metric):
        with tf.GradientTape() as tape:
            logits = model(x, training=True)
            loss_value = loss(y, logits)
        grads = tape.gradient(loss_value, model.trainable_weights)
        optimizer.apply_gradients(zip(grads, model.trainable_weights))
        metric.update_state(y, logits)
        return loss_value
    
    
    
class TestStep():
    def __init__(self):
        return

    @tf.function
    def __call__(self, x, y, model, metric, loss):
        val_logits = model(x, training=False)
        metric.update_state(y, val_logits)
        return loss(y, val_logits)