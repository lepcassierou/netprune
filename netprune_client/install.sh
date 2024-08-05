#!/bin/bash

# meteor create --release 2.5.3 .
meteor create .
meteor npm install --save react react-dom react-router react-router-dom @material-ui/core @material-ui/icons prop-types cytoscape d3 @material-ui/lab d3-3d
meteor add accounts-base
meteor add http
# meteor remove autopublish