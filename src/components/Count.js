import React from 'react'


export default function Count(props) {
	return(
		<div>
			users: {props.count.uids} <br />
			visits: {props.count.visits} <br />
			page views: {props.count.pageviews} <br />
			impressions: {props.count.impressions} 
		</div>
	)
}