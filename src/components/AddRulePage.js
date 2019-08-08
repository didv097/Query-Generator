import React from 'react';
import {
	Grid,
	Box,
	Paper,
	Typography,
	Button,
	Chip,
	Slider,
	ExpansionPanel,
	ExpansionPanelSummary,
	ExpansionPanelDetails,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	MenuItem,
	Input,
	TextField,
	InputAdornment,
	IconButton,
	Modal
} from '@material-ui/core';
import {
	ExpandMore,
	Search,
	AddCircle,
	RemoveCircle,
	Edit
} from '@material-ui/icons';

import data from '../data.json';
import segCat from '../segment_categories.json';
import segdata from '../segment_list_data.json';

import CountDisplay from './CountDisplay';

const attTypes = [];
const attributes = {};
const filterNames = {};
for (let at in data) {
	attTypes.push(at);
	attributes[at] = [];
	for (let a in data[at]) {
		attributes[at].push(a);
		filterNames[a] = data[at][a].filter_name
	}
}

let prevRuleIndex = 0;
let newRule = {
	index: -1,
	attType: "",
	attribute: "",
	operator: "",
	values: ""
};
const categoryNames = segCat["Segment Category"];
let rulesFromList = [];
let editMode = false;

export default function AddRulePage(props) {
	const [days, setDays] = React.useState(90);
	const [rules, setRules] = React.useState(rulesFromList);
	const [selectedAttType, setAttType] = React.useState("");
	const [selectedAttribute, setAttribute] = React.useState("")
	const [selectedOperator, setOperator] = React.useState("");
	const [searchText, setSearchText] = React.useState("");
	const [values, setValues] = React.useState([]);
	const [selectedValues, setSelectedValues] = React.useState([]);
	const [valueStr, setValueStr] = React.useState("");
	const [modalState, setModalState] = React.useState(0);
	const [freeInput, setFreeInput] = React.useState(false);
	const [segmentName, setSegmentName] = React.useState("");
	const [categoryName, setCategoryName] = React.useState(categoryNames[0]);
	const [description, setDescription] = React.useState("");
	const [selectedFilterName, setFilterName] = React.useState("") // My crap

	const segmentID = Number(props.match.params.id);
	if (segmentID !== undefined && segmentID > 0 && rules.length === 0) {
		editMode = true;
		let segments = segdata["Segments"];
		for (let name in segments) {
			if (segments[name]["id"] === segmentID) {
				for (let att in segments[name]["segment_rules"]) {
					rulesFromList.push({
						index: prevRuleIndex++,
						attType: "Page view attributes",
						attribute: att,
						operator: segments[name]["segment_rules"][att]["operators"][0],
						values: segments[name]["segment_rules"][att]["values"]
					});
				}
				setSegmentName(name);
				setCategoryName(segments[name]["category"]);
				break;
			}
		}
	}

	const daysChanged = (event, d) => {
		setDays(d);
	}
	const expansionChanged = attType => (event, isExpanded) => {
		setAttType(isExpanded ? attType : "");
		setAttribute("");
		setFilterName("");
		setOperator("");
		setSelectedValues([]);
		setSearchText("");
	}
	const attributeItemClicked = (val) => {
		setAttribute(val);
		setFilterName(filterNames[val]);
		setOperator(data[selectedAttType][val]["operators"][0]);
		if (data[selectedAttType][val]["values"].length === 0) {
			setFreeInput(true);
			setValues([]);
			setValueStr("");
		} else {
			setFreeInput(false);
			setValues(data[selectedAttType][val]["values"]);
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
			data[selectedAttType][selectedAttribute]["values"].filter(v => {
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
	}
	const segmentNameChanged = event => {
		setSegmentName(event.target.value);
	}
	const categoryNameChanged = event => {
		setCategoryName(event.target.value);
	}
	const descriptionChanged = event => {
		setDescription(event.target.value)
	}
	const onCancelClicked = () => {
		setModalState(0);
	}
	const addRule = () => {
		newRule = {
			index: prevRuleIndex++,
			attType: selectedAttType,
			filter_name: selectedFilterName,
			attribute: selectedAttribute,
			operator: selectedOperator,
			values: freeInput ? valueStr : selectedValues
		};
		setModalState(1);
	}
	const removeRule = rule => {
		setRules(rules.filter(r => {
			return rule.index !== r.index;
		}))
		setAttType(rule.attType);
		setAttribute(rule.attribute);
		setOperator(rule.operator);
		console.log(typeof(rule.values))
		if (typeof(rule.values) === "string") {
			setFreeInput(true);
			setValueStr(rule.values);
		} else {
			setFreeInput(false);
			setValues(data[rule.attType][rule.attribute]["values"]);
			setSelectedValues(rule.values);
		}
		setSearchText("");
	}
	React.useEffect(() => {
		// Update all states
		// console.log(rules);
	});

	return (
		<Box>
			<Grid
				container
				direction="row"
				justify="center"
				alignItems="flex-start"
			>
				<Grid item xs={10}>
					<Box m={2} mb={5}>
						<Button href="/SegmentsPage">
							<i className="material-icons">file_copy</i>
							Segments
						</Button>
					</Box>
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
									<Chip label={days === 0 ? "No time selected": "Past " + days + " days"} />
									<Grid container spacing={1}>
										<Grid item>
											<Typography variant="caption">0 days</Typography>
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
											<Typography variant="caption">90 days</Typography>
										</Grid>
									</Grid>
								</Box>
								<Box justifyContent="flex-start" m={1}>
									<Typography>DATA</Typography>
									{attTypes.map(attType => (
										<ExpansionPanel key={attType} expanded={selectedAttType === attType} onChange={expansionChanged(attType)}>
											<ExpansionPanelSummary
												expandIcon={<ExpandMore />}
											>
												{attType}
											</ExpansionPanelSummary>
											<ExpansionPanelDetails>
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
											</ExpansionPanelDetails>
										</ExpansionPanel>
									))}
								</Box>
							</Box>
						</Grid>
						<Grid item xs={9} m={1}>
							<Box justifyContent="flex-start" m={1} mb={3}>
								<Typography>RULES</Typography>
								<Paper>
								{rules.length === 0 ? (
									<Box p={4}>
										<Typography style={{textAlign: "center"}}>Rules will appear here after being created in the ADD RULE section below</Typography>
									</Box>
								) : (
									<Box m={1}>
										{rules.map(rule => (
											<Box key={rule.index} m={1} p={0} style={{backgroundColor: "#bbb", display: "inline-block"}}>
												<Typography variant="caption" style={{margin: "0"}}>
													<strong>{rule.attribute + " "}</strong>
													{rule.operator}
													<strong>{" " + rule.values}</strong>
												</Typography>
												<IconButton size="small" style={{margin: "0"}} onClick={() => removeRule(rule)}>
													<Edit />
												</IconButton>
											</Box>
										))}
									</Box>
								)}
									
								</Paper>
							</Box>
							<Box justifyContent="flex-start" m={1}>
								<Typography>ADD RULE</Typography>

								<Paper style={{height: "400px"}}>
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
														>
															{data[selectedAttType][selectedAttribute]["operators"].map(op => (
																<MenuItem key={op} value={op}>
																	<Typography>{op}</Typography>
																</MenuItem>
															))}
														</TextField>
													</Grid>
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
								</Paper>
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
												<i className="material-icons">add</i>
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
												{editMode ? "Update" : "Done"}
											</Button>
										</Box>
									</Grid>
								</Grid>
							</Box>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={2} style={{background: "lightgrey"}}>
					<CountDisplay rules={rules} days={days} />
				</Grid>
			</Grid>
			<Modal
				open={modalState === 1}
			>
				<Paper
					style={{textAlign: "center", width: "400px", position: "absolute", left: "50%", top: "50%", marginLeft: "-200px", marginTop: "-120px"}}
				>
					<Box m={3}>
						<Grid container direction="column">
							<Grid item>
								<Typography style={{margin: "10px"}} variant="h6">Added Rule</Typography>
							</Grid>
							<Grid item>
								<Typography style={{margin: "10px"}}>
									<strong>{newRule.attribute + " "}</strong>
									{newRule.operator}
									<strong>{" " + newRule.values}</strong>
								</Typography>
							</Grid>
							<Grid item>
								<Button style={{margin: "10px", width: "100px"}} variant="contained" onClick={modalOKClicked}>Ok</Button>
							</Grid>
						</Grid>
					</Box>
				</Paper>
			</Modal>
			<Modal
				open={modalState === 2}
			>
				<Paper
					style={{width: "600px", position: "absolute", left: "50%", top: "50%", marginLeft: "-300px", marginTop: "-350px"}}
				>
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
														<strong>{rule.attribute + " "}</strong>
														{rule.operator}
														<strong>{" " + rule.values}</strong>
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
														href="/SegmentsPage"
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
				</Paper>
			</Modal>
		</Box>
  )
};