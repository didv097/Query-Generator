import React from 'react';
import {
	Grid,
	Button,
	Box,
	Chip,
	Typography,
	Slider,
	ExpansionPanel,
	ExpansionPanelSummary,
	ExpansionPanelDetails,
	List,
	ListItem,
	Paper,
	MenuItem,
	TextField,
	ListItemText,
	ListItemSecondaryAction,
	IconButton
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SearchIcon from '@material-ui/icons/Search';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import EditIcon from '@material-ui/icons/Edit';

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

export default function AddRulePage() {

	const [days, setDays] = React.useState(0);
	const [rules, setRules] = React.useState([]);
	const [selectedAttType, setAttType] = React.useState("");
	const [selectedAttribute, setAttribute] = React.useState("")
	const [selectedOperator, setOperator] = React.useState("");
	const [searchText, setSearchText] = React.useState("");
	const [addedValues, setAddedValues] = React.useState("");
	
	const daysChanged = (event, d) => {
		setDays(d);
	}
	const expansionChange = attType => (event, isExpanded) => {
		setAttType(isExpanded ? attType : "");
		setAttribute("");
		setOperator("");
		setAddedValues([]);
		setSearchText("");
	}
	const attributeItemClick = (event, val) => {
		setAttribute(val);
		setOperator("");
		setAddedValues([]);
		setSearchText("");
	}
	const valuePlusClick = (event, val) => {
		if (addedValues.indexOf(val) === -1) {
			setAddedValues([
				...addedValues, val
			]);
		}
		setSearchText("");
	}
	const valueMinusClick = (event, val) => {
		setAddedValues(addedValues.filter(v => {
			return val !== v;
		}))
		setSearchText("");
	}
	const operatorChanged = event => {
		setOperator(event.target.value);
	}
	const searchChanged = event => {
		const newVal = event.target.value;
		setSearchText(newVal);
		// if (newVal === "") {
		// 	return;
		// }
		setAddedValues(
			data[selectedAttType][selectedAttribute]["values"].filter(v => {
				return newVal === "" ? false : v.toLowerCase().indexOf(newVal.toLowerCase()) !== -1;
			})
		);
	}
	
	const addRule = () => {
		const newRule = {
			attType: selectedAttType,
			attribute: selectedAttribute,
			operator: selectedOperator,
			values: addedValues
		};
		if (rules.filter(r => {
			return r.attribute === selectedAttribute;
		}).length === 0) {
			setRules([...rules, newRule]);
		}
	}
	const removeRule = (rule) => {
		setRules(rules.filter(r => {
			return rule.attType !== r.attType || rule.attribute !== r.attribute || rule.operator !== r.operator;
		}))
		setAttType(rule.attType);
		setAttribute(rule.attribute);
		setOperator(rule.operator);
		setAddedValues(rule.values);
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
							<Button variant="contained" size="small" color="default">
								<i className="material-icons">file_copy</i>
								Segments
							</Button>
						</Box>
						<Box m={1} display="inline">
							<Button variant="contained" size="small" color="default">
								<i className="material-icons">add</i>
								New segment
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
										<ExpansionPanel key={attType} expanded={selectedAttType === attType} onChange={expansionChange(attType)}>
											<ExpansionPanelSummary
												expandIcon={<ExpandMoreIcon />}
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
															onClick = {event => attributeItemClick(event, att)}
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
											<Box key={rule.attribute} m={1} p={0} style={{backgroundColor: "#bbb", display: "inline-block"}}>
												<Typography variant="caption" style={{margin: "0"}}>
													{rule.attribute + " " + rule.operator + " " + rule.values}
												</Typography>
												<IconButton id="134" size="small" style={{margin: "0"}} onClick={event => removeRule(rule)}>
													<EditIcon/>
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
															<SearchIcon/>
														</Box>
													</Grid>
												</Grid>
											</Grid>
											<Grid item>
												<Grid container direction="row">
													<Grid item xs={6}>
														<Box m={1}>
															<List component="nav">
																{data[selectedAttType][selectedAttribute]["values"].map(val => (
																	<ListItem key={val} button>
																		<ListItemText primary={val}></ListItemText>
																		<ListItemSecondaryAction>
																			<IconButton
																				edge="end"
																				onClick={event => valuePlusClick(event, val)}
																			>
																				<AddCircleIcon/>
																			</IconButton>
																		</ListItemSecondaryAction>
																	</ListItem>
																))}
															</List>
														</Box>
													</Grid>
													<Grid item xs={6}>
														<Box m={1}>
															<List component="nav">
																{addedValues.map(val => (
																	<ListItem key={val} button>
																		<ListItemText primary={val}/>
																		<ListItemSecondaryAction>
																			<IconButton
																				edge="end"
																				onClick={event => valueMinusClick(event, val)}
																			>
																				<RemoveCircleIcon/>
																			</IconButton>
																		</ListItemSecondaryAction>
																	</ListItem>
																))}
															</List>
														</Box>
													</Grid>
												</Grid>
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
												disabled={selectedAttribute === "" || selectedOperator === "" || addedValues.length === 0}
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
												disabled
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
		</Box>
  )
}
