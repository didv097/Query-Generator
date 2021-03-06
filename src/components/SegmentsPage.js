import React from 'react'
import {
	Box,
	Grid,
	Button,
	IconButton,
	Input,
	InputAdornment,
	Typography,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	TableSortLabel,
	Popover,
	Modal,
	List,
	ListItem,
	ListItemIcon,
	CircularProgress
} from '@material-ui/core';
import {
	Search,
	MoreVert,
	GetApp,
	Edit,
	Delete
} from '@material-ui/icons';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import attData from '../data.json';

let segments = [];
let rulIdx = 0;
let loadingData = true;

const filterNames = {};
for (let at in attData) {
	for (let a in attData[at]) {
		filterNames[a] = attData[at][a].filter_name;
	}
}

const query_segdef = gql(`
	{
		SegmentDefinitions {
			id
			name
			category
			rule
			population {
				calculated_on
				calculated_population
			}
			modified_on
		}
	}
`);

function getAttributeFromFilter(fil) {
	for (let a in filterNames) {
		if (filterNames[a] === fil) {
			return a;
		}
	}
	console.log(`No such filter : ${fil}`);
	return fil;
}

function getRulesFromSegment(s) {
	let rul = [];
	let temp;
	eval(`temp = ${s.rule}`);
	for (let subidx in temp) {
		const temp1 = getAttributeFromFilter(subidx);
		for (let op in temp[subidx]) {
			rul.push({
				index: ++ rulIdx,
				attribute: temp1,
				filterName: subidx,
				operator: op,
				values: typeof temp[subidx][op] === "object" ? temp[subidx][op] : new Array(temp[subidx][op])
			});
		}
	}
	return rul;
}

