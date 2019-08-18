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

import ops from '../operator.json';

let totalCount = null;

const query_total = `
	query GetCounts {
		reportCounts(
			filter: {device_type: {NIN: ""}}, 
			relativeDateRange: 90
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
  body: JSON.stringify({ query: query_total })
};
fetch(url, opts)
  .then(res => res.json())
  .then(res => {
		totalCount = res.data.reportCounts;
	});

export default function CountDisplay(props) {

	const [rules, setRules] = React.useState([]);
	const [days, setDays] = React.useState(90);
	const [query, setQuery] = React.useState(gql(query_total));

	if (rules !== props.rules || days !== props.days) {
		setRules(props.rules);
		setDays(props.days);
		let qRules = [];
		let qFilter;
		if (props.rules.length > 0) {
			for (let i in props.rules) {
				let f_vals;
				f_vals = props.rules[i].values.map((i) => {
					return `"` + i + `"`;
				}).join(',');
				if (props.rules[i].values.length > 1) {
					f_vals = `[` + f_vals + `]`;
				}
				qRules.push(`${props.rules[i].filterName}: {${ops[props.rules[i].operator] === undefined ? props.rules[i].operator : ops[props.rules[i].operator]}: ${f_vals}}`);
			}
			qFilter = `filter: {${qRules.join(',')}}`;
		} else {
			qFilter = `filter: {device_type: {NIN: ""}}`;
		}
		const qDateFilter = `relativeDateRange: ` + props.days;
		const qFields = `{uids, pageviews, impressions, visits}`;

		setQuery(gql`query GetCounts { reportCounts(${qFilter}, ${qDateFilter})${qFields} }`);
	}

	return(
		<Query query={query} >
			{({ loading, error, data }) => {
				if (loading) return <div>Fetching ...</div>;
				if (error) return <div>Error</div>;

				const count = data.reportCounts;

				return (
					<Box m={1}>
						<Typography variant="h5" align="center"><b>{props.segName}</b></Typography> <br />
						<Typography variant="body2">{props.description}</Typography>
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
						<Grid container style={{width: "300px", margin: "auto"}}>
							<Grid item xs={6}>
							{count === totalCount ? null : (
								<div>
									<Typography variant="body2"><b>Segment</b></Typography>
									<div style={{display: "flex"}}>
										<Typography variant="body2">{count.uids} Users</Typography>
										<div style={{width: "10px", height: "10px", background: "#003466", margin: "6px"}} />
									</div>
									<div style={{display: "flex"}}>
										<Typography variant="body2">{count.visits} Visits</Typography><br/>
										<div style={{width: "10px", height: "10px", background: "#3399FE", margin: "6px"}} />
									</div>
									<Typography variant="body2">{(count.visits / count.uids).toFixed(2)} V/U</Typography>
								</div>
							)}
							</Grid>
							<Grid item xs={6}>
								<Typography variant="body2"><b>Population</b></Typography>
								<Typography variant="body2">{totalCount.uids} Users</Typography>
								<Typography variant="body2">{totalCount.visits} Visits</Typography>
								<Typography variant="body2">{(totalCount.visits / totalCount.uids).toFixed(2)} V/U</Typography>
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
						<Grid container style={{width: "300px", margin: "auto"}}>
							<Grid item xs={6}>
							{count === totalCount ? null : (
								<div>
									<Typography variant="body2"><b>Segment</b></Typography>
									<div style={{display: "flex"}}>
										<Typography variant="body2">{count.impressions} Impressions</Typography>
										<div style={{width: "10px", height: "10px", background: "#003466", margin: "6px"}} />
									</div>
									<div style={{display: "flex"}}>
										<Typography variant="body2">{count.pageviews} Pg Views</Typography>
										<div style={{width: "10px", height: "10px", background: "#3399FE", margin: "6px"}} />
									</div>
									<Typography variant="body2">{(count.impressions / count.pageviews).toFixed(2)} I/PV</Typography>
								</div>
							)}
							</Grid>
							<Grid item xs={6}>
								<Typography variant="body2"><b>Population</b></Typography>
								<Typography variant="body2">{totalCount.impressions} Impressions</Typography>
								<Typography variant="body2">{totalCount.pageviews} Pg Views</Typography>
								<Typography variant="body2">{(totalCount.impressions / totalCount.pageviews).toFixed(2)} I/PV</Typography>
							</Grid>
						</Grid>
					</Box>
				);
			}}
		</Query>
	)
}
