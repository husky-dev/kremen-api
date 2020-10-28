import './index.css';

import { MuiThemeProvider } from '@material-ui/core';
import React, { FC } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { NavPath } from 'screens';
import MapScreen from 'screens/Map';
import { PrivacyScreen } from 'screens/Privacy';
import { persistor, store } from 'store';
import { muiTheme } from 'styles';

const AppContainer: FC = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <MuiThemeProvider theme={muiTheme}>
        <Router>
          <Switch>
            <Route path={NavPath.Root} exact={true} component={MapScreen} />
            <Route path={NavPath.Privacy} exact={true} component={PrivacyScreen} />
            <Redirect to={NavPath.Root} />
          </Switch>
        </Router>
      </MuiThemeProvider>
    </PersistGate>
  </Provider>
);

ReactDOM.render(<AppContainer />, document.getElementById('app'));
