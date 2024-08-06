#!/bin/bash

cd netprune_server
python3 -m venv netpruneenv
source ./netpruneenv/bin/activate
python3 -m pip install --upgrade pip # Tested with pip-21.3.1
pip install -r requirements.txt