#!/bin/bash

python3 -m venv netpruneenv # python 3.6
source ./netpruneenv/bin/activate
python3 -m pip install --upgrade pip # Tested with pip-21.3.1
pip install -r requirements.txt
