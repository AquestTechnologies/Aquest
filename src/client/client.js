import React                  from 'react';
import ReactDOM                   from 'react-dom';
import Router, { Route }       from 'react-router';  
import protectRoutes           from '../shared/routes';
import log, { logWelcome }     from '../shared/utils/logTailor';
import registerShortcuts       from './lib/registerShortcuts';
import registerSideEffects     from './lib/registerSideEffects';
import configureStore          from '../shared/configureStore';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import { Provider } from 'react-redux';

logWelcome(0);

const d = new Date();
const store = configureStore(window.STATE_FROM_SERVER || {});

const app = ReactDOM.render(
  <Provider store={store}>
    <Router history={createBrowserHistory()} routes={protectRoutes(store)} />
  </Provider>,
  document.getElementById('mountNode'),
  () => log(`... App rendered in ${new Date() - d}ms.`)
);

registerShortcuts(store.getState);
registerSideEffects(store, app.transitionTo);

require('./css/app.css');
