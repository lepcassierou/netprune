import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import Box from '@material-ui/core/Box';

import { InstanceCollection } from '/imports/db/InstanceCollection';
import { ScenarioCollection } from '/imports/db/ScenarioCollection';
import { FinetuningFilterCollection } from '/imports/db/FinetuningFilterCollection';

import Cytoscape from '/imports/ui/interface/cytoscape';
import TreeView from '/imports/ui/interface/TreeView';

function memoize(fun) {
    // let cache = {}
    return function (n) {
        // let index = n.data('id')
        // if (cache[index] != undefined ) {
        //   return cache[index]
        // } else {
        //   let result = fun(n)
        //   cache[index] = result
        //   return result
        // }
        return fun(n)
    }
}

// let renderNode = memoize(function (ele) {
//     var textColor = '#000000';
//     var width = 190    // TODO: calculate based on label, add padding
//     var height = 90    // TODO: calculate based on label
//     var svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
//     // Loss icon : <path fill="${textColor}"
//     // d="m 126.83882,38.808275 -2.59914,2.800076 c -0.23713,0.25535 -0.6419,0.255724 -0.87936,0 l -2.59937,-2.800076 c -0.35515,-0.3825 -0.0844,-1.008274 0.43967,-1.008274 H 122.8 v -6.8 h -2.0994 a 0.2999,0.2999 0 0 1 -0.21213,-0.08788 l -1.4,-1.4 c -0.189,-0.18898 -0.0551,-0.512124 0.21213,-0.512124 H 124.2 c 0.33138,0 0.6,0.268624 0.6,0.6 v 8.2 h 1.59914 c 0.52196,0 0.79628,0.624224 0.43968,1.008274 z"/>
//     svg += `<path fill="${textColor}"
//       d="m 11.2,28.2 c -3.42425,0 -6.2,2.77575 -6.2,6.2 0,3.42425 2.77575,6.2 6.2,6.2 3.42425,0 6.2,-2.77575 6.2,-6.2 0,-3.42425 -2.77575,-6.2 -6.2,-6.2 z m 0,10.8 c -2.54225,0 -4.6,-2.05725 -4.6,-4.6 0,-2.54225 2.05725,-4.6 4.6,-4.6 2.54225,0 4.6,2.05725 4.6,4.6 0,2.54225 -2.05725,4.6 -4.6,4.6 z m 0,-7.8 c -1.76725,0 -3.2,1.43275 -3.2,3.2 0,1.76725 1.43275,3.2 3.2,3.2 1.76725,0 3.2,-1.43275 3.2,-3.2 0,-1.76725 -1.43275,-3.2 -3.2,-3.2 z m 0,4.8 c -0.88225,0 -1.6,-0.71775 -1.6,-1.6 0,-0.88225 0.71775,-1.6 1.6,-1.6 0.88225,0 1.6,0.71775 1.6,1.6 0,0.88225 -0.71775,1.6 -1.6,1.6 z"/>
//     <path fill="${textColor}"
//       d="m 12.2,48.9 c -3.9765,0 -7.2,3.2235 -7.2,7.2 0,1.32 0.35625,2.5565 0.9765,3.62 0.14025,0.2405 0.4075,0.38 0.686,0.38 h 11.075 c 0.2785,0 0.54575,-0.1395 0.686,-0.38 0.62025,-1.0635 0.9765,-2.3 0.9765,-3.62 0,-3.9765 -3.2235,-7.2 -7.2,-7.2 z m 0,1.6 c 0.36775,0 0.6645,0.25325 0.758,0.59125 -0.02776,0.0565 -0.066,0.10576 -0.08624,0.16676 l -0.2305,0.69175 C 12.513,52.037 12.367,52.1 12.20025,52.1 c -0.44175,0 -0.8,-0.35825 -0.8,-0.8 0,-0.44175 0.358,-0.8 0.79975,-0.8 z m -4.8,7.2 c -0.44175,0 -0.8,-0.35825 -0.8,-0.8 0,-0.44175 0.35825,-0.8 0.8,-0.8 0.44175,0 0.8,0.35825 0.8,0.8 0,0.44175 -0.35825,0.8 -0.8,0.8 z m 1.2,-4 c -0.44175,0 -0.8,-0.35825 -0.8,-0.8 0,-0.44175 0.35825,-0.8 0.8,-0.8 0.44175,0 0.8,0.35825 0.8,0.8 0,0.44175 -0.35825,0.8 -0.8,0.8 z m 6.16925,-1.81025 -1.53325,4.6 c 0.34225,0.2935 0.564,0.72375 0.564,1.21025 0,0.293 -0.0845,0.56375 -0.222,0.8 H 10.822 C 10.6845,58.26375 10.6,57.993 10.6,57.7 c 0,-0.8485 0.6625,-1.53575 1.4975,-1.58975 L 13.631,51.51 c 0.10426,-0.314 0.44325,-0.48625 0.759,-0.37925 0.31425,0.10474 0.48375,0.44475 0.37925,0.759 z m 0.3665,1.43 0.388,-1.16375 C 15.6105,52.12375 15.702,52.10025 15.8,52.10025 c 0.44175,0 0.8,0.35825 0.8,0.8 0,0.44175 -0.35825,0.8 -0.8,0.8 -0.2845,-2.5e-4 -0.52225,-0.157 -0.66425,-0.3805 z M 17,57.7 c -0.44175,0 -0.8,-0.35825 -0.8,-0.8 0,-0.44175 0.35825,-0.8 0.8,-0.8 0.44175,0 0.8,0.35825 0.8,0.8 0,0.44175 -0.35825,0.8 -0.8,0.8 z"/>
//     <path fill="${textColor}"
//       d="M 16.2,69.6 H 15.5505 C 15.961,70.307 16.2,71.12525 16.2,72 c 0,2.64675 -2.15325,4.8 -4.8,4.8 -2.64675,0 -4.8,-2.15325 -4.8,-4.8 0,-0.87475 0.239,-1.693 0.6495,-2.4 H 6.6 C 5.71775,69.6 5,70.31775 5,71.2 v 8 c 0,0.88225 0.71775,1.6 1.6,1.6 h 9.6 c 0.88225,0 1.6,-0.71775 1.6,-1.6 v -8 c 0,-0.88225 -0.71775,-1.6 -1.6,-1.6 z M 11.4,76 c 2.20925,0 4,-1.79075 4,-4 0,-2.20925 -1.79075,-4 -4,-4 -2.20925,0 -4,1.79075 -4,4 0,2.20925 1.79075,4 4,4 z m -0.0075,-3.7985 0.8395,-1.959 c 0.0875,-0.20425 0.3235,-0.298 0.52575,-0.21025 0.203,0.087 0.297,0.32225 0.21025,0.525 L 12.12625,72.521 C 12.29325,72.7 12.4,72.93625 12.4,73.2 c 0,0.55225 -0.44775,1 -1,1 -0.55225,0 -1,-0.44775 -1,-1 0,-0.5495 0.444,-0.99425 0.9925,-0.9985 z"/>`
//     svg += `<g style="font-family:sans-serif;">
//       <text x="${20}" y="${20}" fill="${textColor}">${ele.data('name')}</text>
//       <text x="${20}" y="${40}" fill="${textColor}">Acc: ${(ele.data('accuracy') * 100).toFixed(2)}%</text>`
//     // <text x="${130}" y="${40}" fill="${textColor}">Loss: ${(ele.data('loss')).toFixed(2)}</text>`
//     if (!ele.root) {
//         let approxSize = (ele.data('sizeGain') / 1048576).toFixed(1); // Unit : MB
//         svg += `<text x="${20}" y="${60}" fill="${textColor}">Model size: ${approxSize} MB</text>`
//     }

