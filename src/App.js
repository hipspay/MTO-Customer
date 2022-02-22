import React from 'react';

import { Route, Switch, withRouter, Redirect } from 'react-router-dom';

import { SnackbarProvider } from 'notistack';

import PublicRoute from 'routes/PublicRoute';

import Marketplace from 'containers/Marketplace';
import NotFound from 'containers/NotFound';

import DisputeDetailPage from './containers/DisputeDetail';
import DisputesPage from './containers/Disputes';
import OrderDetailPage from './containers/OrderDetail';
import OrdersPage from './containers/Orders';
import ProductDetailPage from './containers/ProductDetail';
import ProductsPage from './containers/Products';
import ProfilePage from './containers/Profile';

const App = (props) => (
    <SnackbarProvider maxSnack={3}>
        <Switch>
            <Route exact path="/">
                <Redirect to="/marketplace" />
            </Route>

            <PublicRoute
                exact
                path="/marketplace"
                component={Marketplace}
                props={props}
            />

            <PublicRoute
                exact
                path="/myproducts"
                component={ProductsPage}
                props={props}
            />

            <PublicRoute
                exact
                path="/products/:id"
                component={ProductDetailPage}
                props={props}
            />

            <PublicRoute
                exact
                path="/orders"
                component={OrdersPage}
                props={props}
            />

            <PublicRoute
                exact
                path="/orders/:id"
                component={OrderDetailPage}
                props={props}
            />

            <PublicRoute
                exact
                path="/disputes"
                component={DisputesPage}
                props={props}
            />

            <PublicRoute
                exact
                path="/disputes/:id"
                component={DisputeDetailPage}
                props={props}
            />

            <PublicRoute
                exact
                path="/profile"
                component={ProfilePage}
                props={props}
            />

            <Route component={NotFound} />
        </Switch>
    </SnackbarProvider>
);

export default withRouter(App);
