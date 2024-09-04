# NetPrune

Implementation of NetPrune, a visual analytics tool to explore the architecture and the sub architectures of deep neural networks; 
to analyze the behavior of the filters (and neurons) relatively to four metrics. 
For now, NetPrune targets classification tasks with images. 

Overview of NetPrune: 

![image](./Overview_of_NetPrune.png "NetPrune overview")


# Requirements

This prototype uses docker alongside docker-compose. 
It has been tested with the version 24.0.2 of docker. 


# Installation

0. In a first terminal, at the root of the repository, run:
```
docker-compose up
``` 
This will start both the server and the client in separate containers. 


# Usage

After the whole installation is done, a message should indicate that NetPrune is running in a browser at:

```
client_1    | => App running at: http://localhost:3000/
```

In your browser, you should then find an empty list of instances, with a button to create a new one. This button will enable you to train a neural network, given one of the possible architectures (you can implement your own with your own dataset of images). 
You can setup a set of hyper-parameters (the most specific ones can be controlled directly in the code: ``./netprune_server/params/``)

![image](./NetPrune_create_instance.png "NetPrune welcome")

![image](./NetPrune_parameters.png "NetPrune parameters")

# Notes

To visualize the images of the chosen dataset when clicking on the confusion matrix cells in the Performance view, you may need to extract the test subset of images and copy it to the following location: 

```
./netprune_client/public/datasets/<dataset_name>/
```

> ⚠️ **_NB:_** This implementation is a proof of concept. It may contain bugs and some visual problems, depending on your screen resolution. 

> ⚠️ **_NB:_** Because of docker, this implementation does not support training models on a GPU yet. Still, you may be able to train them on a GPU with a manual installation of the dependencies indicated in the server-side requirements and on the [install.sh] and [run.sh] scripts that are left in both the server-side and the client-side. 
Such an installation is left to your discretion. 


## Reference

This work has been published at [Visual Informatics in 2023](https://www.sciencedirect.com/science/article/pii/S2468502X23000141). Please cite this work if you use it:

```
@article{pomme2023netprune,
  title={NetPrune: a sparklines visualization for network pruning},
  author={Pomm{\'e}, Luc-Etienne and Bourqui, Romain and Giot, Romain and Vallet, Jason and Auber, David},
  journal={Visual Informatics},
  volume={7},
  number={2},
  pages={85--99},
  year={2023},
  publisher={Elsevier}
}
```
