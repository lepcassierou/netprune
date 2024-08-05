import React from 'react';
import PropTypes from 'prop-types';

// import cytoscape from 'cytoscape';
import d3 from 'd3';

export default class TreeView extends React.Component {
    constructor(props) {
        super(props);

        if (this.props.style) {
            this.style = this.props.style
        } else {
            this.style = {
                height: '100%',
                outline: 'none',
            }
        }

        this.state = {
            graph: this.props.graph,
            version: this.props.version,
        }

        this.drawTree = this.drawTree.bind(this);
        // this.onLeftClickNode = this.onLeftClickNode.bind(this);
        // this.centerView = this.centerView.bind(this);
        // this.loadGraph = this.loadGraph.bind(this);
        // this.saveGraph = this.saveGraph.bind(this);
        // this.drawGraph = this.drawGraph.bind(this);
        // this.updateElement = this.updateElement.bind(this);
    }
    //   componentDidMount() {
    //     this.cy = cytoscape({
    //       container: document.getElementById(this.props.label),
    //       elements: {
    //         nodes: [],
    //         edges: []
    //       },
    //       style: [
    //         {
    //           selector: 'node',
    //           style: {
    //             'shape': 'round-rectangle',
    //             'opacity': '1',
    //             'background-color': function(ele){
    //               let element = this.props.renderNode(ele);
    //               if(element.isRoot){
    //                 if(element.isLeaf){
    //                   return 'linear-gradient(to right, #3399FF 0%, #3399FF 50%, #F44336 50%, #F44336 100%)';
    //                 } else {
    //                   return "#3399FF";
    //                 }
    //               } else if(element.isLeaf){
    //                 return "#F44336";
    //               } else if(element.type == "InputLayer"){
    //                 return "#FFFFFF"; 
    //               } else if(element.type == "Conv2D"){
    //                 return "#DAE8FC"; // Blue
    //               } else if(element.type == "Flatten"){
    //                 // return "#F5F5F5"; // Gray
    //                 return "#FFF2CC"; // Yellow
    //                 // return "#D5E8D4"; // Green
    //               } else if(element.type == "MaxPooling2D"){
    //                 return "#FFE6CC"; // Orange
    //                 // return "#FFFFFF"; 
    //               } else if(element.type == "Activation"){
    //                 // return "#E1D5E7"; // Violet
    //               } else if(element.type == "Dense"){
    //                 return "#F8CECC"; // Red
    //               } else {
    //                 return "#FFFFFF"; // Black
    //               }
    //             }.bind(this),
    //             'background-opacity': .9,
    //             'background-image': function(ele) { return this.props.renderNode(ele).svg; }.bind(this),
    //             'width':  function(ele){ return this.props.renderNode(ele).width; }.bind(this),
    //             'height': function(ele){ return this.props.renderNode(ele).height; }.bind(this),
    //             'background-height': '100%',
    //             'background-width': '100%',
    //             'background-image-opacity': 1,
    //             'border-width': 2,
    //             'border-style': 'solid',
    //             'border-color': '#000000',
    //             'color': '#000000',
    //           }
    //         },
    //         {
    //           selector: 'edge',
    //           classes: 'multiline-manual',
    //           style: {
    //             'mid-target-arrow-fill': 'filled',
    //             'mid-target-arrow-shape': 'vee',
    //             'arrow-scale': 3,
    //             'text-max-width': '1000px',
    //             'text-wrap': 'none',
    //             // 'label': function(ele) { return this.props.renderEdge(ele); }.bind(this),
    //           }
    //         },
    //         {
    //           selector: 'node:selected',
    //           style: {
    //             'border-width': 4,
    //             'border-style': 'solid',
    //             'border-color': '#0000ff',
    //             'color': '#0000ff',
    //           }
    //         },
    //         {
    //           selector: 'edge:selected',
    //           style: {
    //             'line-color': '#0000ff',
    //             'target-arrow-color': '#0000ff',
    //           }
    //         },
    //       ],
    //       layout: {
    //         name: 'cose',
    //         componentSpacing: 80,
    //         idealEdgeLength: () => 64,
    //         nodeRepulsion: () => 4096,
    //       },
    //       wheelSensitivity: 0.2,
    //       maxZoom: 5,
    //     });

