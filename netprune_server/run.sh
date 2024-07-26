#!/bin/sh
docker start mongo_sp

export FLASK_APP=app.py
export FLASK_ENV=development
python3 -m flask run --host 0.0.0.0
