#!/bin/bash

export MONGO_URL=mongodb://localhost:27017/meteor
meteor run --settings dev_settings.json
