import React from 'react';
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer
} from 'recharts';
import {
	Grid, Box, Typography
} from '@material-ui/core';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

let totalCount = null;
const today = new Date();
let pastDate = new Date();
pastDate.setDate(today.getDate() - 90);
const formatDate = function(d) {
	return `"` + d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + `"`;
}

const query = `
	query GetCounts {
		reportCounts(
			filter: {device_type: {NIN: ""}}, 
			fixedDateRange: {start_date: ` + formatDate(pastDate) + `, end_date: ` + formatDate(today) + `}
		){
			uids 
			pageviews 
			impressions 
			visits
		}
	}
`;
const url = "http://localhost:4000/graphql";
const opts = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query })
};
fetch(url, opts)
  .then(res => res.json())
  .then(res => {
		totalCount = res.data.reportCounts;
	});

export default function CountDisplay(props) {

	const [rules, setRules] = React.useState([]);
	const [days, setDays] = React.useState(90);
	const [query, setQuery] = React.useState(gql(`
		query GetCounts {
			reportCounts(
				filter: {device_type: {NIN: ""}}, 
				fixedDateRange: {start_date: ` + formatDate(pastDate) + `, end_date: ` + formatDate(today) + `}
			){
				uids 
				pageviews 
				impressions 
				visits
			}
		}
	`));

	if (rules !== props.rules || days !== props.days) {
		setRules(props.rules);
		setDays(props.days);
		let qRules = [];
		let qFilter;
		if (props.rules.length > 0) {
			for (let i in props.rules) {
				const f_vals = props.rules[i].values.map((i) => {
					return `"` + i + `"`
				}).join(',');
				qRules.push(`${props.rules[i].filterName}: {${props.rules[i].operator.replace('NOT IN', 'NIN')}: [${f_vals}]}`) 
			}
			qFilter = `filter: {${qRules.join(',')}}`;
		} else {
			qFilter = `filter: {device_type: {NIN: ""}}`;
		}
		pastDate = new Date();
		pastDate.setDate(new Date().getDate() - props.days);
		const qDateFilter = `fixedDateRange: {start_date: ` + formatDate(pastDate) + `, end_date: ` + formatDate(today) + `}`;
		const qFields = `{uids, pageviews, impressions, visits}`;

		setQuery(gql`query GetCounts { reportCounts(${qFilter}, ${qDateFilter})${qFields} }`);

	}

	return(
		<Query query={query} >
			{({ loading, error, data }) => {
				if (loading) return <div>Fetching ...</div>
				if (error) return <div>Error</div>

				const count = data.reportCounts;

				return (
					<div>
						<Box m={1}>
							<Typography variant="caption"><b>DASHBOARD</b></Typography>
							<br /><br />
							<Typography variant="caption">As you create more rules, the dashboard will show the amount of real users and impressions you are targeting.</Typography>
							<br /><br />
						<hr />
						<ResponsiveContainer  width="100%" height={200}>
							<PieChart>
								<Pie
									data={[
										{value: count.uids},
										{value: totalCount.uids - count.uids}
									]}
									dataKey="value"
									animationBegin={0}
									innerRadius="70%"
									outerRadius="100%"
								>
									<Cell fill="#003466"></Cell>
									<Cell fill="#325C82"></Cell>
								</Pie>
								<Pie
									data={[
										{value: count.visits},
										{value: totalCount.visits - count.visits}
									]}
									dataKey="value"
									animationBegin={0}
									innerRadius="30%"
									outerRadius="70%"
								>
									<Cell fill="#3399FE"></Cell>
									<Cell fill="#5CAFFD"></Cell>
								</Pie>
							</PieChart>
						</ResponsiveContainer>
						<Grid container>
							<Grid item xs={6}>
							{count === totalCount ? null : (
								<div>
									<Typography variant="caption"><b>Segment</b></Typography><br/>
									<div style={{display: "flex"}}>
										<Typography variant="caption">{count.uids} Users</Typography>
										<div style={{width: "10px", height: "10px", background: "#003466", margin: "auto", marginLeft: "4px"}} />
									</div>
									<div style={{display: "flex"}}>
										<Typography variant="caption">{count.visits} Visits</Typography><br/>
										<div style={{width: "10px", height: "10px", background: "#3399FE", margin: "auto", marginLeft: "4px"}} />
									</div>
									<Typography variant="caption">{(count.visits / count.uids).toFixed(2)} V/U</Typography>
								</div>
							)}
							</Grid>
							<Grid item xs={6}>
								<Typography variant="caption"><b>Population</b></Typography><br/>
								<Typography variant="caption">{totalCount.uids} Users</Typography><br/>
								<Typography variant="caption">{totalCount.visits} Visits</Typography><br/>
								<Typography variant="caption">{(totalCount.visits / totalCount.uids).toFixed(2)} V/U</Typography>
							</Grid>
						</Grid>
						<hr />
						<ResponsiveContainer  width="100%" height={200}>
							<PieChart>
								<Pie
									data={[
										{value: count.impressions},
										{value: totalCount.impressions - count.impressions}
									]}
									dataKey="value"
									animationBegin={0}
									innerRadius="70%"
									outerRadius="100%"
								>
									<Cell fill="#003466"></Cell>
									<Cell fill="#325C82"></Cell>
								</Pie>
								<Pie
									data={[
										{value: count.pageviews},
										{value: totalCount.pageviews - count.pageviews}
									]}
									dataKey="value"
									animationBegin={0}
									innerRadius="30%"
									outerRadius="70%"
								>
									<Cell fill="#3399FE"></Cell>
									<Cell fill="#5CAFFD"></Cell>
								</Pie>
							</PieChart>
						</ResponsiveContainer>
						<Grid container>
							<Grid item xs={6}>
							{count === totalCount ? null : (
								<div>
									<Typography variant="caption"><b>Segment</b></Typography><br/>
									<div style={{display: "flex"}}>
										<Typography variant="caption">{count.impressions} Impressions</Typography><br/>
										<div style={{width: "10px", height: "10px", background: "#003466", margin: "auto", marginLeft: "4px"}} />
									</div>
									<div style={{display: "flex"}}>
										<Typography variant="caption">{count.pageviews} Pg Views</Typography><br/>
										<div style={{width: "10px", height: "10px", background: "#3399FE", margin: "auto", marginLeft: "4px"}} />
									</div>
									<Typography variant="caption">{(count.impressions / count.pageviews).toFixed(2)} I/PV</Typography>
								</div>
							)}
							</Grid>
							<Grid item xs={6}>
								<Typography variant="caption"><b>Population</b></Typography><br/>
								<Typography variant="caption">{totalCount.impressions} Impressions</Typography><br/>
								<Typography variant="caption">{totalCount.pageviews} Pg Views</Typography><br/>
								<Typography variant="caption">{(totalCount.impressions / totalCount.pageviews).toFixed(2)} I/PV</Typography>
							</Grid>
						</Grid>
						</Box>
					</div>
				);
			}}
		</Query>
	)
}
