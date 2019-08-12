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
	Paper,
	Modal,
	List,
	ListItem,
	ListItemIcon,
	Link
} from '@material-ui/core';
import {
	Search,
	MoreVert,
	GetApp,
	Edit,
	Delete
} from '@material-ui/icons';
import segdata from '../segment_list_data.json';

let segments = segdata["Segments"];
let segmentNames = [];
for (let name in segments) {
	segmentNames.push(name);
}
let rules;

export default function SegmentsPage() {
	const [searchText, setSearchText] = React.useState("");
	const [anchorEl, setAnchorEl] = React.useState(null);
	const [searchResults, setSearchResults] = React.useState(segmentNames);
	const [currentSegment, setCurrentSegment] = React.useState(null);
	const [editID, setEditID] = React.useState(null);
	const [sortBy, setSortBy] = React.useState("");
	const [sortDirection, setSortDirection] = React.useState("asc");
	const tableFields = ["Name", "Rules", "Last modified", "Population", "Category"];

	const searchChanged = event => {
		const val = event.target.value;
		setSearchText(val);
		setSearchResults(segmentNames.filter(name => {
			return name.toLowerCase().indexOf(val.toLowerCase()) !== -1;
		}));
		setSortBy("");
	}
	const moreClicked = (event, segID) => {
		setAnchorEl(event.currentTarget);
		setEditID(segID);
	}
	const popClosed = () => {
		setAnchorEl(null);
	}
	const formatDate = ds => {
		const monStr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		return monStr[parseInt(ds.slice(5, 7)) - 1] + " " + ds.slice(8, 10) + ", " + ds.slice(0, 4);
	}
	const formatPopulation = p => {
		if (p >= 1000000000) {
			return Math.floor(p / 100000000)/10 + "b";
		} else if (p >= 1000000) {
			return Math.floor(p / 100000)/10 + "m";
		} else if (p >= 1000) {
			return Math.floor(p / 100)/10 + "k";
		}
		return p;
	}
	const exportCSVClicked = () => {
		setAnchorEl(null);
	}
	const deleteSegmentClicked = () => {
		setAnchorEl(null);
	}
	const viewAllRules = (segName) => {
		setCurrentSegment(segName)
	}
	const modalClose = () => {
		setCurrentSegment(null);
	}
	const sort = col => {
		if (col === "" || col === null) {
			return;
		}
		let newDir = "asc";
		if (sortBy === col) {
			newDir = sortDirection === "asc" ? "desc" : "asc"
			setSortDirection(newDir);
		} else {
			setSortBy(col);
			setSortDirection("asc");
		}
		if (col === "Name") {
			searchResults.sort((a, b) => {
				const ret = a.localeCompare(b);
				return newDir === "asc" ? ret : -ret;
			});
		} else if (col === "Rules") {
			searchResults.sort((a, b) => {
				const ret = Object.keys(segments[a]["segment_rules"]).length - Object.keys(segments[b]["segment_rules"]).length;
				return newDir === "asc" ? ret : -ret;
			});
		} else if (col === "Last modified") {
			searchResults.sort((a, b) => {
				const ret = segments[a]["last-modified"].localeCompare(segments[b]["last-modified"]);
				return newDir === "asc" ? ret : -ret;
			});
		} else if (col === "Population") {
			searchResults.sort((a, b) => {
				const ret = segments[a]["population"] - segments[b]["population"];
				return newDir === "asc" ? ret : -ret;
			});
		} else if (col === "Category") {
			searchResults.sort((a, b) => {
				const ret = segments[a]["category"].localeCompare(segments[b]["category"]);
				return newDir === "asc" ? ret : -ret;
			});
		}
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
				spacing={5}
				style={{margin: "0px"}}
			>
				<Grid item>
					<Grid
						container
						direction="column"
						justify="flex-start"
						alignItems="flex-start"
						spacing={1}
					>
						<Grid item>
							<Typography variant="h6">Segments</Typography>
						</Grid>
						<Grid item>
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
					</Grid>
				</Grid>
				<Grid item style={{width: "100%"}} >
					<Table>
						<TableHead>
							<TableRow>
								{tableFields.map(field => (
									<TableCell key={field} align="left">
										<TableSortLabel
											active={sortBy === field}
											direction={sortDirection}
											onClick={event => sort(field)}
										>
											{field}
										</TableSortLabel>
									</TableCell>
								))}
								
								<TableCell></TableCell>
								<TableCell></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{searchResults.map(segName => (
								<TableRow key={segName}>
									<TableCell align="left">{segName}</TableCell>
									<TableCell align="left">
										{
											(rules = Object.getOwnPropertyNames(segments[segName]["segment_rules"]), rules.length === 1) ? (
												<Typography variant="caption">
													<strong>{rules[0] + " "}</strong>
													{segments[segName]["segment_rules"][rules[0]]["operators"]}
													<strong>{" " + segments[segName]["segment_rules"][rules[0]]["values"]}</strong>
												</Typography>
											) : (
												<Grid
													container
													direction="column"
												 >
													<Typography variant="caption">
														<strong>{rules[0] + " "}</strong>
														{segments[segName]["segment_rules"][rules[0]]["operators"]}
														<strong>{" " + segments[segName]["segment_rules"][rules[0]]["values"]}</strong>
														+{rules.length - 1} other values
													</Typography>
													<Button
														variant="outlined"
														size="small"
														style={{padding: "0"}}
														onClick={event => viewAllRules(segName)}
													>
														<Typography variant="caption">
															View all rules
														</Typography>
													</Button>
												</Grid>
											)
										}
									</TableCell>
									<TableCell align="left">{formatDate(segments[segName]["last-modified"])}</TableCell>
									<TableCell align="left">{formatPopulation(segments[segName]["population"])}</TableCell>
									<TableCell align="left">{segments[segName]["category"]}</TableCell>
									<TableCell>
										<IconButton onClick={event => moreClicked(event, segments[segName]["id"])}>
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
			{editID === null ? null : (
				<Paper>
					<List>
						<ListItem button onClick={exportCSVClicked}>
							<ListItemIcon>
								<GetApp/>
							</ListItemIcon>
							Export .CSV
						</ListItem>
						<ListItem button component={Link} href={"/edit/" + editID}>
							<ListItemIcon>
								<Edit/>
							</ListItemIcon>
							Edit segment
						</ListItem>
						<ListItem button onClick={deleteSegmentClicked}>
							<ListItemIcon>
								<Delete/>
							</ListItemIcon>
							Delete segment
						</ListItem>
					</List>
				</Paper>
			)}
				
			</Popover>
			<Modal
				open={currentSegment !== null}
				onClose={modalClose}
			>
				<Paper
					style={{textAlign: "center", width: "400px", position: "absolute", left: "50%", top: "50%", padding: "16px", marginLeft: "-200px", marginTop: "-100px"}}
				>
				{
					currentSegment === null ? (<Typography>No rules</Typography>) : (
						rules = Object.getOwnPropertyNames(segments[currentSegment]["segment_rules"]), 
						rules.map(rule => (
							<Typography variant="caption">
								<strong>{rule + " "}</strong>
								{segments[currentSegment]["segment_rules"][rule]["operators"]}
								<strong>{" " + segments[currentSegment]["segment_rules"][rule]["values"]}</strong>
								<br/>
							</Typography>
						))
					)
				}
				</Paper>
			</Modal>
		</Box>
	)
}
