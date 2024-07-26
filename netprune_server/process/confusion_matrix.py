import numpy as np


class ConfusionMatrix():
    def __init__(self, nb_classes) -> None:
        self.nb_classes = nb_classes
        
        
    def __format_labels__(self, activations):
        true_labels = activations.get_labels()
        if not isinstance(true_labels, int):
            return np.asarray(np.argmax(true_labels, axis=1), dtype=int)
        else:
            return np.asarray(true_labels, dtype=int)
        
        
    def __format_predictions__(self, activations):
        predictions_vect = activations.predict()
        return predictions_vect, np.argmax(predictions_vect, axis=1)
        
        
    def __confusion_matrix_images__(self, nb_samples, labels, categ_preds, score_preds):
        indices_images = [] # indices_images[nb_classes][nb_classes][samples_subset]
        for label in range(self.nb_classes):
            pred_imgs = []
            for pred in range(self.nb_classes):
                pred_imgs.append([])
            indices_images.append(pred_imgs)
        
        for sample in range(nb_samples):
            indices_images[labels[sample]][categ_preds[sample]].append(sample)

        sort_by_proba = lambda elem : np.max(score_preds[elem])
        for label in range(self.nb_classes):
            for pred in range(self.nb_classes):
                indices_images[label][pred].sort(key=sort_by_proba, reverse=True)
        return indices_images
    
    
    def __confusion_matrix_numbers__(self, nb_samples, labels, categ_preds):
        conf_matrix = np.zeros((self.nb_classes, self.nb_classes), dtype=np.int32)
        for i in range(nb_samples):
            conf_matrix[labels[i]][categ_preds[i]] += 1
    
    
    def compute_confusion_matrices(self, activations):
        labels = self.__format_labels__(activations)
        score_preds, categ_preds = self.__format_predictions__(activations)
        nb_samples = len(labels)
        
        indices_images = self.__confusion_matrix_images__(nb_samples, labels, categ_preds, score_preds)

        conf_matrix = self.__confusion_matrix_numbers__(nb_samples, labels, categ_preds).tolist()
        return conf_matrix, indices_images