//     let approxParams = (ele.data('networkSize') / 1000000).toFixed(1);
//     svg += `<text x="${20}" y="${80}" fill="${textColor}"># Params: ${approxParams} M</text>
//     </g>`
//     svg += `</svg>`
//     return {
//         svg: 'data:image/svg+xml;base64,' + btoa(svg),
//         width,
//         height,
//         isRoot: ele.data('root'),
//         isLeaf: ele.data('leaf'),
//     }
// })

// let renderEdge = function (ele) {
//     let edgeStr = "";
//     ele.data().selection.forEach((layerName, layerIndex) => {
//         edgeStr += layerName + ":" + ele.data().oldFilters[layerIndex] + "-" + ele.data().newFilters[layerIndex] + ", ";
//     });
//     return edgeStr.substr(0, edgeStr.length - 2);
// }

class ExplorationTree extends React.Component {
    constructor(props) {
        super(props);
        this.exploTree = React.createRef()
        this.state = {
            currentInstance: '',
        }
        // this.centerView = this.centerView.bind(this)
        this.openScenario = this.openScenario.bind(this)
        // this.redrawView = this.redrawView.bind(this)
    }

    componentDidMount(){
        this.rootIndex = this.findRootScenario();
    }

    componentDidUpdate(prevProps) {
        if (this.exploTree.current && this.props.instance) {
            let nodes = []
            this.props.scenarios.forEach((scenario) => {
                let data = scenario
                data.id = data._id
                nodes.push({ data })
            });
            let edges = []
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
                        let graph = {
                            nodes,
                            edges,
                        }
                        // this.graphView.current.loadGraph(graph, 'breadthfirst')
                    }
                })
            } else {
                let graph = {
                    nodes,
                    edges,
                }
                // this.graphView.current.loadGraph(graph, 'breadthfirst');
            }

        }
    }

    openScenario(id) {
        this.props.open(id)
    }

    // centerView() {
    //     this.graphView.current.centerView(true)
    // }
    // redrawView() {
    //     this.graphView.current.drawGraph('breadthfirst', true)
    // }

    findRootScenario(){

    }

    render() {
        console.log(this.props.scenarios);
        return (
            <Box height="calc(100% - 35px)">
                {/* <Cytoscape
          ref={this.graphView}
          label={`ScenarioGraph_${this.props.instanceId}`}
          version=""
          onLeftClickNode={this.openScenario}
          renderNode={renderNode}
          renderEdge={renderEdge}
        /> */}
                <TreeView
                    ref={this.exploTree}
                    label={`ScenarioGraph_${this.props.instanceId}`}
                    version=""
                    onLeftClickNode={this.openScenario}
                    scenarios={this.props.scenarios}
                    instance={this.props.instance}
                    // renderNode={renderNode}
                    // renderEdge={renderEdge}
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
})(ExplorationTree);
