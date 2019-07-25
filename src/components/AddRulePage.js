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
	TextField,
	IconButton,
	Modal
} from '@material-ui/core';
import {
	ExpandMore,
	Search,
	AddCircle,
	RemoveCircle,
	Edit
} from '@material-ui/icons'

import data from '../data.json'
const attTypes = [];
const attributes = {};
for (let at in data) {
	attTypes.push(at);
	attributes[at] = [];
	for (let a in data[at]) {
		attributes[at].push(a);
	}
}
let prevRuleIndex = 0;
let newRule = {
	index: -1,
	attType: "",
	attribute: "",
	operator: "",
	value: ""
};

export default function AddRulePage() {
	const [days, setDays] = React.useState(90);
	const [rules, setRules] = React.useState([]);
	const [selectedAttType, setAttType] = React.useState("");
	const [selectedAttribute, setAttribute] = React.useState("")
	const [valueStr, setValueStr] = React.useState("");
	const [selectedOperator, setOperator] = React.useState("");
	const [searchText, setSearchText] = React.useState("");
	const [values, setValues] = React.useState([]);
	let [selectedValues, setSelectedValues] = React.useState([]);
	const [modalOpened, setModalOpened] = React.useState(false);
	const [freeInput, setFreeInput] = React.useState(false);

	const daysChanged = (event, d) => {
		setDays(d);
	}
	const expansionChanged = attType => (event, isExpanded) => {
		setAttType(isExpanded ? attType : "");
		setAttribute("");
		setOperator("");
		setSelectedValues([]);
		setSearchText("");
	}
	const attributeItemClicked = (event, val) => {
		setAttribute(val);
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
	const valuePlusClicked = (event, val) => {
		if (selectedValues.indexOf(val) === -1) {
			setSelectedValues([
				...selectedValues, val
			]);
		}
	}
	const valueMinusClicked = (event, val) => {
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
	const modalOKClicked = () => {
		setModalOpened(false);
		setRules([...rules, newRule]);
		setSelectedValues([]);
	}
	
	const addRule = () => {
		newRule = {
			index: prevRuleIndex++,
			attType: selectedAttType,
			attribute: selectedAttribute,
			operator: selectedOperator,
			values: freeInput ? valueStr.replace(/ /g, "").split(",") : selectedValues
		};
		setModalOpened(true);
	}
	const removeRule = (rule) => {
		setRules(rules.filter(r => {
			return rule.index !== r.index;
		}))
		setAttType(rule.attType);
		setAttribute(rule.attribute);
		setOperator(rule.operator);
		if (data[rule.attType][rule.attribute]["values"].length === 0) {
			setFreeInput(true);
			setValueStr(rule.values.join());
		} else {
			setFreeInput(false);
			setSelectedValues(rule.values);
		}
		setSearchText("");
	}
	
	return (
		<Box>
			<Grid
				container
				direction="row"
				justify="center"
				alignItems="flex-start"
			>
				<Grid item xs={10}>
					<Box m={1} mb={5}>
						<Box m={1} display="inline">
							<Button variant="contained" size="small" color="default" href="/SegmentsPage">
								<i className="material-icons">file_copy</i>
								Segments
							</Button>
						</Box>
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
												<List>
													{attributes[attType].map(att => (
														<ListItem
															key={att}
															button
															selected = {selectedAttribute === att}
															onClick = {event => attributeItemClicked(event, att)}
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
								<Paper style={{height: "70px"}}>
								{rules.length === 0 ? (
									<Box p={2}>
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
												<IconButton id="134" size="small" style={{margin: "0"}} onClick={event => removeRule(rule)}>
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
									<Box style={{padding: "140px"}}>
										<Typography variant="h6" style={{textAlign: "center"}}>Select a time frame and data attribute from the left to begin</Typography>
									</Box>
								) : (
									<Box p={2}>
										<Grid container direction="column" spacing={1} m={2}>
											<Grid item xs>
												<Box m={1}>
													<Typography>{selectedAttribute}</Typography>
												</Box>
											</Grid>
											<Grid item>
												<Grid container direction="row" justify="flex-start" alignItems="flex-end">
													<Grid item>
														<Box m={1}>
															<TextField
																id="operator"
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
														</Box>
													</Grid>
													<Grid item>
														<Box justifyContent="flex-start" m={1}>
															<TextField
																id="search"
																value={searchText}
																onChange={searchChanged}
																placeholder="Search values..."
															>
															</TextField>
															<Search />
														</Box>
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
														value={valueStr}
														onChange={valueStrChanged}
														rows="10"
													/>
												</Box>
											) : (
												<Grid container direction="row">
													<Grid item xs={6}>
														<Box style={{maxHeight: "250px", overflow: "auto"}} m={1}>
															<List component="nav">
																{values.map(val => (
																	<ListItem key={val} button>
																		<ListItemText primary={val}></ListItemText>
																		<ListItemSecondaryAction>
																			<IconButton
																				edge="end"
																				onClick={event => valuePlusClicked(event, val)}
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
														<Box style={{maxHeight: "250px", overflow: "auto"}} m={1}>
															<List component="nav">
																{selectedValues.map(val => (
																	<ListItem key={val} button>
																		<ListItemText primary={val}/>
																		<ListItemSecondaryAction>
																			<IconButton
																				edge="end"
																				onClick={event => valueMinusClicked(event, val)}
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
												variant="contained"
												disabled={
													selectedAttribute === "" ||
														selectedOperator === "" ||
														(selectedValues.length === 0 && valueStr === "")
												}
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
												href="/SegmentDetailsPage"
											>
												Done
											</Button>
										</Box>
									</Grid>
								</Grid>
							</Box>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={2}>
					<Box style={{backgroundColor: "gray"}} width="100%" height="700px" position="absolute" p={1}/>
				</Grid>
			</Grid>
			<Modal
				open={modalOpened}
				// onClose={modalClosed}
			>
				<Paper
					style={{textAlign: "center", height: "200px", width: "400px", position: "absolute", left: "50%", top: "50%", marginLeft: "-200px", marginTop: "-100px"}}
				>
					<Box m={5}>
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
		</Box>
  )
}
