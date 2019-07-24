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

import data from '../data.json'
let attributes = [];
for (let k in data) attributes.push(k)

export default function AddRulePage() {
	const dataTypes = ["User attributes", "Page view attributes", "Impression attributes"];
	const [expanded, setExpanded] = React.useState(false);
	const [rules, setRules] = React.useState([]);
	const [selectedAttribute, setAttribute] = React.useState("City")
	const [selectedOperator, setOperator] = React.useState("");
	const [searchText, setSearchText] = React.useState("");
	const [selectedValue, setValue] = React.useState("");

	const expansionChange = panel => (event, isExpanded) => {
		setExpanded(isExpanded ? panel : false);
	}
	const attributeItemClick = (event, val) => {
		setAttribute(val);
	}
	const valueItemClick = (event, val) => {
		setValue(val);
	}
	const valuePlusClick = (event, val) => {
		setValue(val);
	}
	const operatorChanged = event => {
		setOperator(event.target.value);
	}
	const searchChanged = event => {
		setSearchText(event.target.value);
	}

	const addRule = (att, value) => {
		setRules([
			...rules, 
			{
				id: rules.length, 
				value: {
					att: att,
					value: value
				}
			}
		]);
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
									<Chip label="No time selected" />
									<Grid container spacing={1}>
										<Grid item>
											<Typography variant="caption">0 days</Typography>
										</Grid>
										<Grid item xs>
											<Slider
												aria-labelledby="continuous-slider"
												min={0}
												max={90}
											/>
										</Grid>
										<Grid item>
											<Typography variant="caption">90 days</Typography>
										</Grid>
									</Grid>
								</Box>
								<Box justifyContent="flex-start" m={1}>
									<Typography>DATA</Typography>
									{dataTypes.map(dataType => (
										<ExpansionPanel expanded={expanded === dataType} onChange={expansionChange(dataType)}>
											<ExpansionPanelSummary
												expandIcon={<ExpandMoreIcon />}
											>
												{dataType}
											</ExpansionPanelSummary>
											<ExpansionPanelDetails>
												<List>
													{attributes.map(att => (
														<ListItem
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
								<Paper>
									<Box p={2}>
										<Typography>Rules will appear here after being created in the ADD RULE section below</Typography>
									</Box>
								</Paper>
							</Box>
							<Box justifyContent="flex-start" m={1}>
								<Typography>ADD RULE</Typography>
								<Paper>
									<Box p={2}>
										<Grid container direction="column" spacing={1} m={2}>
											<Grid item xs>
												<div>
													<Typography>City</Typography>
												</div>
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
																{data[selectedAttribute]["operators"].map(op => (
																	<MenuItem value={op}>
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
																{data[selectedAttribute]["values"].map(val => (
																	<ListItem
																		button
																		selected={selectedValue === val}
																		onClick={event => valueItemClick(event, val)}
																	>
																		<ListItemText primary={val}></ListItemText>
																		<ListItemSecondaryAction>
																			<IconButton
																				edge="end"
																				onClick={event => valuePlusClick(event, val)}
																			>
																				<AddCircleIcon></AddCircleIcon>
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
																
															</List>
														</Box>
													</Grid>
												</Grid>
											</Grid>
										</Grid>
									</Box>
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
											>
												<i className="material-icons">add</i>
												Add Rule
											</Button>
										</Box>
									</Grid>
									<Grid item>
										<Box m={1}>
											<Button variant="contained" color="primary">Done</Button>
										</Box>
									</Grid>
								</Grid>
							</Box>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={2}>
					<h1>33333</h1>
				</Grid>
			</Grid>
		</Box>
  )
}
