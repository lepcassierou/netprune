

# Server side

1. _[netprune_server/install.sh](netprune_server/install.sh)_: Create a python virtual environment and install dependancies. 

```
cd netprune_server
python3 -m venv netprune
source ./netpruneenv/bin/activate
pip install -r requirements.txt
sh run.sh
```

# Client side


## Installation


1. Install Meteor on the 2.5.3 version: 

```
cd netprune_client
curl https://install.meteor.com/\?release\=2.5.3 | sh
cat .meteor/release # Should be 2.5.3
```

2. _[netprune_client/install.sh](netprune_client/install.sh)_: Create a meteor project without replacing the source code and install dependancies: 

```
meteor create --release 2.5.3 .
meteor npm install --save @babel/runtime react react-dom react-router react-router-dom @material-ui/core @material-ui/icons prop-types cytoscape d3 @material-ui/lab d3-3d
```

3. _[netprune_client/run.sh](netprune_client/run.sh)_: Run the script to start meteor

```
export MONGO_URL=mongodb://localhost:27017/meteor
meteor run --settings dev_settings.json
```
