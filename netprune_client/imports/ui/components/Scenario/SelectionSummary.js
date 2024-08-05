import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';

import Checkbox from '@material-ui/core/Checkbox';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import MuiTableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';

const StyledTableCell = withStyles((theme) => ({
    root: {
        minHeight: 5,
        paddingTop: 0,
        paddingBottom: 0,
        height: 5,
    },
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 18,
    },
}))(MuiTableCell);

const StyledTableRow = withStyles((theme) => ({
    root: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
    },
}))(TableRow);

export default class SelectionSummary extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selection: (!this.props.selection) ? {} : this.props.selection,
            selectAll: false,
        }
        // this.computeUnion = this.computeUnion.bind(this);
        this.sortFilters = this.sortFilters.bind(this);
    }

    componentDidUpdate(prevProps) {
        let dataChanged = false;
        if (!prevProps.selection) { // Selection before = Undefined
            if (!(!this.props.selection)) { // Selection after = Defined
                dataChanged = true;
            }
        } else { // Selection before = Defined
            if (!this.props.selection) {
                this.setState({ selection: {} });
                return;
            }
            let prevKeys = Object.keys(prevProps.selection);
            let currentKeys = Object.keys(this.props.selection);
            if (prevKeys.length !== currentKeys.length) {
                dataChanged = true;
            } else {
                prevKeys.forEach(metric => {
                    if (!(currentKeys.includes(metric))) {
                        dataChanged = true;
                    } else {
                        prevProps.selection[metric].forEach(filter => {
                            if (!this.props.selection[metric].includes(filter)) {
                                dataChanged = true;
                            }
                        })
                    }
                })
                currentKeys.forEach(metric => {
                    if (!(prevKeys.includes(metric))) {
                        dataChanged = true;
                    } else {
                        this.props.selection[metric].forEach(filter => {
                            if (!prevProps.selection[metric].includes(filter)) {
                                dataChanged = true;
                            }
                        })
                    }
                })
            }
        }
        if (dataChanged) {
            this.setState({ selection: this.props.selection }, () => {
                this.props.onDataChanged([]);
            });
        }
    }

    sortFilters() {
        // Initialisation
        let filtersOccur = {};
        let keys = Object.keys(this.state.selection);
        if (keys.length > 0) {
            Object.keys(this.state.selection).forEach(metric => {
                this.state.selection[metric].forEach(filter => {
                    if (filter in filtersOccur) {
                        filtersOccur[filter]++;
                    } else {
                        filtersOccur[filter] = 1;
                    }
                })
            });
        }

        // Sort filters according to metrics
        let filtersPerMetric = {}
        Object.keys(filtersOccur).forEach(filter => {
            let nbMetrics = filtersOccur[filter];
            if (nbMetrics in filtersPerMetric) {
                filtersPerMetric[nbMetrics].push(filter);
            } else {
                filtersPerMetric[nbMetrics] = [filter];
            }
        })

        // Second sorting (done first) : filter selected by metric 1 > metric 2 > ...
        // Object.keys(filtersPerMetric).forEach(nbOcc => {
        //     let filtersList = filtersPerMetric[nbOcc];
        //     filtersList.sort((a,b) => {
        //         let metricKeys = Object.keys(this.state.metricsList);
        //         for(let i=0 ; i<metricKeys.length ; ++i){
        //             // console.log(this.state.metricsList[metricKeys[i]]);
        //             if(this.state.metricsList[metricKeys[i]] in this.state.selection){
        //                 if(this.state.selection[this.state.metricsList[metricKeys[i]]].includes(a)
        //                     && !(this.state.selection[this.state.metricsList[metricKeys[i]]].includes(b))){ // a.toString() ?
        //                         return -1;
        //                 } else if(this.state.selection[this.state.metricsList[metricKeys[i]]].includes(b)
        //                     && !(this.state.selection[this.state.metricsList[metricKeys[i]]].includes(a))){ // a.toString() ?
        //                     return 1;
        //                 }
        //             }
        //         }
        //     });
        // });

        let sortedFilters = [];
        let fPMKeys = Object.keys(filtersPerMetric).sort(function (a, b) {
            return parseInt(b) - parseInt(a);
        });
        fPMKeys.forEach(nbMetricsKey => {
            sortedFilters = sortedFilters.concat(filtersPerMetric[nbMetricsKey]);
        })

        // Convert string keys to int
        let sortedFiltersInt = [];
        sortedFilters.forEach(filter => {
            sortedFiltersInt.push(parseInt(filter));
        })
        return {
            filtersOccur,
            sortedFilters: sortedFiltersInt,
        };
    }

    render() {
        let s = this.sortFilters();
        let filtersOccur = s.filtersOccur;
        let sortedFilters = s.sortedFilters;
        return (
            <TableContainer component={Paper} style={{ height: "300px", overflowY: "scroll" }}>
                <Table stickyHeader>
                    <TableHead>
                        <StyledTableRow>
                            <StyledTableCell size="small">
                                <React.Fragment>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                label="checkAll"
                                                checked={this.state.selectAll}
                                                onClick={(e) => {
                                                    this.props.onCheckAll(!this.state.selectAll);
                                                    this.setState({ selectAll: !this.state.selectAll })
                                                }}
                                                style={{ color: "white" }}
                                            />
                                        }
                                        label={
                                            this.props.checked.length + " / " + sortedFilters.length
                                        }
                                    />
                                    {this.props.checked.length > 0 ?
                                        <IconButton
                                            aria-label="Delete selected filters"
                                            variant="contained"
                                            style={{color:"white"}}
                                            size="small"
                                            onClick={this.props.onRemoveSelectedFilters}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                        : null
                                    }

                                </React.Fragment>
                            </StyledTableCell>
                            <StyledTableCell size="small">Filters selected to fine-tune the model</StyledTableCell>
                            {
                                Object.keys(this.state.selection).map((metric) =>
                                    <StyledTableCell key={"Head_" + metric} align="right">{this.props.metricsList[metric].title.toString().slice(0, 5)}</StyledTableCell>
                                )
                            }
                            <StyledTableCell size="small">Total</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {sortedFilters.map((filter, indexFilter) =>
                            <StyledTableRow key={filter}>
                                <StyledTableCell size="small">
                                    <Checkbox
                                        checked={this.props.checked.includes(filter)}
                                        color="primary"
                                        onClick={(e) => this.props.onCheckFilter(e, filter)}
                                    />
                                </StyledTableCell>
                                <StyledTableCell component="th" scope="row" size="small" align="right">
                                    {filter}
                                </StyledTableCell>
                                {
                                    Object.keys(this.state.selection).map((metric) =>
                                        <StyledTableCell key={"Body_" + metric} align="right" size="small">
                                            {
                                                this.state.selection[metric].includes(filter) ?
                                                    <CheckIcon style={{ color: "green" }} /> :
                                                    <CloseIcon style={{ color: "red" }} />
                                            }
                                        </StyledTableCell>
                                    )
                                }
                                <StyledTableCell size="small">{filtersOccur[filter]}</StyledTableCell>
                            </StyledTableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        )
    }
}