    //     // mouse interactions
    //     this.cy.on('tap', 'node', (event) => {
    //       this.onLeftClickNode(event);
    //     });
    //   }
    //   onLeftClickNode(event) {
    //     let node = event.target;
    //     this.props.onLeftClickNode(node.data())
    //   }
    //   centerView(animate=false) {
    //     if (animate) {
    //       this.cy.animate({
    //         fit: {
    //           eles: [], 
    //           padding: 30
    //         }
    //       }, {
    //         duration: 300,
    //       });
    //     } else {
    //       this.cy.fit([], 30);
    //     }
    //   }
    //   loadGraph(graph, layout='', vertical) {
    //     if (!graph) {
    //       return
    //     }
    //     this.cy.remove(this.cy.nodes());
    //     this.cy.add(graph)
    //     if (layout !== '') {
    //       this.drawGraph(layout, vertical)
    //     }
    //   }
    //   saveGraph() {
    //     return { nodes: this.cy.nodes().jsons(), edges: this.cy.edges().jsons() }
    //   }
    //   updateElement(data) {
    //     let elem = this.cy.filter('[id="'+data.id+'"]')
    //     elem.data(data)
    //   }
    //   drawGraph(layout, vertical=true, animate=false) {
    //     let algo = this.cy.layout({
    //       name: layout, // layout name
    //       fit: true, // whether to fit to viewport
    //       directed: true,
    //       grid: false,
    //       padding: 30, // fit padding
    //       spacingFactor: 1.05,
    //       avoidOverlap: true,
    //       animate, // whether to transition the node positions
    //       animationDuration: 500, // duration of animation in ms if enabled
    //       transform: function (node, position ){ 
    //         if(vertical){
    //           return position;
    //         } else {
    //           return {
    //             x : position.y,
    //             y : position.x,
    //           }
    //         }
    //       } // transform a given node position. Useful for changing flow direction in discrete layouts
    //     });
    //     algo.run();
    //     //this.cy.fit();
    //   }

    componentDidMount() {
        this.drawTree();
    }

    drawTree() {
        var svg = d3.select("#" + this.props.label);
        var colorStroke = "#000000";
        var strokeWidth = 2;
        var rectW = 100;
        var rectH = 20;
        svg.append("rect")
            .attr("x", 1)
            .attr("y", 1)
            .attr("width", rectW)
            .attr("height", rectH)
            .style("stroke", colorStroke)
            .style("stroke-width", strokeWidth)
            .style("fill", "none");
        svg.append("rect")
            .attr("x", 1)
            .attr("y", 21)
            .attr("width", rectW)
            .attr("height", rectH)
            .style("stroke", colorStroke)
            .style("stroke-width", strokeWidth)
            .style("fill", "none");
        svg.append("rect")
            .attr("x", 1)
            .attr("y", 41)
            .attr("width", rectW)
            .attr("height", rectH)
            .style("stroke", colorStroke)
            .style("stroke-width", strokeWidth)
            .style("fill", "none");

        svg.append("rect")
            .attr("x", 1)
            .attr("y", 1)
            .attr("width", rectW)
            .attr("height", rectH)
            .style("stroke", colorStroke)
            .style("stroke-width", strokeWidth)
            .style("fill", "#DAE8FC");
        svg.append("rect")
            .attr("x", 1)
            .attr("y", 21)
            .attr("width", rectW)
            .attr("height", rectH)
            .style("stroke", colorStroke)
            .style("stroke-width", strokeWidth)
            .style("fill", "#F8CECC");
        svg.append("rect")
            .attr("x", 1)
            .attr("y", 41)
            .attr("width", rectW)
            .attr("height", rectH)
            .style("stroke", colorStroke)
            .style("stroke-width", strokeWidth)
            .style("fill", "#D5E8D4");

    }

    computeTree(){
        var nodes = this.props.instance.scenarioNodes;
        var edges = this.props.instance.scenarioEdges;

        edges.forEach(element => {
            // TODO: Search for the root
        });
    }

    render() {
        return (
            <div style={{ height: '100%' }}>
                <svg id={this.props.label} style={{ height: this.state.height, width: this.state.width }} />
            </div>
        );
    }
};

TreeView.propTypes = {
    onLeftClickNode: PropTypes.func,
    label: PropTypes.string,
    version: PropTypes.string,
    graph: PropTypes.object,
    style: PropTypes.object,
}