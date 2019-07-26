import React from 'react';

import {
	Box,
	Grid,
	Button,
	Typography,
	TextField,
	MenuItem,
	IconButton,
} from '@material-ui/core';
import {
	edit
} from '@material-ui/icons';

const categoryNames = [
	"Finance", "RealEstate", "Technology", "Family"
]

export default function SegmentDetailsPage() {
	const [categoryName, setCategoryName] = React.useState("");
	const [expirationDate, setExpirationDate] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [rules, setRules] = React.useState([]);

	const categoryNameChanged = event => {
		setCategoryName(event.target.value);
	}
	const expirationDateChanged = event => {
		setExpirationDate(event.target.value)
	}
	const descriptionChanged = event => {
		setDescription(event.target.value)
	}
	return (
		<Box>
			<Grid
				container
				direction="column"
				spacing={2}
			>
				<Grid item>
					<Box m={1}>
						<Box m={1} display="inline">
							<Button variant="contained" size="small" color="default" href="/SegmentsPage">
								<i className="material-icons">file_copy</i>
								Segments
							</Button>
						</Box>
						<Box m={1} display="inline">
							<Button variant="contained" size="small" color="default" href="/">
								<i className="material-icons">add</i>
								New segment
							</Button>
						</Box>
					</Box>
				</Grid>
				<Grid item>
					<Button size="small" href="/">
						<i className="material-icons">keyboard_arrow_left</i>
						back
					</Button>
				</Grid>
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
									<TextField fullWidth />
							</Grid>
							<Grid item style={{width: "100%"}}>
								<Grid
									container
									direction="row"
								>
									<Grid item xs={6}>
										<Typography style={{marginBottom: "8px"}}>Category name</Typography>
										<TextField
											id="category-name"
											select
											value={categoryName}
											onChange={categoryNameChanged}
											style={{width: "200px"}}
											maxWidth="80%"
										>
											{categoryNames.map(cat => (
												<MenuItem key={cat} value={cat}>
													<Typography>{cat}</Typography>
												</MenuItem>
											))}
										</TextField>
									</Grid>
									<Grid item xs={6}>
										<Typography style={{marginBottom: "8px"}}>Expiration date</Typography>
										<TextField
											id="expiration-date"
											type="date"
											value={expirationDate}
											onChange={expirationDateChanged}
											style={{width: "200px"}}
											maxWidth="80%"
										/>
									</Grid>
								</Grid>
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
						</Grid>
					</Box>
				</Grid>
			</Grid>
		</Box>
	)
}
