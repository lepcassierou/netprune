import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import d3, { rgb } from 'd3';

import Box from '@material-ui/core/Box';

import { LayerCollection } from '/imports/db/LayerCollection';
import { InstanceCollection } from '/imports/db/InstanceCollection';
import { ScenarioCollection } from '/imports/db/ScenarioCollection';


function getLayerTitle(layer) {
    let params;
    if (layer.params >= 1e9) {
        params = `${(layer.params / 1e9).toFixed(2)} G`;
    } else if (layer.params >= 1e6) {
        params = `${(layer.params / 1e6).toFixed(2)} M`;
    } else if (layer.params >= 1e3) {
        params = `${(layer.params / 1e3).toFixed(2)} k`;
    } else {
        params = `${layer.params}`;
    }

    let text = layer.name;
    if (layer.name.startsWith("conv2d")) {
        text = `conv${layer.name.substring(6)}`;
    } else if (layer.name.startsWith("dense")) {
        text = `fc${layer.name.substring(5)}`;
    } else if (layer.name.startsWith("pred")){
        text = `pred`;
    }
    return `${text} (${layer.filters}: ${params})`;
}


function getLayerTitle_FLOPS(layer, nb_flops) {
    let flops;
    if (nb_flops >= 1e9) {
        flops = `${(nb_flops / 1e9).toFixed(2)} G`;
    } else if (nb_flops >= 1e6) {
        flops = `${(nb_flops / 1e6).toFixed(2)} M`;
    } else if (nb_flops >= 1e3) {
        flops = `${(nb_flops / 1e3).toFixed(2)} k`;
    } else {
        flops = `${nb_flops}`;
    }

    let text = layer.name;
    if (layer.name.startsWith("conv2d")) {
        text = `conv${layer.name.substring(6)}`;
    } else if (layer.name.startsWith("dense")) {
        text = `fc${layer.name.substring(5)}`;
    } else if (layer.name.startsWith("pred")){
        text = `pred`;
    }
    return `${text} (${layer.filters}: ${flops})`;
}


class ModelGraph extends React.Component {
    constructor(props) {
        super(props);
        this.graphView = React.createRef()
        this.state = {
            width: 410, // 410
            height: 347, // 390 //347
        }
        this.centerView = this.centerView.bind(this);
        this.openLayer = this.openLayer.bind(this);
        this.drawModel = this.drawModel.bind(this);
        this.removeLegend = this.removeLegend.bind(this);
        this.drawLayerNames = this.drawLayerNames.bind(this);
    }


    componentDidUpdate(prevProps) {
        if (!!this.props.scenario
            && !!this.props.scenarioRoot
            && (!!this.props.parentScenario || this.props.scenario.root)
            && !!this.props.layers
            && !!this.props.rootLayers
            && !!this.props.parentLayers
            && (this.props.scenario.root || (!this.props.scenario.root && this.props.layers.length === this.props.parentLayers.length))) {
            let modelLayers = [];
            let rootLayers;
            let parentLayers = [];
            for (const element of this.props.layers) {
                if (element.type.includes("Conv")) {
                    modelLayers.push({
                        id: element._id,
                        name: element.name,
                        params: element.params,
                        filters: element.filters,
                        type: "conv",
                    })
                } else if (element.type.includes("Dense")) {
                    modelLayers.push({
                        id: element._id,
                        name: element.name,
                        params: element.params,
                        filters: element.units,
                        type: "dense",
                    })
                } else if (element.type.includes("Pool")) {
                    modelLayers.push({
                        id: element._id,
                        name: element.name,
                        params: element.params,
                        filters: element.units,
                        type: "pool",
                    })
                }
            }
            if (!!this.props.scenario.root) {
                rootLayers = modelLayers;
            } else {
                rootLayers = [];
                for (const element of this.props.rootLayers) {
                    if (element.type.includes("Conv")) {
                        rootLayers.push({
                            id: element._id,
                            name: element.name,
                            params: element.params,
                            filters: element.filters,
                            type: "conv",
                        })
                    } else if (element.type.includes("Dense")) {
                        rootLayers.push({
                            id: element._id,
                            name: element.name,
                            params: element.params,
                            filters: element.units,
                            type: "dense",
                        })
                    } else if (element.type.includes("Pool")) {
                        rootLayers.push({
                            id: element._id,
                            name: element.name,
                            params: element.params,
                            filters: element.units,
                            type: "pool",
                        })
                    }
                }
                for (const element of this.props.parentLayers) {
                    if (element.type.includes("Conv")) {
                        parentLayers.push({
                            id: element._id,
                            name: element.name,
                            params: element.params,
                            filters: element.filters,
                        })
                    } else if (element.type.includes("Dense")) {
                        parentLayers.push({
                            id: element._id,
                            name: element.name,
                            params: element.params,
                            filters: element.units,
                        })
                    } else if (element.type.includes("Pool")) {
                        parentLayers.push({
                            id: element._id,
                            name: element.name,
                            params: element.params,
                            filters: element.units,
                        })
                    }
                }
            }
            let acc = this.props.scenario.accuracy;
            let accParent = this.props.parentLayers.length > 0 ? this.props.parentScenario.accuracy : 0.0;
            this.drawModel(modelLayers, rootLayers, parentLayers, this.props.scenario.root, acc, accParent);
        }
    }


