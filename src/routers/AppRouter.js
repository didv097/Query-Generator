import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import AddRulePage from '../components/AddRulePage';
import SegmentsPage from '../components/SegmentsPage';
import NotFoundPage from '../components/NotFoundPage';

const AppRouter = () => (
	<BrowserRouter>
		<div>
			<Switch>
				<Route path="/" component={AddRulePage} exact={true} />
				<Route path="/edit/:id" component={AddRulePage} />
				<Route path="/SegmentsPage" component={SegmentsPage} />
				<Route component={NotFoundPage} />
			</Switch>
		</div>
	</BrowserRouter>
);
export default AppRouter;
