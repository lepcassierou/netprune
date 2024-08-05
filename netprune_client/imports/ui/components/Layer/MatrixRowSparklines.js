import React from 'react';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import d3 from 'd3';

import Sparkline from './Sparkline';


function isLocalBidirectional() {
	return false;
}


export default class MatrixRowSparklines extends React.Component {
	constructor(props) {
		super(props);

		let numClasses = this.props.numClasses;
		this.classes = [];
		for (let i = 0; i < numClasses; ++i) {
			this.classes.push(i);
		}

		let colorBG = {};
		this.classes.map(index => {
			colorBG[index] = 0;
		})

		this.state = {
			colorBG,
		}
		this.updateBGColor = this.updateBGColor.bind(this);
		this.getAverageActivationsPerCell = this.getAverageActivationsPerCell.bind(this);
	}


	updateBGColor(index, alpha) {
		this.setState((prevState) => {
			prevState.colorBG[index] = alpha;
			return { colorBG: prevState.colorBG };
		});
	}


	getAverageActivationsPerCell(classA, classB) {
		if (classA === classB) {
			return this.props.averageActivationsPerClass[classA];
		}

		let averageActivationsClassA = this.props.averageActivationsPerClass[classA];
		let averageActivationsClassB = this.props.averageActivationsPerClass[classB];
		let averageActivations = [];
		if (isLocalBidirectional()) {
			for (let i = 0; i < averageActivationsClassA.length; i++) {
				averageActivations.push({
					id: averageActivationsClassA[i].id,
					value: Math.abs(averageActivationsClassA[i].value - averageActivationsClassB[i].value),
				});
			}
		} else {
			for (let i = 0; i < averageActivationsClassA.length; i++) {
				averageActivations.push({
					id: averageActivationsClassA[i].id,
					value: averageActivationsClassA[i].value - averageActivationsClassB[i].value,
				});
			}
		}
		return averageActivations;
	}


	render() {
		let fontSiz = 12;
		if (!!this.props.fullScreen) {
			fontSiz = 20;
		}
		return (
			<Grid
				container
				justifyContent="center"
				alignItems='center'
				spacing={0}
				style={{ height: "100%" }}
			>
				<Grid item xs={1}>
					{/* Font_size 40 */}
					<Paper variant="outlined" style={{ fontSize: fontSiz, textAlign: "center", height: this.props.fullScreen ? 78 : 46.5 }}> 
						<Grid container
							justifyContent="center"
							alignItems='center'
							spacing={0}
							style={{ height: "100%" }}
						>
							{this.props.datasetLabelsList[this.props.index]}
						</Grid>
					</Paper>
				</Grid>
				{this.classes.map(index =>
					<Grid key={index + "_" + this.state.colorBG[index]} item xs={1}>
						<Paper variant="outlined" style={{ backgroundColor: `rgba(0, 128, 255, ${this.state.colorBG[index]})` }}>
							<Sparkline
								label={`it_${this.props.index}_${index}`}
								classIndex={index}
								averageActivations={this.getAverageActivationsPerCell(this.props.index, index)}
								minsMaxes={this.props.minsMaxes}
								height={this.props.height}
								width={this.props.width}
								baselineIndex={this.props.index}
								metric={this.props.metric}
								localMetric={this.props.localMetric}
								onChangeColorBG={this.updateBGColor}
								fullScreen={this.props.fullScreen}
							/>
						</Paper>
					</Grid>
				)}
			</Grid>
		);
	}
}