    openLayer(id) {
        this.props.open(id);
    }


    centerView() {
        this.graphView.current.centerView(true)
    }


    drawLayerNames(tag, layerName, x, y) {
        let text = layerName;
        if (layerName.startsWith("conv2d")) {
            text = `conv${layerName.substring(6)}`
        } else if (layerName.startsWith("dense")) {
            text = `fc${layerName.substring(5)}`
        } else if (layerName.startsWith("pred")){
            text = `pred`;
        }
        tag.append("text")
            .attr("class", "layerRectName")
            .attr("x", 0)
            .attr("y", 0)
            .attr("font-size", "12")
            .attr("dy", ".35em")
            .attr("font-family", "Verdana")
            .attr("pointer-events", "none")
            .attr("transform", `translate(${x}, ${y}) rotate(-90)`)
            .style("text-anchor", "middle")
            .text(text);
    }


    drawLegend(modelLayers, rootLayers) {
        let centerX = this.state.width / 2;
        let centerY = this.state.height / 2;
        let min_filters = d3.min(rootLayers, function (d) {
            return d.filters;
        });
        let max_filters = d3.max(rootLayers, function (d) {
            return d.filters;
        });
        let min_h = 30;
        let max_h = 210;
        let w = 20;
        let padding = 30;

        let minColor = 0.2;
        let maxColor = 1;
        let minParams = d3.min(modelLayers, function (d) {
            return d.params;
        });
        let maxParams = d3.max(modelLayers, function (d) {
            return d.params;
        });

        let nb_layers = modelLayers.length;
        let legendBckgd = "whitesmoke";

        let g = d3.select(".legendContent");
        // Background
        g.append("rect")
            .attr("x", centerX - nb_layers * w / 2 - padding)
            .attr("y", centerY - max_h / 2 - padding)
            .attr("width", 2 * padding + nb_layers * w)
            .attr("height", 2 * padding + max_h)
            .attr("stroke-width", "4px")
            .attr("stroke", "white")
            .style("fill", legendBckgd);

        // Layer
        let Y = centerY - max_h / 2;
        g.append("rect")
            .attr("x", centerX - nb_layers * w / 2)
            .attr("y", Y)
            .attr("width", 2 * w)
            .attr("height", w)
            .attr("stroke-width", "1px")
            .attr("stroke", "black")
            .style("fill", legendBckgd);
        g.append("text")
            .attr("x", centerX - nb_layers * w / 2 + 2 * w + padding / 2)
            .attr("y", Y + w / 2)
            .attr("font-size", "12")
            .attr("dy", ".35em")
            .attr("font-family", "Verdana")
            .style("text-anchor", "start")
            .text("Parametered layer (height: #filters)");

        // Pruned
        Y += w * 2;
        g.append("rect")
            .attr("x", centerX - nb_layers * w / 2)
            .attr("y", Y)
            .attr("width", 2 * w)
            .attr("height", w)
            .attr("stroke-width", "3px")
            .attr("stroke-dasharray", "4 ")
            .attr("stroke", "#B00CC9")
            .style("fill", legendBckgd);
        Y += w * 0.5;
        g.append("text")
            .attr("x", centerX - nb_layers * w / 2 + 2 * w + padding / 2)
            .attr("y", Y)
            .attr("font-size", "12")
            .attr("dy", ".35em")
            .attr("font-family", "Verdana")
            .style("text-anchor", "start")
            .text("Last pruned layers");

        // Gradient
        var defs = g.append('defs');
        var gradient = defs.append('linearGradient')
            .attr('id', 'gradient')

        gradient.append('stop')
            .attr("stop-color", "white")
            .attr('offset', '0%');

        gradient.append('stop')
            .attr("stop-color", "orange")
            .attr('offset', '100%');

        Y += 1.5 * w;
        g.append("rect")
            .attr("x", centerX - nb_layers * w / 2)
            .attr("y", Y)
            .attr("width", 2 * w)
            .attr("height", w)
            .attr("stroke-width", "1px")
            .attr("stroke", "black")
            .style("fill", "url(#gradient)");
        Y += w * 0.5;
        g.append("text")
            .attr("x", centerX - nb_layers * w / 2 + 2 * w + padding / 2)
            .attr("y", Y)
            .attr("font-size", "12")
            .attr("dy", ".35em")
            .attr("font-family", "Verdana")
            .style("text-anchor", "start")
            .text("#parameters");

        // Improvement/Deterioration
        // --
        Y += 1.5 * w;
        g.append("line")
            .attr("x1", centerX - nb_layers * w / 2)
            .attr("y1", Y)
            .attr("x2", centerX - nb_layers * w / 2 + 2 * w)
            .attr("y2", Y)
            .attr("stroke-width", "2px")
            .attr("stroke", "green")
        // |
        g.append("line")
            .attr("x1", centerX - nb_layers * w / 2)
            .attr("y1", Y)
            .attr("x2", centerX - nb_layers * w / 2)
            .attr("y2", Y + w * 2)
            .attr("stroke-width", "2px")
            .attr("stroke", "green")
        // __
        g.append("line")
            .attr("x1", centerX - nb_layers * w / 2)
            .attr("y1", Y + w * 2)
            .attr("x2", centerX - nb_layers * w / 2 + 2 * w)
            .attr("y2", Y + w * 2)
            .attr("stroke-width", "2px")
            .attr("stroke", "red")
        //   |
        g.append("line")
            .attr("x1", centerX - nb_layers * w / 2 + 2 * w)
            .attr("y1", Y)
            .attr("x2", centerX - nb_layers * w / 2 + 2 * w)
            .attr("y2", Y + w * 2)
            .attr("stroke-width", "2px")
            .attr("stroke", "red")
        g.append("text")
            .attr("x", centerX - nb_layers * w / 2 + 2 * w + padding / 2)
            .attr("y", Y + w)
            .attr("font-size", "12")
            .attr("dy", ".35em")
            .attr("font-family", "Verdana")
            .style("text-anchor", "start")
            .attr("fill", "green")
            .text("Improvement");
        g.append("text")
            .attr("x", centerX - nb_layers * w / 2 + 2 * w + padding / 2 + 90)
            .attr("y", Y + w)
            .attr("font-size", "12")
            .attr("dy", ".35em")
            .attr("font-family", "Verdana")
            .attr("fill", "red")
            .style("text-anchor", "start")
            .text("/ Deterioration");
    }


