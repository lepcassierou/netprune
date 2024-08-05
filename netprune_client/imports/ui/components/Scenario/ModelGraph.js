import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import Box from '@material-ui/core/Box';

import { LayerCollection } from '/imports/db/LayerCollection';
import { ScenarioCollection } from '/imports/db/ScenarioCollection';

import Cytoscape from '/imports/ui/interface/cytoscape';

function memoize(fun){
  let cache = {}
  return function (n){
      let index = n.data('id')
      if (cache[index] != undefined ) {
        return cache[index]
      } else {
        let result = fun(n)
        cache[index] = result
        return result
      }
  }
}

let renderNode = memoize(function(ele) {
  var textColor = '#000000'
  var width = 180    // TODO: calculate based on label, add padding
  var height = 70    // TODO: calculate based on label
  var roundedParams = "";
  if(ele.data('params') < 1000000){
    if(ele.data('params') < 1000){
      roundedParams = ele.data('params');
    } else {
      roundedParams = (ele.data('params') / 1000).toFixed(1) + "k";
    }
  } else {
    roundedParams = (ele.data('params') / 1000000).toFixed(1) + "M";
  }
  // console.log(ele.data('output_shape'));
  ((ele.data('params') < 1000000) ?
  (ele.data('params') / 1000).toFixed(1) + "k" :
  (ele.data('params') / 1000000).toFixed(1) + "M")
  var svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
  svg += `<g style="font-family:sans-serif;">
      <text x="${15}" y="${20}" fill="${textColor}">${ele.data('name')}</text>
      <text x="${15}" y="${40}" fill="${textColor}">Filters: ${ele.data('filters') || ele.data('units') || '0'} (${roundedParams})</text>
      <text x="${15}" y="${60}" fill="${textColor}">Output: ${ele.data('output_shape').join().substring(1)}</text>
    </g>`
  svg += `</svg>`;
  var weight = ele.data('params');
  return {
    svg: 'data:image/svg+xml;base64,' + btoa(svg), 
    width, 
    height,
    weight,
    type: ele.data('type'),
  }
})

let renderEdge = function(ele){
  return "";
}

class ModelGraph extends React.Component {
  constructor (props) {
    super(props);
    this.graphView = React.createRef()
    this.state = {
    }
    this.centerView = this.centerView.bind(this)
    this.openLayer = this.openLayer.bind(this)
    this.redrawView = this.redrawView.bind(this)
  }
  componentDidUpdate(prevProps) {
    if (this.graphView.current && this.props.scenario && this.props.layers) {
      let nodes = []
      this.props.layers.forEach((node) => {
        let data = node
        data.id = node._id
        nodes.push({ data })
      });
      let edges = []
      this.props.scenario.layerEdges.forEach((edge) => {
        if (this.props.layers.findIndex((v) => v._id === edge.source) > -1 
          && this.props.layers.findIndex((v) => v._id === edge.target) > -1) {
          edges.push({ data: edge })
        }
      })
      let graph = {
        nodes,
        edges,
      }
      this.graphView.current.loadGraph(graph, 'breadthfirst', false)
    }
  }
  openLayer(id) {
    this.props.open(id)
  }
  centerView() {
    this.graphView.current.centerView(true)
  }
  redrawView() {
    this.graphView.current.drawGraph('breadthfirst', false, true)
  }
  render() {
    return (
      <Box height="calc(100% - 35px)">
        <Cytoscape
          ref={this.graphView}
          label={`ModelGraph_${this.props.scenarioId}`}
          version=""
          onLeftClickNode={this.openLayer}
          renderNode={renderNode}
          renderEdge={renderEdge}
        />
      </Box>
    );
  }
}
/*
Accuracy (%) <i class="fas fa-bullseye"></i>
Loss (%) <i class="fas fa-level-down-alt"></i>
Size gain (%) <i class="fas fa-tachometer-alt"></i>
Network size (N) <i class="fas fa-weight"></i>

*/

export default withTracker((params) => {
  Meteor.subscribe('scenarioById', params.scenarioId);
  Meteor.subscribe('layersByScenarioId', params.scenarioId);

  let scenario = ScenarioCollection.findOne(params.scenarioId);
  let allLayers = LayerCollection.find({ scenarioId: params.scenarioId }).fetch();

  let layers = [];
  allLayers.forEach(layer => {
    if(scenario.layerNodes.includes(layer._id)){
      layers.push(layer);
    }
  })

  return {
    scenario,
    layers,
  }
})(ModelGraph);
