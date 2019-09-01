import React from 'react';
import {
	Grid,
	Box,
	Typography,
	Button,
	Chip,
	Slider,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	MenuItem,
	Input,
	TextField,
	InputAdornment,
	IconButton,
	Modal,
	Collapse,
	CircularProgress
} from '@material-ui/core';
import {
	ExpandMore,
	Search,
	AddCircle,
	RemoveCircle,
	Edit,
	ExpandLess,
	Add,
	Home
} from '@material-ui/icons';
import CountDisplay from './CountDisplay';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import attData from '../data.json';
import segCat from '../segment_categories.json';
import io_qo from '../operator.json';
// let qo_io = [], ios = [];
// for (let op in io_qo) {
// 	qo_io[io_qo[op]] = op;
// 	ios.push(op);
// }
// console.log(qo_io)

const attTypes = [];
const attributes = {};
const filterNames = {};
for (let at in attData) {
	attTypes.push(at);
	attributes[at] = [];
	for (let a in attData[at]) {
		attributes[at].push(a);
		filterNames[a] = attData[at][a].filter_name;
	}
}

let prevRuleIndex = 0;
let newRule = {
	index: -1,
	attType: "",
	attribute: "",
	filterName: "",
	operator: "",
	values: ""
};
const categoryNames = segCat["Segment Category"];
let rulesFromList = [];
let editMode = -1; // -1: no, 0: loading, 1: yes

function getAttributeType(att) {
	for (let typ in attTypes) {
		if (attributes[attTypes[typ]].indexOf(att) >= 0) {
			return attTypes[typ];
		}
	}
	console.log(`No such attribute : ${att}`);
	return att;
}

function getAttributeFromFilter(fil) {
	for (let a in filterNames) {
		if (filterNames[a] === fil) {
			return a;
		}
	}
	console.log(`No such filter : ${fil}`);
	return fil;
}

let population = 0;

function getPopulation(rules, days) {
	let qRules = [];
	let qFilter;
	if (rules.length > 0) {
		for (let i in rules) {
			let f_vals;
			f_vals = rules[i].values.map((i) => {
				return `"${i}"`;
			}).join(",");
			if (rules[i].values.length > 1) {
				f_vals = `[${f_vals}]`;
			}
			qRules.push(`${rules[i].filterName}: {${io_qo[rules[i].operator] === undefined ? rules[i].operator : io_qo[rules[i].operator]}: ${f_vals}}`);
		}
		qFilter = `filter: {${qRules.join(",")}}`;
	} else {
		qFilter = `filter: {device_type: {NIN: ""}}`;
	}
	const qDateFilter = `relativeDateRange: ${days}`;
	const qFields = `{uids, pageviews, impressions, visits}`;

	const query_total = `query GetCounts { reportCounts(${qFilter}, ${qDateFilter})${qFields} }`;

	const url = "http://localhost:4000/graphql";
	const opts = {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ query: query_total })
	};
	fetch(url, opts)
		.then(res => res.json())
		.then(res => {
			if (res.errors) {
				console.error(res.errors[0].message);
				return false;
			} else {
				population = res.data.reportCounts.uids;
				return true;
			}
		});
}

const query_segdef = gql(`
	{
		SegmentDefinitions {
			id
			name
			is_active
			category
			rule
			description
			population {
				calculated_on
				calculated_population
			}
		}
	}
`);

