# Server side

0. In a first terminal: 

1. Create a python virtual environment and install dependancies [_[netprune_server/install.sh](netprune_server/install.sh)_]: 

```
cd netprune_server
python3 -m venv netpruneenv
source ./netpruneenv/bin/activate
python3 -m pip install --upgrade pip # Tested with pip-21.3.1
pip install -r requirements.txt
sh run.sh
```

# Client side

0. In a second terminal:  

## Installation


1. Install Meteor: 

```
cd netprune_client
curl https://install.meteor.com/\?release\=2.16 | sh
```

2. Create a meteor project without replacing the source code and install dependancies [_[netprune_client/install.sh](netprune_client/install.sh)_]: 

```
meteor create --release 2.16 .
meteor npm install --save react react-dom react-router react-router-dom @material-ui/core @material-ui/icons prop-types cytoscape d3 @material-ui/lab
meteor add http
```

3. Run the script to start meteor [_[netprune_client/run.sh](netprune_client/run.sh)_]: 

```
export MONGO_URL=mongodb://localhost:27017/meteor
meteor run --settings dev_settings.json
```
