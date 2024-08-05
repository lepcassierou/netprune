import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import Box from '@material-ui/core/Box';

import { InstanceCollection } from '/imports/db/InstanceCollection';
import { ScenarioCollection } from '/imports/db/ScenarioCollection';
import { FinetuningFilterCollection } from '/imports/db/FinetuningFilterCollection';

import Cytoscape from '/imports/ui/interface/cytoscape';

function memoize(fun) {
  let cache = {}
  return function (n) {
    let index = n.data('id')
    if (cache[index] != undefined) {
      return cache[index]
    } else {
      let result = fun(n)
      cache[index] = result
      return result
    }
    // return fun(n)
  }
}

function memoize2(fun) {
  let cache = {}
  return function (n) {
    let index = n.data('id')
    if (cache[index] != undefined) {
      return cache[index]
    } else {
      let result = fun(n)
      cache[index] = result
      return result
    }
    // return fun(n)
  }
}

let renderNode = memoize(function (ele) {
  var textColor = '#000000';
  var width = 190    // TODO: calculate based on label, add padding
  var height = 90    // TODO: calculate based on label
  var svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
  // Loss icon : <path fill="${textColor}"
  // d="m 126.83882,38.808275 -2.59914,2.800076 c -0.23713,0.25535 -0.6419,0.255724 -0.87936,0 l -2.59937,-2.800076 c -0.35515,-0.3825 -0.0844,-1.008274 0.43967,-1.008274 H 122.8 v -6.8 h -2.0994 a 0.2999,0.2999 0 0 1 -0.21213,-0.08788 l -1.4,-1.4 c -0.189,-0.18898 -0.0551,-0.512124 0.21213,-0.512124 H 124.2 c 0.33138,0 0.6,0.268624 0.6,0.6 v 8.2 h 1.59914 c 0.52196,0 0.79628,0.624224 0.43968,1.008274 z"/>
  svg += `<path fill="${textColor}"
      d="m 11.2,28.2 c -3.42425,0 -6.2,2.77575 -6.2,6.2 0,3.42425 2.77575,6.2 6.2,6.2 3.42425,0 6.2,-2.77575 6.2,-6.2 0,-3.42425 -2.77575,-6.2 -6.2,-6.2 z m 0,10.8 c -2.54225,0 -4.6,-2.05725 -4.6,-4.6 0,-2.54225 2.05725,-4.6 4.6,-4.6 2.54225,0 4.6,2.05725 4.6,4.6 0,2.54225 -2.05725,4.6 -4.6,4.6 z m 0,-7.8 c -1.76725,0 -3.2,1.43275 -3.2,3.2 0,1.76725 1.43275,3.2 3.2,3.2 1.76725,0 3.2,-1.43275 3.2,-3.2 0,-1.76725 -1.43275,-3.2 -3.2,-3.2 z m 0,4.8 c -0.88225,0 -1.6,-0.71775 -1.6,-1.6 0,-0.88225 0.71775,-1.6 1.6,-1.6 0.88225,0 1.6,0.71775 1.6,1.6 0,0.88225 -0.71775,1.6 -1.6,1.6 z"/>
    <path fill="${textColor}"
      d="m 11.2,48.2 c -3.42425,0 -6.2,2.77575 -6.2,6.2 0,3.42425 2.77575,6.2 6.2,6.2 3.42425,0 6.2,-2.77575 6.2,-6.2 0,-3.42425 -2.77575,-6.2 -6.2,-6.2 z m 0,10.8 c -2.54225,0 -4.6,-2.05725 -4.6,-4.6 0,-2.54225 2.05725,-4.6 4.6,-4.6 2.54225,0 4.6,2.05725 4.6,4.6 0,2.54225 -2.05725,4.6 -4.6,4.6 z m 0,-7.8 c -1.76725,0 -3.2,1.43275 -3.2,3.2 0,1.76725 1.43275,3.2 3.2,3.2 1.76725,0 3.2,-1.43275 3.2,-3.2 0,-1.76725 -1.43275,-3.2 -3.2,-3.2 z m 0,4.8 c -0.88225,0 -1.6,-0.71775 -1.6,-1.6 0,-0.88225 0.71775,-1.6 1.6,-1.6 0.88225,0 1.6,0.71775 1.6,1.6 0,0.88225 -0.71775,1.6 -1.6,1.6 z"/>
      <path fill="${textColor}"
      d="m 11.2,68.2 c -3.42425,0 -6.2,2.77575 -6.2,6.2 0,3.42425 2.77575,6.2 6.2,6.2 3.42425,0 6.2,-2.77575 6.2,-6.2 0,-3.42425 -2.77575,-6.2 -6.2,-6.2 z m 0,10.8 c -2.54225,0 -4.6,-2.05725 -4.6,-4.6 0,-2.54225 2.05725,-4.6 4.6,-4.6 2.54225,0 4.6,2.05725 4.6,4.6 0,2.54225 -2.05725,4.6 -4.6,4.6 z m 0,-7.8 c -1.76725,0 -3.2,1.43275 -3.2,3.2 0,1.76725 1.43275,3.2 3.2,3.2 1.76725,0 3.2,-1.43275 3.2,-3.2 0,-1.76725 -1.43275,-3.2 -3.2,-3.2 z m 0,4.8 c -0.88225,0 -1.6,-0.71775 -1.6,-1.6 0,-0.88225 0.71775,-1.6 1.6,-1.6 0.88225,0 1.6,0.71775 1.6,1.6 0,0.88225 -0.71775,1.6 -1.6,1.6 z"/>`
  svg += `<g style="font-family:sans-serif;">
      <text x="${20}" y="${20}" fill="${textColor}">${ele.data('name')}</text>
      <text x="${20}" y="${40}" fill="${textColor}">Acc: ${(ele.data('accuracy') * 100).toFixed(2)}%</text>`
  // <text x="${130}" y="${40}" fill="${textColor}">Loss: ${(ele.data('loss')).toFixed(2)}</text>`
  if (!ele.root) {
    let size = ele.data('sizeGain');
    if (size < 1024) {
      svg += `<text x="${20}" y="${60}" fill="${textColor}">Size: ${size} B</text>`;
    } else if (size < 1048576) {
      let approxSize = (size / 1024).toFixed(1);
      svg += `<text x="${20}" y="${60}" fill="${textColor}">Size: ${approxSize} KiB</text>`;
    } else if (size < 1073741824) {
      let approxSize = (size / 1048576).toFixed(1);
      svg += `<text x="${20}" y="${60}" fill="${textColor}">Size: ${approxSize} MiB</text>`;
    } else if (size < 1.0995e12) {
      let approxSize = (size / 1073741824).toFixed(1);
      svg += `<text x="${20}" y="${60}" fill="${textColor}">Size: ${approxSize} GiB</text>`;
    }
  }

  let netSize = ele.data('networkSize');
  if (netSize < 1000) {
    ;
    svg += `<text x="${20}" y="${80}" fill="${textColor}"># Params: ${netSize}</text>
      </g>`
  } else if (netSize < 1000000) {
    let approxParams = (netSize / 1000).toFixed(1);
    svg += `<text x="${20}" y="${80}" fill="${textColor}"># Params: ${approxParams} k</text>
      </g>`
  } else if (netSize < 1000000000) {
    let approxParams = (netSize / 1000000).toFixed(1);
    svg += `<text x="${20}" y="${80}" fill="${textColor}"># Params: ${approxParams} M</text>
      </g>`
  } else if (netSize < 1000000000000) {
    let approxParams = (netSize / 1000000000).toFixed(1);
    svg += `<text x="${20}" y="${80}" fill="${textColor}"># Params: ${approxParams} G</text>
      </g>`
  }

  svg += `</svg>`
  return {
    svg: 'data:image/svg+xml;base64,' + btoa(svg),
    width,
    height,
    isRoot: ele.data('root'),
    isLeaf: ele.data('leaf'),
  }
})

