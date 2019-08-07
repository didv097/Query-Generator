import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
//import Count from './Count'

export default function CountDisplay(props) {

	const [rules, setRules] = React.useState([])
	const [query, setQuery] = React.useState(
		gql`
		query GetCounts {
			reportCounts(
				filter: {device_type: {EQ: "Computer"}}, 
				fixedDateRange: {start_date: "2019-03-14", end_date: "2019-03-15"}
			){
				uids 
				pageviews 
				impressions 
				visits
			}
		}
	`)

	if (rules !== props.rules) {
		setRules(props.rules)
		var qRules = []
		if (props.rules.length > 0) {
			for (var i in props.rules) {
				var f_vals = props.rules[i].values.map((i) => {
					return `"` + i + `"`
				}).join(',')
				qRules.push(`${props.rules[i].filter_name}: {${props.rules[i].operator.replace('NOT IN', 'NIN')}: [${f_vals}]}`) 
			}
			var qFilter = `filter: {${qRules.join(',')}}`
			var qDateFilter = `fixedDateRange: {start_date: "2019-03-14", end_date: "2019-03-15"}`
			var qFields = `{uids, pageviews, impressions, visits}` 

			setQuery(gql`query GetCounts { reportCounts(${qFilter}, ${qDateFilter})${qFields} }`);
		}

	} else {

	};

	console.log(query)

	return(
		<Query query={query} >
			{({ loading, error, data }) => {
				if (loading) return <div>Fetching ...</div>
				if (error) return <div>Error</div>

				const count = data.reportCounts

				return ( 
					<div>
						users: {count.uids} <br />
						visits: {count.visits} <br />
						page views: {count.pageviews} <br />
						impressions: {count.impressions} <br />
					</div>
				)
			}}
		</Query>
	)
}