export default function SegmentsPage() {
	const [searchText, setSearchText] = React.useState("");
	const [anchorEl, setAnchorEl] = React.useState(null);
	const [searchResults, setSearchResults] = React.useState(segments);
	const [currentRules, setCurrentRules] = React.useState(null);
	const [selectedID, setSelectedID] = React.useState(null);
	const [sortBy, setSortBy] = React.useState("");
	const [sortDirection, setSortDirection] = React.useState("asc");
	const tableFields = ["Name", "Rules", "Last modified", "Population", "Category"];

	const searchChanged = event => {
		const val = event.target.value;
		setSearchText(val);
		setSearchResults(segments.filter(seg => {
			return seg.name.toLowerCase().indexOf(val.toLowerCase()) !== -1;
		}));
		setSortBy("");
	}
	const moreClicked = (event, segID) => {
		setAnchorEl(event.currentTarget);
		setSelectedID(segID);
	}
	const popClosed = () => {
		setAnchorEl(null);
	}
	const formatDate = ds => {
		return ds.substr(0, 19);
	}
	const formatPopulation = p => {
		if (p >= 1000000000) {
			return `${Math.floor(p / 100000000)/10}b`;
		} else if (p >= 1000000) {
			return `${Math.floor(p / 100000)/10}m`;
		} else if (p >= 1000) {
			return `${Math.floor(p / 100)/10}k`;
		}
		return p;
	}
	const exportCSVClicked = () => {
		setAnchorEl(null);
	}
	const editSegmentClicked = (id) => {
		window.location.href = `/edit/${id}`;
	}
	const deleteSegmentClicked = (id) => {
		const mutation = `
			mutation DeleteSegment {
				DeleteSegmentDefinitionById(
					id: "${id}"
				)
			}
		`;
		const url = "http://localhost:4000/graphql";
		const opts = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ query: mutation })
		};
		fetch(url, opts)
			.then(() => {
				window.location.href = "/SegmentsPage";
			})
			.catch(e => {
				console.error(`Delete error : ${e}`);
			})
	}
	const viewAllRules = (rules) => {
		setCurrentRules(rules);
	}
	const modalClose = () => {
		setCurrentRules(null);
	}
	const sort = col => {
		if (col === "" || col === null) {
			return;
		}
		let newDir = "asc";
		if (sortBy === col) {
			newDir = sortDirection === "asc" ? "desc" : "asc";
			setSortDirection(newDir);
		} else {
			setSortBy(col);
			setSortDirection("asc");
		}
		if (col === "Name") {
			searchResults.sort((a, b) => {
				const ret = a.name.localeCompare(b.name);
				return newDir === "asc" ? ret : -ret;
			});
		} else if (col === "Rules") {
			searchResults.sort((a, b) => {
				const ret = a.rules.length - b.rules.length;
				return newDir === "asc" ? ret : -ret;
			});
		} else if (col === "Last modified") {
			searchResults.sort((a, b) => {
				const ret = a.modified_on.localeCompare(b.last_modified);
				return newDir === "asc" ? ret : -ret;
			});
		} else if (col === "Population") {
			searchResults.sort((a, b) => {
				const ret = a.population - b.population;
				return newDir === "asc" ? ret : -ret;
			});
		} else if (col === "Category") {
			searchResults.sort((a, b) => {
				const ret = a.category.localeCompare(b.category);
				return newDir === "asc" ? ret : -ret;
			});
		}
	}

	return (
		<Query query={query_segdef}>
		{({ loading, error, data }) => {
			if (loading) {
				return (
					<div>
						<div style={{margin: "auto", height: 40, width: 40, marginTop: 300, marginBottom: 16}}>
							<CircularProgress style={{margin: "auto"}} />
						</div>
						<Typography align="center">Loading ...</Typography>
					</div>
				);
			}
			if (error) {
				return (
					<div style={{marginTop: 350}}>
						<Typography align="center">Error</Typography>
					</div>
				)
			}

			if (loadingData) {
				segments = data.SegmentDefinitions;
				for (let idx in segments) {
					segments[idx].rules = getRulesFromSegment(segments[idx]);
					segments[idx].last_modified = segments[idx].modified_on;
					segments[idx].population = Number(segments[idx].population.calculated_population);
				}
				setSearchResults(segments);
				loadingData = false;
			}
			return (
				<Box>
					<Grid
						container
						direction="row"
						justify="space-between"
						alignItems="flex-start"
						style={{backgroundColor: "#003466", height: "150px"}}
					>
						<Grid item>
							<Grid
								container
								direction="column"
								justify="space-between"
								alignItems="flex-start"
								style={{height: "150px"}}
							>
								<Grid item>
									<Typography variant="h1" style={{color:"#3399FE"}}>ADC</Typography>
								</Grid>
								<Grid item>
									<Button href="/">
										<Typography variant="body1" style={{color:"#3399FE"}}>New Segment</Typography>
									</Button>
								</Grid>
							</Grid>
						</Grid>
						<Grid item>
							<Button>
								<Typography variant="body2" style={{color:"#3399FE"}}>Logout</Typography>
							</Button>
						</Grid>
					</Grid>
					<Grid
						container
						direction="column"
						justify="flex-start"
						alignItems="flex-start"
						style={{padding: "16px"}}
					>
						<Grid item style={{marginBottom: "16px"}}>
							<Typography variant="h6">Segments</Typography>
						</Grid>
						<Grid item style={{marginBottom: "16px"}}>
							<Input
								id="search"
								value={searchText}
								onChange={searchChanged}
								placeholder="Search values..."
								endAdornment={
									<InputAdornment position="end">
										<Search/>
									</InputAdornment>
								}
							/>
						</Grid>
						<Grid item>
							<Table>
								<TableHead>
									<TableRow>
									{
										tableFields.map(field => (
											<TableCell key={field} align="left">
												<TableSortLabel
													active={sortBy === field}
													direction={sortDirection}
													onClick={event => sort(field)}
												>
													{field}
												</TableSortLabel>
											</TableCell>
										))
									}
										<TableCell></TableCell>
										<TableCell></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{searchResults.map(seg => (
										<TableRow key={seg.id}>
											<TableCell align="left">{seg.name}</TableCell>
											<TableCell align="left">
												{
													(seg.rules.length === 1) ? (
														<Typography variant="caption">
															<strong>{seg.rules[0].attribute}</strong>
															{` ${seg.rules[0].operator} `}
															<strong>{seg.rules[0].values.toString()}</strong>
														</Typography>
													) : (
														<Grid
															container
															direction="column"
														>
															<Typography variant="caption">
																<strong>{seg.rules[0].attribute}</strong>
																{` ${seg.rules[0].operator} `}
																<strong>{seg.rules[0].values.toString()}</strong>
																+{seg.rules.length - 1} other values
															</Typography>
															<Button
																variant="outlined"
																size="small"
																style={{padding: "0"}}
																onClick={event => viewAllRules(seg.rules)}
															>
																<Typography variant="caption">
																	View all rules
																</Typography>
															</Button>
														</Grid>
													)
												}
											</TableCell>
											<TableCell align="left">{formatDate(seg.last_modified)}</TableCell>
											<TableCell align="left">{formatPopulation(seg.population)}</TableCell>
											<TableCell align="left">{seg.category}</TableCell>
											<TableCell>
												<IconButton onClick={event => moreClicked(event, seg.id)}>
													<MoreVert/>
												</IconButton>
											</TableCell>
											<TableCell><Button variant="outlined">Publish to DFP</Button></TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Grid>
					</Grid>

					<Popover
						open={Boolean(anchorEl)}
						anchorEl={anchorEl}
						onClose={popClosed}
					>
					{selectedID === null ? null : (
						<Box style={{borderStyle: "solid", borderWidth: 1, borderColor: "lightgray"}}>
							<List>
								<ListItem button onClick={exportCSVClicked}>
									<ListItemIcon>
										<GetApp/>
									</ListItemIcon>
									<Typography variant="body2">Export .CSV</Typography>
								</ListItem>
								<ListItem button onClick={event => editSegmentClicked(selectedID)}>
									<ListItemIcon>
										<Edit/>
									</ListItemIcon>
									<Typography variant="body2">Edit segment</Typography>
								</ListItem>
								<ListItem button onClick={event => deleteSegmentClicked(selectedID)}>
									<ListItemIcon>
										<Delete/>
									</ListItemIcon>
									<Typography variant="body2">Delete segment</Typography>
								</ListItem>
							</List>
						</Box>
					)}		
					</Popover>

					<Modal
						open={currentRules !== null}
						onClose={modalClose}
					>
						<Box style={{borderStyle: "solid", borderWidth: 1, borderColor: "lightgray", textAlign: "center", width: "400px", position: "absolute", left: "50%", top: "50%", padding: "16px", marginLeft: "-200px", marginTop: "-100px", background: "white"}}>
							{currentRules === null ? (<Typography>No rules</Typography>) : (
								currentRules.map(rule => (
									<Typography key={rule.index} variant="caption">
										<strong>{rule.attribute}</strong>
										{` ${rule.operator} `}
										<strong>{rule.values.toString()}</strong>
										<br/>
									</Typography>
								))
							)}
						</Box>
					</Modal>
				</Box>
			);
		}}
		</Query>
	)
}