let renderEdge = memoize2(function (ele) {
  // let edgeStr = "";
  // ele.data().selection.forEach((layerName, layerIndex) => {
  //   edgeStr += layerName + ":" + ele.data().oldFilters[layerIndex] + "-" + ele.data().newFilters[layerIndex] + ", ";
  // });
  // return edgeStr.substr(0, edgeStr.length-2);
  return ""
})

class ScenarioGraph extends React.Component {
  constructor(props) {
    super(props);
    this.graphView = React.createRef()
    this.state = {
      currentInstance: '',
    }
    this.centerView = this.centerView.bind(this)
    this.openScenario = this.openScenario.bind(this)
    this.redrawView = this.redrawView.bind(this)
  }
  componentDidUpdate(prevProps) {
    if (this.graphView.current && this.props.instance) {
      let nodes = []
      this.props.scenarios.forEach((scenario) => {
        let data = scenario
        data.id = data._id
        nodes.push({ data })
      });
      let edges = []
      let graph = undefined;
      if (this.props.instance.scenarioEdges.length > 0) {
        this.props.instance.scenarioEdges.forEach((edge) => {
          if (this.props.scenarios.findIndex((v) => v._id === edge.source) > -1
            && this.props.scenarios.findIndex((v) => v._id === edge.target) > -1) {
            // Meteor.call('finetuning_filters.findSelectionByIds',
            //   this.props.instanceId,
            //   edge.source,
            //   edge.target,
            //   (error, response) => {
            //     if (error) {
            //       throw new Meteor.Error('ERROR printing fine-tuning filters is impossible.');
            //     } else {
            //       let data = edge
            //       if(response != null){
            //         data.selection = response.selection; 
            //         data.oldFilters = response.oldFiltersNb;
            //         data.newFilters = response.newFiltersNb;
            //         edges.push({ data })
            //       } else {
            //         console.log("One PROBLEM");
            //         data.selection = []; 
            //         data.oldFilters = 0;
            //         data.newFilters = 0;
            //       }
            //       edges.push({ data })
            //       let graph = {
            //         nodes,
            //         edges,
            //       }
            //       this.graphView.current.loadGraph(graph, 'breadthfirst')
            //     }
            // });
            let data = edge;
            edges.push({ data })
            graph = {
              nodes,
              edges,
            }
            // this.graphView.current.loadGraph(graph, 'breadthfirst')
          }
        })
        this.graphView.current.loadGraph(graph, 'breadthfirst') // TO remove
      } else {
        let graph = {
          nodes,
          edges,
        }
        this.graphView.current.loadGraph(graph, 'breadthfirst');
      }

    }
  }
  openScenario(id) {
    this.props.open(id)
  }
  centerView() {
    this.graphView.current.centerView(true)
  }
  redrawView() {
    this.graphView.current.drawGraph('breadthfirst', true)
  }
  render() {
    return (
      <Box height="calc(100% - 35px)">
        <Cytoscape
          ref={this.graphView}
          label={`ScenarioGraph_${this.props.instanceId}`}
          version=""
          onLeftClickNode={this.openScenario}
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
  Meteor.subscribe('instanceById', params.instanceId);
  Meteor.subscribe('scenariosByInstanceId', params.instanceId);

  return {
    instance: InstanceCollection.findOne(params.instanceId),
    scenarios: ScenarioCollection.find({ instanceId: params.instanceId }).fetch(),
    ffs: FinetuningFilterCollection.find({ instanceId: params.instanceId }).fetch()
  }
})(ScenarioGraph);