    removeLegend(event) {
        d3.select(".legendContent").selectAll('*').remove();
    }


    drawModel(modelLayers, rootLayers, parentLayers, modelIsRoot, acc, accParent) {
        let svg = d3.select("#modelViewId");
        svg.selectAll("*").remove();
        let g = svg.append("g");
        svg.append("g")
            .attr("class", "legendContent");

        let centerX = this.state.width / 2;
        let centerY = this.state.height / 2;

        let min_filters = d3.min(rootLayers, function (d) {
            return d.filters;
        });
        let max_filters = d3.max(rootLayers, function (d) {
            return d.filters;
        });
        let min_h = 30;
        let max_h = 210;
        let w = 16;
        let padding = 15;

        let minColor = 0.2;
        let maxColor = 1;
        let minParams = d3.min(modelLayers, function (d) {
            return d.params;
        });
        let maxParams = d3.max(modelLayers, function (d) {
            return d.params;
        });

        let showFLOPS = false;
        let defaultLayerText = "layer_name (#filters: #params)";
        if(showFLOPS){
            defaultLayerText = "layer_name (#filters: #flops)";
        }

        // Box contour
        let nb_layers = modelLayers.length;
        let nb_layers_min = Math.max(nb_layers, 15);
        g.append("rect")
            .attr("x", centerX - nb_layers_min * w / 2 - padding)
            .attr("y", centerY - max_h / 2 - padding)
            .attr("width", 2 * padding + nb_layers_min * w)
            .attr("height", 2 * padding + max_h)
            .attr("stroke-width", "2px")
            .attr("stroke", () => {
                if (accParent === 0.0) {
                    return "black";
                }
                if (acc < accParent) {
                    return "red";
                } else {
                    return "green";
                }
            })
            .style("fill", "white")

        // Legend text
        g.append("text")
            .attr("x", centerX - nb_layers * w / 2 - padding + 5)
            .attr("y", centerY - max_h / 2 - padding)
            .attr("font-size", "14")
            .attr("dy", "-.35em")
            .attr("font-family", "Verdana")
            .attr("font-weight", "bold")
            .style("text-anchor", "start")
            .text("Show Legend")
            .style("cursor", "pointer")
            .on("mouseover", () => this.drawLegend(modelLayers, rootLayers))
            .on("mouseout", this.removeLegend);

        // Current Layer information
        g.append("text")
            .attr("class", "currentLayerName")
            .attr("x", centerX - nb_layers_min * w / 2 - padding + 5)
            .attr("y", centerY + max_h / 2 + padding)
            .attr("font-size", "14")
            .attr("dy", "-.35em")
            .attr("font-family", "Verdana")
            .attr("pointer-events", "none")
            .style("text-anchor", "start")
            .text(defaultLayerText);

        let init_model_flops = [3604480, 75563008, 0, 37781504, 75530240, 0, 37765120, 75513856, 75513856, 0, 37756928, 75505664, 75505664, 0, 18876416, 18876416, 18876416, 0, 524288, 10240] // VGG_cifar
        // let init_model_flops = [57671680, 0, 604504064, 0, 604241920, 1208221696, 0, 604110848, 1208090624, 0, 302022656, 0, 131072] // Cats_and_dogs
        let minFlops = d3.min(init_model_flops);
        let maxFlops = d3.max(init_model_flops);

        if (modelIsRoot) {
            let previous_l_h = 0;
            for (let l = 0; l < nb_layers; l++) {
                let l_h = (modelLayers[l].filters - min_filters) / max_filters * (max_h - min_h) + min_h;
                let x = centerX - nb_layers * w / 2;
                let y = centerY - l_h / 2;
                if (modelLayers[l].type != "pool") {
                    g.append("rect")
                        .attr("x", x + l * w)
                        .attr("y", y)
                        .attr("width", w)
                        .attr("height", l_h)
                        .attr("stroke-width", "1px")
                        .attr("stroke", "black")
                        .style("fill", "white");
                    let topRect = g.append("rect")
                        .attr("x", x + l * w)
                        .attr("y", y)
                        .attr("width", w)
                        .attr("height", l_h)
                        .attr("stroke-width", "1px")
                        .attr("stroke", "black")
                        .style("fill", () => {
                            if(showFLOPS)
                                return "green";
                            else
                                return "orange";
                        })
                        .style("opacity", () => {
                            if(showFLOPS){
                                let p = init_model_flops[l]; // FLOPs 
                                return (p - minFlops) / maxFlops * (maxColor - minColor) + minColor;
                            } else {
                                let p = modelLayers[l].params; // Params
                                return (p - minParams) / maxParams * (maxColor - minColor) + minColor;
                            }
                        })
                        .on("click", () => {
                            this.openLayer(modelLayers[l].id);
                        })
                        .on("mouseover", function () {
                            d3.select(this).style("cursor", "pointer");
                            // Additional rect for hovering
                            g.append("rect")
                                .attr("id", `id_${modelLayers[l].id}`)
                                .attr("x", x + l * w)
                                .attr("y", y)
                                .attr("width", w)
                                .attr("height", l_h)
                                .attr("stroke-width", "3px")
                                .attr("stroke", "black")
                                .style("fill", "none")
                            if (showFLOPS){
                                d3.select(".currentLayerName").text(getLayerTitle_FLOPS(modelLayers[l], init_model_flops[l]));
                            } else {
                                d3.select(".currentLayerName").text(getLayerTitle(modelLayers[l]));
                            }
                        })
                        .on("mouseout", function () {
                            d3.select(this).style("cursor", "default");
                            svg.selectAll(`#id_${modelLayers[l].id}`).remove();
                            d3.select(".currentLayerName").text(defaultLayerText);
                        });
                    if (showFLOPS){
                        topRect.append("title").text(getLayerTitle_FLOPS(modelLayers[l], init_model_flops[l]));
                    } else {
                        topRect.append("title").text(getLayerTitle(modelLayers[l]));
                    }
                    this.drawLayerNames(g, modelLayers[l].name, x + (l + 1) * w - w / 2, centerY)
                } else if (modelLayers[l].type == "pool") {
                    g.append("polygon")
                        .attr("points", `${x + l * w},${centerY - previous_l_h / 2 + 1} ${x + l * w},${centerY + previous_l_h / 2 - 1} ${x + l * w + w},${centerY + previous_l_h / 2 - w - 1} ${x + l * w + w},${centerY - previous_l_h / 2 + w + 1}`)
                        .attr("stroke-width", "1px")
                        .attr("stroke", "black")
                        .style("fill", "whitesmoke");
                }
                previous_l_h = l_h;
            }
        } else {
            let previous_l_h = 0;
            for (let l = 0; l < nb_layers; l++) {
                let l_h = (modelLayers[l].filters - min_filters) / max_filters * (max_h - min_h) + min_h;
                let x = centerX - nb_layers * w / 2;
                let y = centerY - l_h / 2;
                if (parentLayers.length > 0 && modelLayers[l].filters >= parentLayers[l].filters) {
                    g.append("rect")
                        .attr("x", x + l * w)
                        .attr("y", y)
                        .attr("width", w)
                        .attr("height", l_h)
                        .attr("stroke-width", "1px")
                        .attr("stroke", "black")
                        .style("fill", "white")
                    let topRect = g.append("rect")
                        .attr("x", x + l * w)
                        .attr("y", y)
                        .attr("width", w)
                        .attr("height", l_h)
                        .attr("stroke-width", "1px")
                        .attr("stroke", "black")
                        .style("fill", "orange")
                        .style("opacity", () => {
                            let p = modelLayers[l].params;
                            return (p - minParams) / maxParams * (maxColor - minColor) + minColor;
                        })
                        .on("click", () => {
                            this.openLayer(modelLayers[l].id);
                        })
                        .on("mouseover", function () {
                            d3.select(this).style("cursor", "pointer");
                            // Additional rect for hovering
                            g.append("rect")
                                .attr("id", `id_${modelLayers[l].id}`)
                                .attr("x", x + l * w)
                                .attr("y", y)
                                .attr("width", w)
                                .attr("height", l_h)
                                .attr("stroke-width", "3px")
                                .attr("stroke", "black")
                                .style("fill", "none");
                            d3.select(".currentLayerName").text(getLayerTitle(modelLayers[l]));
                        })
                        .on("mouseout", function () {
                            d3.select(this).style("cursor", "default");
                            svg.selectAll(`#id_${modelLayers[l].id}`).remove();
                            d3.select(".currentLayerName").text(defaultLayerText);
                        });
                    topRect.append("title").text(getLayerTitle(modelLayers[l]));
                    this.drawLayerNames(g, modelLayers[l].name, x + (l + 1) * w - w / 2, centerY)
                    previous_l_h = l_h;
                } else if (modelLayers[l].type == "pool") {
                    g.append("polygon")
                        .attr("points", `${x + l * w},${centerY - previous_l_h / 2 + 1} ${x + l * w},${centerY + previous_l_h / 2 - 1} ${x + l * w + w},${centerY + previous_l_h / 2 - w - 1} ${x + l * w + w},${centerY - previous_l_h / 2 + w + 1}`)
                        .attr("stroke-width", "1px")
                        .attr("stroke", "black")
                        .style("fill", "whitesmoke");
                }
            }
            for (let l = 0; l < nb_layers; l++) {
                let l_h = (modelLayers[l].filters - min_filters) / max_filters * (max_h - min_h) + min_h;
                let x = centerX - nb_layers * w / 2;
                let y = centerY - l_h / 2;
                if (parentLayers.length > 0 && modelLayers[l].filters < parentLayers[l].filters) {
                    g.append("rect")
                        .attr("x", x + l * w)
                        .attr("y", y)
                        .attr("width", w)
                        .attr("height", l_h)
                        .attr("stroke-width", "3px")
                        .attr("stroke-dasharray", "4 ")
                        .attr("stroke", "#B00CC9")
                        .style("fill", "white")
                    let topRect = g.append("rect")
                        .attr("x", x + l * w)
                        .attr("y", y)
                        .attr("width", w)
                        .attr("height", l_h)
                        .attr("stroke-width", "3px")
                        .attr("stroke", "#B00CC9")
                        .attr("stroke-dasharray", "4 ")
                        .style("fill", "orange")
                        .style("opacity", () => {
                            let p = modelLayers[l].params;
                            return (p - minParams) / maxParams * (maxColor - minColor) + minColor;
                        })
                        .on("click", () => {
                            this.openLayer(modelLayers[l].id);
                        })
                        .on("mouseover", function () {
                            d3.select(this).style("cursor", "pointer");
                            // Additional rect for hovering
                            g.append("rect")
                                .attr("id", `id_${modelLayers[l].id}`)
                                .attr("x", x + l * w)
                                .attr("y", y)
                                .attr("width", w)
                                .attr("height", l_h)
                                .attr("stroke-width", "3px")
                                .attr("stroke", "black")
                                .style("fill", "none");
                            d3.select(".currentLayerName").text(getLayerTitle(modelLayers[l]));
                        })
                        .on("mouseout", function () {
                            d3.select(this).style("cursor", "default");
                            svg.selectAll(`#id_${modelLayers[l].id}`).remove();
                            d3.select(".currentLayerName").text(defaultLayerText);
                        });
                    topRect.append("title").text(getLayerTitle(modelLayers[l]));
                    this.drawLayerNames(g, modelLayers[l].name, x + (l + 1) * w - w / 2, centerY)
                }
            }
        }
    }

