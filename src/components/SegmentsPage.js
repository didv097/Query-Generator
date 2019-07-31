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
	Popover,
	Paper,
	List,
	ListItem,
	ListItemIcon
} from '@material-ui/core';
import {
	Search,
	MoreVert,
	GetApp,
	Edit,
	Delete
} from '@material-ui/icons';
import segdata from '../segment_list_data.json';

const segments = segdata["Segments"];
const segmentNames = [];
for (let name in segments) {
	segmentNames.push(name);
}
let rules;

export default function SegmentsPage() {
	const [searchText, setSearchText] = React.useState("");
	const [anchorEl, setAnchorEl] = React.useState(null);
	const [searchResults, setSearchResults] = React.useState(segmentNames);

	const searchChanged = event => {
		const val = event.target.value;
		setSearchText(val);
		setSearchResults(segmentNames.filter(name => {
			return name.toLowerCase().indexOf(val.toLowerCase()) !== -1;
		}));
	}
	const moreClicked = event => {
		setAnchorEl(event.currentTarget);
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
	const editSegmentClicked = () => {
		setAnchorEl(null);
	}
	const deleteSegmentClicked = () => {
		setAnchorEl(null);
	}

	return (
		<Box m={2}>
			<Grid
				container
				direction="column"
				justify="flex-start"
				alignItems="flex-start"
				spacing={5}
			>
				<Grid item>
					<Button href="/">
						<i className="material-icons">add</i>
						New segment
					</Button>
				</Grid>
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
								<TableCell align="left">Name</TableCell>
								<TableCell align="left">Rules</TableCell>
								<TableCell align="left">Last modified</TableCell>
								<TableCell align="left">Population</TableCell>
								<TableCell align="left">Category</TableCell>
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
														+{rules.length} other values
													</Typography>
													<Button
														variant="outlined"
														size="small"
														style={{padding: "0"}}
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
										<IconButton onClick={moreClicked}>
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
				<Paper>
					<List>
						<ListItem button onClick={exportCSVClicked}>
							<ListItemIcon>
								<GetApp/>
							</ListItemIcon>
							Export .CSV
						</ListItem>
						<ListItem button onClick={editSegmentClicked}>
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
			</Popover>
		</Box>
	)
}
