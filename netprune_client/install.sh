#!/bin/bash

meteor create --release 2.16 .
meteor npm install --save react react-dom react-router react-router-dom @material-ui/core @material-ui/icons prop-types cytoscape d3 @material-ui/lab
meteor add http