export default function AddRulePage(props) {
	const [days, setDays] = React.useState(90);
	const [rules, setRules] = React.useState([]);
	const [selectedAttType, setAttType] = React.useState("");
	const [selectedAttribute, setAttribute] = React.useState("")
	const [selectedOperator, setOperator] = React.useState("");
	const [searchText, setSearchText] = React.useState("");
	const [values, setValues] = React.useState([]);
	const [selectedValues, setSelectedValues] = React.useState([]);
	const [valueStr, setValueStr] = React.useState("");
	const [modalState, setModalState] = React.useState(0);
	const [freeInput, setFreeInput] = React.useState(false);
	const [segmentName, setSegmentName] = React.useState("New Segment");
	const [categoryName, setCategoryName] = React.useState(categoryNames[0]);
	const [description, setDescription] = React.useState("");
	const [selectedFilterName, setFilterName] = React.useState("");

	const segmentID = props.match.params.id;
	if (segmentID !== undefined && editMode < 0) {
		editMode = 0;
	}

	const daysChanged = (event, d) => {
		setDays(d);
	}
	const expansionChanged = attType => {
		setAttType(attType === selectedAttType ? "" : attType);
		setAttribute("");
		setFilterName("");
		setOperator("");
		setSelectedValues([]);
		setSearchText("");
	}
	const attributeItemClicked = (val) => {
		setAttribute(val);
		setFilterName(filterNames[val]);
		setOperator(attData[selectedAttType][val]["operators"][0]);
		if (attData[selectedAttType][val]["values"].length === 0) {
			setFreeInput(true);
			setValues([]);
			setValueStr("");
		} else {
			setFreeInput(false);
			setValues(attData[selectedAttType][val]["values"]);
			setValueStr("");
		}
		setSelectedValues([]);
		setSearchText("");
	}
	const valuePlusClicked = val => {
		if (selectedValues.indexOf(val) === -1) {
			setSelectedValues([
				...selectedValues, val
			]);
		}
	}
	const valueMinusClicked = val => {
		setSelectedValues(selectedValues.filter(v => {
			return val !== v;
		}))
	}
	const operatorChanged = event => {
		setOperator(event.target.value);
	}
	const searchChanged = event => {
		if (freeInput) {
			return;
		}
		const newVal = event.target.value;
		setSearchText(newVal);
		setValues(
			attData[selectedAttType][selectedAttribute]["values"].filter(v => {
				return v.toLowerCase().indexOf(newVal.toLowerCase()) !== -1;
			})
		);
	}
	const valueStrChanged = event => {
		setValueStr(event.target.value);
	}
	const doneClicked = () => {
		setModalState(2);
	}
	const modalOKClicked = () => {
		setModalState(0);
		setRules([...rules, newRule]);
		setSelectedValues([]);
		setValueStr("");
		getPopulation([...rules, newRule], days);
	}
	const segmentNameChanged = event => {
		setSegmentName(event.target.value);
	}
	const categoryNameChanged = event => {
		setCategoryName(event.target.value);
	}
	const descriptionChanged = event => {
		setDescription(event.target.value);
	}
	const onCancelClicked = () => {
		setModalState(0);
	}
	const addRule = () => {
		newRule = {
			index: prevRuleIndex ++,
			attType: selectedAttType,
			filterName: selectedFilterName,
			attribute: selectedAttribute,
			operator: selectedOperator,
			values: freeInput ? valueStr.split(",") : selectedValues
		};
		setModalState(1);
	}
	const removeRule = rule => {
		setRules(rules.filter(r => {
			return rule.index !== r.index;
		}));
		setAttType(rule.attType);
		setAttribute(rule.attribute);
		setFilterName(filterNames[rule.attribute]);
		setOperator(rule.operator);
		if (attData[rule.attType][rule.attribute]["values"].length === 0) {
			setFreeInput(true);
			setValueStr(rule.values.toString());
		} else {
			setFreeInput(false);
			setValues(attData[rule.attType][rule.attribute]["values"]);
			setSelectedValues(rule.values);
		}
		setSearchText("");
		getPopulation(rules.filter(r => {
			return rule.index !== r.index;
		}), days);
	}
	const rulesToString = () => {
		let ret = `{\n`;
		for (const idx in rules) {
			const rule = rules[idx];
			ret += `${rule.filterName}: {
				${io_qo[rule.operator] === undefined ? rule.operator : io_qo[rule.operator]}: `;
			if (rule.values.length > 1) {
				ret += `[`;
			}
			for (const subidx in rule.values) {
				ret += `"${rule.values[subidx]}",`;
			}
			ret = ret.substr(0, ret.length - 1);
			if (rule.values.length > 1) {
				ret += `]`;
			}
			ret += `\n},\n`;
		}
		ret = `${ret.substr(0, ret.length - 1)}\n}`;
		return ret;
	}
	const onSubmitClicked = () => {
		let mutation;
		if (editMode > 0) {
			mutation = `
				mutation UpdateSegment {
					UpdateSegmentDefinitionById(
						id: "${segmentID}",
						name: "${segmentName}",
						category: "${categoryName}",
						subcategory: "",
						description: "${description}",
						seg_def: ${rulesToString()},
						is_active: "Y",
					)
				}
			`;
		} else {
			mutation = `
				mutation CreateSegment {
					CreateSegmentDefinition(
						name: "${segmentName}",
						category: "${categoryName}",
						subcategory: "",
						description: "${description}",
						seg_def: ${rulesToString()},
						population: ${population}
					)
				}
			`;
		}
		console.log(mutation)
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
				console.log(`Submit error : ${e}`);
			})
	}

	React.useEffect(() => {
		// Update all states
		// console.log(rules);
	});

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

			if (editMode === 0) {
				editMode = 1;
				const segments = data.SegmentDefinitions;
				for (let idx in segments) {
					let temp;
					if (segments[idx].id === segmentID) {
						eval(`temp = ${segments[idx].rule}`);
						for (let subidx in temp) {
							const temp1 = getAttributeFromFilter(subidx);
							const temp2 = getAttributeType(temp1);
							for (let op in temp[subidx]) {
								rulesFromList.push({
									index: prevRuleIndex ++,
									attType: temp2,
									attribute: temp1,
									filterName: subidx,
									operator: op,
									values: typeof temp[subidx][op] === "object" ? temp[subidx][op] : new Array(temp[subidx][op]),
								});
							}
						}
						setSegmentName(segments[idx].name);
						setCategoryName(segments[idx].category);
						setDescription(segments[idx].description);
						setRules(rulesFromList);
						getPopulation(rulesFromList, 90);
						break;
					}
				}
				return (
					<Box m={2}>
						<h1>No such segment</h1>
						<Button href="/" variant="outlined">
							<Home />
							Go to home
						</Button>
					</Box>
				);
			}

			return (
				<Box height="100vh">
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
									<Button href="/SegmentsPage">
										<Typography variant="body1" style={{color:"#3399FE"}}>Segments</Typography>
									</Button>
									{editMode > 0 ? (
										<Button href="/">
											<Typography variant="body1" style={{color:"#3399FE"}}>New Segment</Typography>
										</Button>
									) : (null)}
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
						direction="row"
						justify="center"
						alignItems="flex-start"
					>
						<Grid item xs={9}>
							<Grid
								container
								direction="row"
								justify="center"
								alignItems="flex-start"
							>
								<Grid item xs={3}>
									<Box justifyContent="flex-start" m={1}>
										<Box justifyContent="flex-start" m={1} mb={3}>
											<Typography>TIME</Typography>
											<Chip label={days === 0 ? "No time selected": `Past ${days} days`} />
											<Grid container spacing={1}>
												<Grid item>
													<Typography variant="caption" onClick={event => {setDays(0)}}>0 days</Typography>
												</Grid>
												<Grid item xs>
													<Slider
														aria-labelledby="continuous-slider"
														value={days}
														min={0}
														max={90}
														onChange={daysChanged}
													/>
												</Grid>
												<Grid item>
													<Typography variant="caption" onClick={event => {setDays(90)}}>90 days</Typography>
												</Grid>
											</Grid>
										</Box>
										<Box justifyContent="flex-start" m={1}>
											<Typography>DATA</Typography>
												<List style={{maxHeight: 500, overflow: "auto", borderStyle: "solid", borderColor: "lightgray", borderWidth: 1}}>
													{attTypes.map(attType => (
														<Box key={attType}>
															<ListItem button onClick={event => expansionChanged(attType)} style={{width: "100%", background: "lightgrey"}}>
																<ListItemText primary={attType} />
																{selectedAttType === attType ? <ExpandLess /> : <ExpandMore />}
															</ListItem>
															<Collapse in={selectedAttType === attType} timeout="auto" unmountOnExit>
																<List style={{width: "100%"}}>
																	{attributes[attType].map(att => (
																		<ListItem
																			key={att}
																			button
																			selected = {selectedAttribute === att}
																			onClick = {event => attributeItemClicked(att)}
																		>
																			{att}
																		</ListItem>
																	))}
																</List>
															</Collapse>
														</Box>
													))}
												</List>
										</Box>
									</Box>
								</Grid>
								<Grid item xs={9} m={1}>
									<Box justifyContent="flex-start" m={1} mb={3}>
										<Typography>RULES</Typography>
										<Box style={{borderStyle: "solid", borderWidth: 1, borderColor: "lightgray"}}>
											{rules.length === 0 ? (
												<Box p={4}>
													<Typography style={{textAlign: "center"}}>Rules will appear here after being created in the ADD RULE section below</Typography>
												</Box>
											) : (
												<Box m={1}>
													{rules.map(rule => (
														<Box key={rule.index} m={1} p={0} style={{backgroundColor: "#bbb", display: "inline-block"}}>
															<Typography variant="caption" style={{margin: "0"}}>
																<strong>{rule.attribute}</strong>
																{` ${rule.operator} `}
																<strong>{rule.values.toString()}</strong>
															</Typography>
															<IconButton size="small" style={{margin: "0"}} onClick={() => removeRule(rule)}>
																<Edit />
															</IconButton>
														</Box>
													))}
												</Box>
											)}
										</Box>
									</Box>
									<Box justifyContent="flex-start" m={1}>
										<Typography>ADD RULE</Typography>

										<Box style={{borderStyle: "solid", borderWidth: 1, borderColor: "lightgray", height: 400}}>
											{days === 0 || selectedAttribute === "" ? (
												<Box style={{padding: "40px", paddingTop: "170px"}}>
													<Typography variant="h6" style={{textAlign: "center"}}>Select a time frame and data attribute from the left to begin</Typography>
												</Box>
											) : (
												<Box p={2} m={2}>
													<Grid container direction="column" spacing={1}>
														<Grid item xs>
															<Typography>{selectedAttribute}</Typography>
														</Grid>
														<Grid item>
															<Grid
																container
																direction="row"
																justify="flex-start"
																alignItems="flex-end"
																spacing={1}
															>
																<Grid item>
																	<TextField
																		select
																		value={selectedOperator}
																		onChange={operatorChanged}
																		style={{width: 120}}
																	>
																		{attData[selectedAttType][selectedAttribute]["operators"].map(op => (
																			<MenuItem key={op} value={op}>
																				<Typography>{op}</Typography>
																			</MenuItem>
																		))}
																	</TextField>
																</Grid>
																{
																	freeInput ? null : (
																		<Grid item>
																			<Input
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
																	)
																}
															</Grid>
														</Grid>
														<Grid item>
														{freeInput ? (
															<Box style={{width: "100%", height: "100%"}}>
																<TextField
																	fullWidth
																	multiline
																	variant="outlined"
																	placeholder="Enter your comma separated list of values here ..."
																	value={valueStr}
																	onChange={valueStrChanged}
																	rows="12"
																/>
															</Box>
														) : (
															<Grid container direction="row">
																<Grid item xs={6}>
																	<Box style={{maxHeight: "250px", overflow: "auto"}}>
																		<List component="nav">
																			{values.map(val => (
																				<ListItem key={val} button>
																					<ListItemText primary={val} />
																					<ListItemSecondaryAction>
																						<IconButton
																							edge="end"
																							onClick={event => valuePlusClicked(val)}
																						>
																							<AddCircle />
																						</IconButton>
																					</ListItemSecondaryAction>
																				</ListItem>
																			))}
																		</List>
																	</Box>
																</Grid>
																<Grid item xs={6}>
																	<Box style={{maxHeight: "250px", overflow: "auto"}}>
																		<List component="nav">
																			{selectedValues.map(val => (
																				<ListItem key={val} button>
																					<ListItemText primary={val}/>
																					<ListItemSecondaryAction>
																						<IconButton
																							edge="end"
																							onClick={event => valueMinusClicked(val)}
																						>
																							<RemoveCircle />
																						</IconButton>
																					</ListItemSecondaryAction>
																				</ListItem>
																			))}
																		</List>
																	</Box>
																</Grid>
															</Grid>
														)}
														</Grid>
													</Grid>
												</Box>
											)}
										</Box>
									</Box>
									<Box justifyContent="flex-start" m={1}>
										<Grid
											container
											direction="row"
											justify="flex-end"
											alignContent="flex-end"
										>
											<Grid item>
												<Box m={1}>
													<Button
														variant="outlined"
														color="primary"
														disabled={
															selectedAttribute === "" ||
															selectedOperator === "" ||
															(selectedValues.length === 0 && valueStr === "")
														}
														style={{width: "150px"}}
														onClick={addRule}
													>
														<Add />
														Add Rule
													</Button>
												</Box>
											</Grid>
											<Grid item>
												<Box m={1}>
													<Button
														variant="contained"
														color="primary"
														disabled={rules.length === 0}
														style={{width: "150px"}}
														onClick={doneClicked}
													>
														{editMode > 0 ? "Update" : "Done"}
													</Button>
												</Box>
											</Grid>
										</Grid>
									</Box>
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={3} style={{background: "lightgrey"}}>
							<CountDisplay rules={rules} days={days} segName={segmentName} description={description} />
						</Grid>
					</Grid>
					<Modal
						open={modalState === 1}
					>
						<Box
							style={{borderStyle: "solid", borderWidth: 1, borderColor: "lightgray", textAlign: "center", width: "400px", position: "absolute", left: "50%", top: "50%", marginLeft: "-200px", marginTop: "-120px", background: "white"}}
						>
							<Box m={3}>
								<Grid container direction="column">
									<Grid item>
										<Typography style={{margin: "10px"}} variant="h6">Added Rule</Typography>
									</Grid>
									<Grid item>
										<Typography style={{margin: "10px"}}>
											<strong>{newRule.attribute}</strong>
											{` ${newRule.operator} `}
											<strong>{newRule.values.toString()}</strong>
										</Typography>
									</Grid>
									<Grid item>
										<Button style={{margin: "10px", width: "100px"}} variant="contained" onClick={modalOKClicked}>Ok</Button>
									</Grid>
								</Grid>
							</Box>
						</Box>
					</Modal>
					<Modal
						open={modalState === 2}
					>
						<Box style={{borderStyle: "solid", borderWidth: 1, borderColor: "lightgray", width: "600px", position: "absolute", left: "50%", top: "50%", marginLeft: "-300px", marginTop: "-350px", background: "white"}}>
							<Box m={3}>
								<Grid
									container
									direction="column"
									spacing={2}
								>
									<Grid item>
										<Box style={{maxWidth: "500px"}} m="auto">
											<Grid
												container
												direction="column"
												justify="flex-start"
												alignItems="flex-start"
												spacing={3}
											>
												<Grid item>
													<Typography variant="h6">SEGMENT DETAILS</Typography>
												</Grid>
												<Grid item style={{width: "100%"}}>
													<Typography>Name segment</Typography>
													<Input
														fullWidth
														value={segmentName}
														onChange={segmentNameChanged}
													/>
												</Grid>
												<Grid item style={{width: "100%"}}>
													<Typography style={{marginBottom: "8px"}}>Category name</Typography>
													<TextField
														select
														value={categoryName}
														onChange={categoryNameChanged}
														style={{width: "200px"}}
													>
														{categoryNames.map(cat => (
															<MenuItem key={cat} value={cat}>
																<Typography>{cat}</Typography>
															</MenuItem>
														))}
													</TextField>
												</Grid>
												<Grid item style={{width: "100%"}}>
													<Typography>Description</Typography>
													<TextField
														fullWidth
														multiline
														variant="outlined"
														value={description}
														onChange={descriptionChanged}
														rows={5}
													/>
												</Grid>
												<Grid item style={{width: "100%"}}>
													<Typography>RULES</Typography>
													{rules.map(rule => (
														<Box key={rule.index} m={1} p={0} style={{backgroundColor: "#bbb", display: "inline-block"}}>
															<Typography variant="caption" style={{margin: "0"}}>
																<strong>{rule.attribute}</strong>
																{` ${rule.operator} `}
																<strong>{rule.values.toString()}</strong>
															</Typography>
														</Box>
													))}
												</Grid>
												<Grid item style={{width: "100%", marginTop: "20px"}}>
													<Grid
														container
														direction="row"
														justify="flex-end"
														alignContent="flex-end"
														spacing={2}
													>
														<Grid item>
															<Button
																variant="outlined"
																onClick={onCancelClicked}
																style={{width: "120px"}}
															>
																Cancel
															</Button>
														</Grid>
														<Grid item>
															<Button
																variant="contained"
																color="primary"
																style={{width: "120px"}}
																onClick={onSubmitClicked}
															>
																Submit
															</Button>
														</Grid>
													</Grid>
												</Grid>
											</Grid>
										</Box>
									</Grid>
								</Grid>
							</Box>
						</Box>
					</Modal>
				</Box>
			);
		}}
		</Query>
  )
};
