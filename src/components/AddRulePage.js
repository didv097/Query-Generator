import React from 'react';
import { Grid, Button, Box, Chip, Typography, Slider, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, List, ListItem } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import data from '../data.json'
let keys = [];
for (let k in data) keys.push(k)

export default function AddRulePage() {
	const [expanded, setExpanded] = React.useState(false);

	const expansionChange = panel => (event, isExpanded) => {
		setExpanded(isExpanded ? panel : false);
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
									<ExpansionPanel expanded={expanded === 'User attributes'} onChange={expansionChange('User attributes')}>
										<ExpansionPanelSummary
											expandIcon={<ExpandMoreIcon />}
										>
											<Typography variant="caption">User attributes</Typography>
										</ExpansionPanelSummary>
										<ExpansionPanelDetails>
											<List>
												{keys.map(key => (
													<ListItem button>
														<Typography variant="caption">{key}</Typography>
													</ListItem>
												))}
											</List>
										</ExpansionPanelDetails>
									</ExpansionPanel>
									<ExpansionPanel expanded={expanded === 'Page view attributes'} onChange={expansionChange('Page view attributes')}>
										<ExpansionPanelSummary
											expandIcon={<ExpandMoreIcon />}
										>
											<Typography variant="caption">Page view attributes</Typography>
										</ExpansionPanelSummary>
										<ExpansionPanelDetails>
											<List>
												{keys.map(key => (
													<ListItem button>
														<Typography variant="caption">{key}</Typography>
													</ListItem>
												))}
											</List>
										</ExpansionPanelDetails>
									</ExpansionPanel>
									<ExpansionPanel expanded={expanded === 'Impression attributes'} onChange={expansionChange('Impression attributes')}>
										<ExpansionPanelSummary
											expandIcon={<ExpandMoreIcon />}
										>
											<Typography variant="caption">Impression attributes</Typography>
										</ExpansionPanelSummary>
										<ExpansionPanelDetails>
											<List>
												{keys.map(key => (
													<ListItem button>
														<Typography variant="caption">{key}</Typography>
													</ListItem>
												))}
											</List>
										</ExpansionPanelDetails>
									</ExpansionPanel>
								</Box>
							</Box>
						</Grid>
						<Grid item xs={9}></Grid>
					</Grid>
					<h1>1111</h1>
				</Grid>
				<Grid item xs={2}>
					<h1>33333</h1>
				</Grid>
			</Grid>
		</Box>
  )
}
