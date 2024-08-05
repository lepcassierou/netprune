import React from 'react';

import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import Autocomplete from '@material-ui/lab/Autocomplete';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';

import Grid from '@material-ui/core/Grid';
import d3 from 'd3';

import { ScenarioCollection } from '/imports/db/ScenarioCollection';
import { InstanceCollection } from '/imports/db/InstanceCollection';

class ScenarioConfusionMatrix extends React.Component {
    constructor(props) {
        super(props);

        let height = this.props.height
        if (!height)
            height = 200 // 200 ?
        let width = this.props.width
        if (!width)
            width = 250 // 200 ?

        this.margin = { top: 5, left: 50, bottom: 20, right: 5 }

        this.state = {
            height,
            width,
            legendWidth: 15,
            confMatrixType: "Absolute",
            scenarToCompareTo: this.props.scenarios.length > 0 ? this.props.scenarios[0] : null,
        }

        this.handleScenarioChange = this.handleScenarioChange.bind(this);
        this.drawConfusionMatrix = this.drawConfusionMatrix.bind(this);
        this.drawLegend = this.drawLegend.bind(this);
        this.handleConfMatrixType = this.handleConfMatrixType.bind(this);
        this.getLabelOfClass = this.getLabelOfClass.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.scenario || !this.props.scenario) {
            return;
        }
        if (prevProps.scenario._id !== this.props.scenario._id) {
            if (!!this.props.scenarios && this.props.scenarios.length > 0) {
                this.setState({ scenarToCompareTo: this.props.scenarios[0] }, () => {
                    this.drawConfusionMatrix();
                })
            }
        }
        if (!prevProps.scenarios && !!this.props.scenarios) {
            if (this.props.scenarios >= 1) { // Enables the comparison between models
                this.setState({ scenarToCompareTo: this.props.scenarios[0] }, () => {
                    this.drawConfusionMatrix();
                })
            }
            // TODO: Test if scenarios has chenged
        }
        if (!prevProps.scenario.confusionMatrix && !!this.props.scenario.confusionMatrix) {
            this.drawConfusionMatrix();
            return;
        }
    }

    handleConfMatrixType(event) {
        if (event.target.value == "Relative to") {
            this.setState({ scenarToCompareTo: this.props.scenarios[0], confMatrixType: event.target.value },
                () => this.drawConfusionMatrix())
        } else {
            this.setState({ confMatrixType: event.target.value }, () => this.drawConfusionMatrix());
        }
    }

    handleScenarioChange(event, value) {
        let found = false;
        for (let i = 0; i < this.props.scenarios.length; ++i) {
            if (this.props.scenarios[i].name == value.name) {
                found = true;
                this.scenarToCompareTo = this.props.scenarios[i];
                this.setState({ scenarToCompareTo: this.props.scenarios[i] }, () => {
                    this.drawConfusionMatrix();
                })
            }
        }
        if (!found)
            this.drawConfusionMatrix();
    }

    computeColor(val, m, M, mColor, MColor) {
        let colorVal = (Math.abs(val) - m) / (M - m) * (MColor - mColor) + mColor;
        if (val === 0) {
            return ["#FFFFFF", colorVal];
        }
        return ["#34425a", colorVal];
    }

    drawConfusionMatrix() {
        if (!this.props.scenario.confusionMatrix) {
            return;
        }
        let confMat = this.props.scenario.confusionMatrix[0];
        let nbClasses = confMat.length;
        let nbSamples = 0;
        let linesSums = [];
        for (let i = 0; i < nbClasses; ++i) {
            let sum = 0;
            for (let j = 0; j < nbClasses; ++j) {
                nbSamples += confMat[i][j];
                sum += Math.abs(confMat[i][j]);
            }
            linesSums.push(sum);
        }

        let m = nbSamples;
        let M = 0;
        let isMatrixRelative = (this.state.confMatrixType != "Absolute" && this.state.scenarToCompareTo != null);
        if (isMatrixRelative) {
            let confMat2 = this.state.scenarToCompareTo.confusionMatrix[0];
            let confMatDiff = [];
            for (let i = 0; i < nbClasses; ++i) {
                let cmdRow = [];
                for (let j = 0; j < nbClasses; ++j) {
                    cmdRow.push(confMat[i][j] - confMat2[i][j]);
                }
                confMatDiff.push(cmdRow);
            }
            confMat = confMatDiff;
        }

        for (let i = 0; i < nbClasses; ++i) {
            for (let j = 0; j < nbClasses; ++j) {
                if (Math.abs(confMat[i][j]) < m)
                    m = Math.abs(confMat[i][j]);
                if (Math.abs(confMat[i][j]) > M)
                    M = Math.abs(confMat[i][j]);
            }
        }

        let maxPercentage = 0;
        let minPercentage = 1000;

        let marginX = 1;
        let marginY = 1;
        let cellWidth = (this.state.width - this.state.legendWidth - 2 * marginX) / (nbClasses + 1);
        let cellHeight = (this.state.height - 2 * marginY) / (nbClasses + 1);

        let colorStroke = "#7F7F7F";
        let colorHovered = "#3F51B5";
        let strokeWidth = 2;
        let svg = d3.select("#confMatrixId");
        d3.selectAll("#confMatrixId").selectAll("*").remove();

        // Draw matrix head (first line + first column)
        let headDimsEqualsBodyDims = false;
        if (this.props.instance.datasetName === "cats_vs_dogs"
            || this.props.instance.datasetName === "leaks"
            || this.props.instance.datasetName === "pointcloud") {
            headDimsEqualsBodyDims = true;
        }
        if (headDimsEqualsBodyDims) {
            svg.append("line")
                .attr("x1", marginX)
                .attr("x2", marginX + cellWidth)
                .attr("y1", marginY)
                .attr("y2", marginY + cellHeight)
                .style("stroke", colorStroke)
                .style("stroke-width", strokeWidth)
        }

        // First line
        for (let i = 0; i <= nbClasses; ++i) {
            if (headDimsEqualsBodyDims) {
                svg.append("rect")
                    .attr("x", marginX + cellWidth * i)
                    .attr("y", marginY)
                    .attr("width", cellWidth)
                    .attr("height", cellHeight)
                    .style("stroke", colorStroke)
                    .style("stroke-width", strokeWidth)
                    .style("fill", "none");

                if (i == 0) {
                    svg.append("text")
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("dy", ".35em")
                        .attr("font-size", "9")
                        .attr("transform", `translate(${cellWidth / 3}, ${2 * cellHeight / 3}) rotate(45)`)
                        .style("text-anchor", "middle")
                        .text("GT".substring(0, 3));
                    svg.append("text")
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("dy", ".35em")
                        .attr("font-size", "8")
                        .attr("transform", `translate(${2 * cellWidth / 3}, ${cellHeight / 3}) rotate(45)`)
                        .style("text-anchor", "middle")
                        .text("predictions".substring(0, 4));
                } else {
                    svg.append("text")
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("dy", ".35em")
                        .attr("font-size", "10")
                        .attr("transform", `translate(${marginX + cellWidth * (i + .5)}, ${cellHeight / 2})`)
                        .style("text-anchor", "middle")
                        .text(this.getLabelOfClass(i - 1, 5));
                }
            } else {
                let cell = svg.append("rect")
                    .style("stroke", colorStroke)
                    .style("stroke-width", strokeWidth)
                    .style("fill", "none");

                if (i == 0) {
                    // First Head cell
                    cell.attr("x", marginX)
                        .attr("y", marginY)
                        .attr("width", 2 * cellWidth)
                        .attr("height", 2 * cellHeight);

                    svg.append("line")
                        .attr("x1", marginX)
                        .attr("x2", marginX + 2 * cellWidth)
                        .attr("y1", marginY)
                        .attr("y2", marginY + 2 * cellHeight)
                        .style("stroke", colorStroke)
                        .style("stroke-width", strokeWidth)

                    let halfDiag = Math.sqrt(4 * cellWidth * cellWidth + 4 * cellHeight * cellHeight) / 2;
                    svg.append("text")
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("dy", ".35em")
                        .attr("font-size", "10")
                        .attr("transform", `rotate(45) translate(${halfDiag}, ${cellHeight / 3})`)
                        .style("text-anchor", "middle")
                        .text("GT"); // "labels"
                    svg.append("text")
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("dy", ".35em")
                        .attr("font-size", "10")
                        .attr("transform", `rotate(45) translate(${halfDiag}, ${-cellHeight / 2})`)
                        .style("text-anchor", "middle")
                        .text("predictions".substring(0, 4));
                } else {
                    cell.attr("x", marginX + cellWidth * (i + 1))
                        .attr("y", marginY)
                        .attr("width", cellWidth)
                        .attr("height", 2 * cellHeight);

                    svg.append("text")
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("dy", ".35em")
                        .attr("font-size", "10")
                        .attr("transform", () => {
                            if (this.props.instance.datasetName == "mnist") {
                                return `translate(${marginX + cellWidth * (i + 1.5)}, ${marginY + cellHeight})`;
                            } else {
                                return `translate(${marginX + cellWidth * (i + 1.5)}, ${marginY + cellHeight}) rotate(80)`;
                            }
                        })
                        .style("text-anchor", "middle")
                        .text(this.getLabelOfClass(i - 1, 5));
                }
            }
        }

        // First column
        for (let j = 0; j < nbClasses; ++j) {
            if (headDimsEqualsBodyDims) {
                let cell = svg.append("rect")
                    .style("stroke", colorStroke)
                    .style("stroke-width", strokeWidth)
                    .style("fill", "none")
                    .attr("x", marginX)
                    .attr("y", marginY + cellHeight * (j + 1))
                    .attr("width", cellWidth)
                    .attr("height", cellHeight);

                svg.append("text")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("dy", ".35em")
                    .attr("font-size", "10")
                    .attr("transform", `translate(${marginX + cellWidth / 2}, ${marginY + cellHeight * (j + 1.5)})`)
                    .style("text-anchor", "middle")
                    .text(this.getLabelOfClass(j, 7));
            } else {
                let cell = svg.append("rect")
                    .style("stroke", colorStroke)
                    .style("stroke-width", strokeWidth)
                    .style("fill", "none");

                cell.attr("x", marginX)
                    .attr("y", marginY + cellHeight * (j + 2))
                    .attr("width", 2 * cellWidth)
                    .attr("height", cellHeight);

                svg.append("text")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("dy", ".35em")
                    .attr("font-size", "10")
                    .attr("transform", `translate(${marginX + cellWidth}, ${marginY + cellHeight * (j + 2.5)})`)
                    .style("text-anchor", "middle")
                    .text(this.getLabelOfClass(j, 7));
            }
        }

        // Matrix body
        for (let i = 0; i < nbClasses; ++i) {
            for (let j = 0; j < nbClasses; ++j) {
                let cell = svg.append("rect")
                    .style("stroke", colorStroke)
                    .style("stroke-width", strokeWidth)
                    .style("fill", "none");

                cell.attr("x", () => {
                    if (headDimsEqualsBodyDims)
                        return marginX + cellWidth * (i + 1);
                    else
                        return marginX + cellWidth * (i + 2);
                })
                    .attr("y", () => {
                        if (headDimsEqualsBodyDims)
                            return marginY + cellHeight * (j + 1);
                        else
                            return marginY + cellHeight * (j + 2);
                    })
                    .attr("width", cellWidth)
                    .attr("height", cellHeight)
                if (i == j) {
                    cell.style("stroke-width", strokeWidth + 1);
                }
                if (isMatrixRelative && confMat[j][i] != 0) {
                    svg.append("text")
                        .attr("x", () => {
                            if (headDimsEqualsBodyDims)
                                return marginX + cellWidth * (i + 1.5);
                            else
                                return marginX + cellWidth * (i + 2.5);
                        })
                        .attr("y", () => {
                            if (headDimsEqualsBodyDims)
                                return marginX + cellHeight * (j + 1.5);
                            else
                                return marginY + cellHeight * (j + 2.5);
                        })
                        .attr("dy", ".35em")
                        .style("text-anchor", "middle")
                        .text(function () {
                            if (isMatrixRelative) {
                                if (i == j) {
                                    if (confMat[j][i] > 0) {
                                        return "+";
                                    } else {
                                        return "-";
                                    }
                                } else {
                                    if (confMat[j][i] < 0) {
                                        return "+";
                                    } else {
                                        return "-";
                                    }
                                }
                            }
                        })
                        .attr("pointer-events", "none");
                }

                let cellColor = 0;
                if (isMatrixRelative) {
                    cellColor = this.computeColor(confMat[j][i], 0, M, 0.1, 1);
                } else {
                    // cellColor = this.computeColor(confMat[j][i], m, M, 0.1, 1);
                    cellColor = this.computeColor(confMat[j][i], 0, linesSums[j], 0.1, 1);
                }
                cell.style("fill", cellColor[0])
                    .style("fill-opacity", cellColor[1]);

                let percentage = confMat[j][i] * 100 / linesSums[j];
                maxPercentage = Math.max(maxPercentage, Math.abs(percentage));
                minPercentage = Math.min(minPercentage, Math.abs(percentage));
                cell.append("title")
                    .text(percentage.toFixed(2) + " % (" + (confMat[j][i]) + ")");

                let datasetPath = "";
                if (!!this.props.instance) {
                    datasetPath += "/datasets/" + this.props.instance.datasetName + "/";
                }
                cell.on("click", () => {
                    d3.select("#imagesContainer").selectAll("*").remove();
                    let imgContainer = d3.select("#imagesContainer");
                    // imgContainer.append("span").text("(" + j +  ", " + i +  ")");
                    let imgSize = 1.5 * 28;

                    if (isMatrixRelative) {
                        if (!!this.props.scenario.indicesImages && !!this.state.scenarToCompareTo.indicesImages) {
                            let indicesCurrentMat = this.props.scenario.indicesImages[0][j][i];
                            let indicesToCompareMat = this.state.scenarToCompareTo.indicesImages[0][j][i];

                            let onlyRef = [];
                            let onlyComp = [];
                            let bothRefComp = [];
                            for (let k = 0; k < indicesCurrentMat.length; ++k) {
                                if (indicesToCompareMat.includes(indicesCurrentMat[k])) {
                                    bothRefComp.push(indicesCurrentMat[k]);
                                } else {
                                    onlyRef.push(indicesCurrentMat[k]);
                                }
                            }
                            for (let k = 0; k < indicesToCompareMat.length; ++k) {
                                if (!bothRefComp.includes(indicesToCompareMat[k])) {
                                    onlyComp.push(indicesToCompareMat[k]);
                                }
                            }

                            let limitPerList = 5;
                            let imagesPadding = "7px";
                            let borderSize = 3;
                            let minOnlyRef = Math.min(onlyRef.length, limitPerList);
                            if (minOnlyRef > 0) {
                                let spanOnlyRef = imgContainer.append("span")
                                    .attr("title", `Images that DO NOT belong to the selected cell (${j},${i}) on the target model but DO belong to it on the considered model (cf. tree view).`)
                                    .style("margin", imagesPadding)
                                    .style("border", borderSize + "px solid orange")
                                    .style("display", "inline-block")
                                    .style("height", (imgSize + 2 * borderSize) + "px");
                                for (let numImg = 0; numImg < minOnlyRef; ++numImg) {
                                    let colorBorder = "black";
                                    if (this.state.scenarToCompareTo.indicesImages[0][j][j].includes(onlyRef[numImg])) {
                                        colorBorder = "green";
                                    } else {
                                        colorBorder = "red";
                                    }
                                    let imgSelf = spanOnlyRef.append("span")
                                        .style("border", borderSize + "px dashed " + colorBorder)
                                        .style("padding", borderSize)
                                        .style("height", imgSize + "px")
                                        .style("display", "inline-block");
                                    imgSelf.append("img")
                                        .attr("src", datasetPath + onlyRef[numImg] + ".png")
                                        .attr("alt", onlyRef[numImg] + ".png")
                                        .attr("width", imgSize)
                                        .attr("height", imgSize)
                                        .style("padding", borderSize);
                                }
                            }

                            let spanBoth = imgContainer.append("span")
                                .attr("title", `Images that belong to the selected cell (${j},${i}) on both considered and target models.`)
                                .style("margin", imagesPadding)
                                .style("display", "inline-block")
                                .style("height", (imgSize + 2 * borderSize) + "px");
                            for (let numImg = 0; numImg < Math.min(bothRefComp.length, limitPerList); ++numImg) {
                                spanBoth.append("img")
                                    .attr("src", datasetPath + bothRefComp[numImg] + ".png")
                                    .attr("alt", bothRefComp[numImg] + ".png")
                                    .attr("width", imgSize)
                                    .attr("height", imgSize);
                            }

                            let minOnlyComp = Math.min(onlyComp.length, limitPerList);
                            if (minOnlyComp > 0) {
                                let spanOnlyComp = imgContainer.append("span")
                                    .attr("title", `Images that DO belong to the selected cell (${j},${i}) on the target model but DO NOT belong to it on the considered model (cf. tree view).`)
                                    .style("margin", imagesPadding)
                                    .style("border", borderSize + "px solid steelblue")
                                    .style("display", "inline-block")
                                    .style("height", (imgSize + 2 * borderSize) + "px");
                                for (let numImg = 0; numImg < minOnlyComp; ++numImg) {
                                    let colorBorder = "black";
                                    if (this.props.scenario.indicesImages[0][j][j].includes(onlyComp[numImg])) {
                                        colorBorder = "green";
                                    } else {
                                        colorBorder = "red";
                                    }
                                    let imgSelf = spanOnlyComp.append("span")
                                        .style("border", borderSize + "px dashed " + colorBorder)
                                        .style("padding", borderSize)
                                        .style("height", imgSize + "px")
                                        .style("display", "inline-block");
                                    imgSelf.append("img")
                                        .attr("src", datasetPath + onlyComp[numImg] + ".png")
                                        .attr("alt", onlyComp[numImg] + ".png")
                                        .attr("width", imgSize)
                                        .attr("height", imgSize);
                                }
                            }
                        }

                    } else {
                        if (!!this.props.scenario.indicesImages) {
                            let nbImages = this.props.scenario.indicesImages[0][j][i].length;
                            let limit = 15;
                            if (nbImages <= limit) {
                                for (let indexImg = 0; indexImg < nbImages; ++indexImg) {
                                    imgContainer.append("img")
                                        .attr("src", datasetPath + this.props.scenario.indicesImages[0][j][i][indexImg] + ".png")
                                        .attr("alt", this.props.scenario.indicesImages[0][j][i][indexImg] + ".png")
                                        .attr("width", imgSize)
                                        .attr("height", imgSize);
                                }
                            } else {
                                let nbSegment = limit / 3;
                                let imagesPadding = "7px";
                                // Stronger probability
                                let spanStronger = imgContainer.append("span")
                                    .style("margin", imagesPadding)
                                    .style("border", "3px solid green")
                                    .style("display", "inline-block")
                                    .style("height", imgSize + "px");
                                for (let indexImg = 0; indexImg < nbSegment; ++indexImg) {
                                    spanStronger.append("img")
                                        .attr("src", datasetPath + this.props.scenario.indicesImages[0][j][i][indexImg] + ".png")
                                        .attr("alt", this.props.scenario.indicesImages[0][j][i][indexImg] + ".png")
                                        .attr("width", imgSize)
                                        .attr("height", imgSize);
                                }
                                // Median probability
                                let spanMedian = imgContainer.append("span")
                                    .style("margin", imagesPadding)
                                    .style("border", "3px solid white")
                                    .style("display", "inline-block")
                                    .style("height", imgSize + "px");
                                let median = Math.floor(nbImages / 2);
                                let medianMin = median - Math.floor(nbSegment / 2);
                                let medianMax = median + Math.ceil(nbSegment / 2);
                                for (let indexImg = medianMin; indexImg < medianMax; ++indexImg) {
                                    spanMedian.append("img")
                                        .attr("src", datasetPath + this.props.scenario.indicesImages[0][j][i][indexImg] + ".png")
                                        .attr("alt", this.props.scenario.indicesImages[0][j][i][indexImg] + ".png")
                                        .attr("width", imgSize)
                                        .attr("height", imgSize);
                                }
                                // Weaker probability
                                let spanWeaker = imgContainer.append("span")
                                    .style("margin", imagesPadding)
                                    .style("border", "3px solid red")
                                    .style("display", "inline-block")
                                    .style("height", imgSize + "px");
                                for (let indexImg = nbImages - nbSegment; indexImg < nbImages; ++indexImg) {
                                    spanWeaker.append("img")
                                        .attr("src", datasetPath + this.props.scenario.indicesImages[0][j][i][indexImg] + ".png")
                                        .attr("alt", this.props.scenario.indicesImages[0][j][i][indexImg] + ".png")
                                        .attr("width", imgSize)
                                        .attr("height", imgSize);
                                }
                            }
                        }
                    }
                })
                cell.on("mouseover", function () {
                    d3.select(this).style("cursor", "pointer");
                    svg.append("rect")
                        .attr("id", "hovered_cell_" + j + "_" + i)
                        .attr("x", () => {
                            if (headDimsEqualsBodyDims)
                                return marginX + cellWidth * (i + 1);
                            else
                                return marginX + cellWidth * (i + 2);

                        })
                        .attr("y", () => {
                            if (headDimsEqualsBodyDims)
                                return marginY + cellHeight * (j + 1);
                            else
                                return marginY + cellHeight * (j + 2);
                        })
                        .attr("width", cellWidth)
                        .attr("height", cellHeight)
                        .style("stroke", colorHovered)
                        .style("stroke-width", strokeWidth + 1)
                        .style("fill", "none");
                });
                cell.on("mouseout", function () {
                    d3.select(this).style("cursor", "default");
                    svg.selectAll("#hovered_cell_" + j + "_" + i).remove();
                });
            }
        }
        this.drawLegend(minPercentage, maxPercentage);
    }


    drawLegend(m, M) {
        let x = this.state.width + this.state.legendWidth + 10;
        let y = 20;
        let svg = d3.select("#confMatrixId");

        // Create the svg:defs element and the main gradient definition.
        var svgDefs = svg.append('defs');

        var mainGradient = svgDefs.append('linearGradient')
            .attr('id', 'mainGradient')
            .attr('gradientTransform', 'rotate(90)');

        // Create the stops of the main gradient. Each stop will be assigned
        // a class to style the stop using CSS.
        mainGradient.append('stop')
            .attr("stop-color", "#34425a")
            .attr('offset', '0%');

        mainGradient.append('stop')
            .attr("stop-color", "#FFFFFF")
            .attr('offset', '100%');

        svg.append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", this.state.legendWidth)
            .attr("height", this.state.height)
            .style("fill", "url(#mainGradient)");

        let lgdStrokeW = 2;
        let tickOffset = 5;
        svg.append("polyline")
            .attr("points", () => {
                return (x + this.state.legendWidth + tickOffset) + ", " + (y + lgdStrokeW / 2) + " "
                    + x + ", " + (y + lgdStrokeW / 2) + " "
                    + x + ", " + (y + this.state.height - lgdStrokeW / 2) + " "
                    + (x + this.state.legendWidth + tickOffset) + ", " + (y + this.state.height - lgdStrokeW / 2) + " "
            })
            .style("fill", "none")
            .style("stroke", "black")

        // Legend max
        svg.append("text")
            .attr("x", (x + this.state.legendWidth + tickOffset))
            .attr("y", 5 + lgdStrokeW + y)
            .attr("font-size", "9")
            .attr("font-family", "Verdana")
            .text(() => {
                if (this.state.confMatrixType === "Absolute") {
                    return "100 %";
                } else {
                    return M.toFixed(2) + " %";
                }
            }); // M

        // Legend min
        svg.append("text")
            .attr("x", (x + this.state.legendWidth + tickOffset))
            .attr("y", this.state.height - 5 - lgdStrokeW + y)
            .attr("font-size", "9")
            .attr("font-family", "Verdana")
            .text(() => {
                if (this.state.confMatrixType === "Absolute") {
                    return "0 %";
                } else {
                    return m.toFixed(2) + " %";
                }
            }); // m

        // Legend + and -
        if (this.state.confMatrixType !== "Absolute") {
            let rectW = 15;
            let rectH = 10;
            let nbLegendSize = 3;
            let paddingYLegend = 5;
            let shiftY;
            if (this.props.instance.datasetName === "mnist") {
                shiftY = 0;
            } else {
                shiftY = 20;
            }
            svg.append("rect")
                .attr("x", this.state.width + nbLegendSize * this.state.legendWidth + rectW / 2)
                .attr("y", this.state.height / 2 + shiftY + 10 - 3 * rectH / 4 - 1 + paddingYLegend)
                .attr("width", rectW)
                .attr("height", rectH)
                .style("fill", "none")
                .style("stroke", "black");
            svg.append("text")
                .attr("x", this.state.width + nbLegendSize * this.state.legendWidth + rectW)
                .attr("y", this.state.height / 2 + 10 + shiftY + paddingYLegend)
                .attr("font-size", "12")
                .attr("font-family", "Verdana")
                .style("text-anchor", "middle")
                .text("+");
            svg.append("text")
                .attr("x", this.state.width + nbLegendSize * this.state.legendWidth + rectW / 2 + 20)
                .attr("y", this.state.height / 2 + 10 + shiftY + paddingYLegend)
                .attr("font-size", "10")
                .attr("font-family", "Verdana")
                .text("Improvement");

            svg.append("rect")
                .attr("x", this.state.width + nbLegendSize * this.state.legendWidth + rectW / 2)
                .attr("y", this.state.height / 2 + 20 + shiftY - 3 * rectH / 4 - 1 + 2 * paddingYLegend)
                .attr("width", rectW)
                .attr("height", rectH)
                .style("fill", "none")
                .style("stroke", "black");
            svg.append("text")
                .attr("x", this.state.width + nbLegendSize * this.state.legendWidth + rectW)
                .attr("y", this.state.height / 2 + 20 + shiftY + 2 * paddingYLegend)
                .attr("font-size", "12")
                .attr("font-family", "Verdana")
                .style("text-anchor", "middle")
                .text("-");
            svg.append("text")
                .attr("x", this.state.width + nbLegendSize * this.state.legendWidth + rectW / 2 + 20)
                .attr("y", this.state.height / 2 + 20 + shiftY + 2 * paddingYLegend)
                .attr("font-size", "10")
                .attr("font-family", "Verdana")
                .text("Deterioration");
        }
    }

    getLabelOfClass(classNb, maxIndex = 3) {
        if (classNb < 0) {
            return 0;
        }
        if (this.props.instance.datasetName === "mnist"
            || this.props.instance.datasetName === "pointcloud") {
            return classNb;
        }
        if (this.props.instance.datasetName === "fashion_mnist"
            || this.props.instance.datasetName === "cifar10") {
            let labels = this.props.datasetLabelsList;
            return labels[classNb].substring(0, maxIndex);
        }
        if (this.props.instance.datasetName === "cats_vs_dogs"
            || this.props.instance.datasetName === "leaks") {
            let labels = this.props.datasetLabelsList;
            return labels[classNb];
        }
    }

    componentDidMount() {
        this.drawConfusionMatrix();
    }

    render() {
        // let confMatTitle = "Confusion Matrix ";
        let relativeHelp = "Indicates how considered model selected from the tree view (";
        if (!!this.props.scenario) {
            // confMatTitle += "(" + this.props.scenario.name + ")";
            if (!!this.state.scenarToCompareTo) {
                relativeHelp += this.props.scenario.name
                    + ") improved or got deteriorated compared to the target model selected in the combobox ("
                    + this.state.scenarToCompareTo.name + ")";
            } else {
                relativeHelp = "Compare a model to another (if available)";
            }
        }

        return (
            <Grid
                container
                alignItems="center"
                style={{ height: "100%" }}
            >
                <Grid
                    item
                    container
                    direction="column"
                    alignItems="center"
                    spacing={0}
                    style={{ height: "100%" }}
                    xs={7}
                >
                    <Grid
                        item
                        xs={8}
                    >
                        {
                            (!this.props.scenario) ? null :
                                (!this.props.scenario.confusionMatrix) ? null :
                                    <Grid
                                        item
                                        xs={12}
                                    >
                                        {/* <Typography>{confMatTitle}</Typography> */}
                                        <RadioGroup row aria-label="Confusion Matrix Type :" name="Confusion Matrix Type" defaultValue="Absolute" onChange={this.handleConfMatrixType}>
                                            <FormControlLabel value="Absolute" control={<Radio size="small" />} label="TCM" />
                                            <Tooltip title={relativeHelp} placement='right' arrow>
                                                <FormControlLabel value="Relative to" control={<Radio size="small" />} label="RCM : "
                                                    disabled={!this.props.scenarios || this.props.scenarios.length < 1} />
                                            </Tooltip>
                                        </RadioGroup>
                                    </Grid>
                        }
                    </Grid>
                    <Grid
                        item
                        xs={5}
                    >
                        {(this.state.confMatrixType == "Absolute") ? null :
                            <Autocomplete
                                id="combo-box-scenario"
                                size={"small"}
                                options={this.props.scenarios}
                                getOptionLabel={(scenario) => scenario.name}
                                style={{ width: 250, margin: "10px" }}
                                defaultValue={this.props.scenarios.length > 0 ? this.props.scenarios[0] : null}
                                renderInput={(params) =>
                                    <TextField {...params} label="Scenario" variant="outlined" />
                                }
                                onChange={this.handleScenarioChange}
                            />
                        }
                    </Grid>
                    <Grid
                        item
                        xs={10}
                    >
                        <svg id="confMatrixId" style={{ height: this.state.height + 55, width: this.state.width + 10 * this.state.legendWidth }} />
                    </Grid>
                </Grid>
                <Grid
                    container
                    justifyContent="flex-start"
                    item
                    xs={5}
                >
                    <Grid
                        item
                    >
                        <div id="imagesContainer" style={{ align: "center" }}></div>
                    </Grid>
                </Grid>
            </Grid>
        )
    }
}

export default withTracker((params) => {
    Meteor.subscribe('instances');
    Meteor.subscribe('instanceById');
    var instance = InstanceCollection.findOne({ _id: params.scenario.instanceId });
    var allScenarios = ScenarioCollection.find({ instanceId: params.scenario.instanceId });
    var scenarioList = [];
    allScenarios.forEach((scenario) => {
        if (scenario.name != params.scenario.name)
            scenarioList.push(scenario);
    });

    return {
        instance,
        scenarios: scenarioList,
    }
})(ScenarioConfusionMatrix);