    render() {
        return (
            <Box height="calc(100% - 35px)">
                <svg id="modelViewId" style={{ height: "100%", width: "100%" }} >
                    {/* <rect x="2" y="2" width={this.state.width - 2} height={this.state.height - 2}> </rect> */}
                </svg>
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

    let instance = InstanceCollection.findOne(params.instanceId);
    let scenario = ScenarioCollection.findOne(params.scenarioId);

    Meteor.subscribe('scenarioByInstanceIdAndName', params.instanceId, "Base model");
    let scenarioRoot = ScenarioCollection.findOne({ "instanceId": params.instanceId, "name": "Base model" });

    let instanceEdges = instance.scenarioEdges;
    let parentId = "";
    instanceEdges.forEach(edge => {
        if (edge.target === params.scenarioId) {
            parentId = edge.source;
        }
    });
    let parentScenario = ScenarioCollection.findOne(parentId);

    Meteor.subscribe('layersByScenarioId', scenarioRoot._id);
    let rootLayersColl = LayerCollection.find({ scenarioId: scenarioRoot._id }).fetch();

    Meteor.subscribe('layersByScenarioId', parentId);
    let parentLayersColl = LayerCollection.find({ scenarioId: parentId }).fetch();

    Meteor.subscribe('layersByScenarioId', params.scenarioId);
    let allLayers = LayerCollection.find({ scenarioId: params.scenarioId }).fetch();

    let rootLayers = [];
    rootLayersColl.forEach(layer => {
        if (scenarioRoot.layerNodes.includes(layer._id)) {
            rootLayers.push(layer);
        }
    });

    let parentLayers = [];
    parentLayersColl.forEach(layer => {
        if (parentScenario.layerNodes.includes(layer._id)) {
            parentLayers.push(layer);
        }
    });

    let layers = [];
    allLayers.forEach(layer => {
        if (scenario.layerNodes.includes(layer._id)) {
            layers.push(layer);
        }
    })

    return {
        scenario,
        scenarioRoot,
        parentScenario,
        layers,
        rootLayers,
        parentLayers,
    }
})(ModelGraph);
