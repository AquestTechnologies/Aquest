import reducers from './reducers';
import log from './utils/logTailor';
import isClient from './utils/isClient';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import promiseMiddleware   from '../shared/middleware/promiseMiddleware';
import websocketMiddleware from '../shared/middleware/websocketMiddleware';

export default function configureStore(initialState) {
  
  log('... Initializing store');
  
  const storeEnhancer = isClient() ? 
    applyMiddleware(promiseMiddleware, websocketMiddleware) :
    applyMiddleware(promiseMiddleware);
  
  const store = storeEnhancer(createStore)(combineReducers(reducers), initialState);

  // Enables Webpack hot module replacement for reducers
  if (module.hot) module.hot.accept('./reducers.js', () => store.replaceReducer(require('./reducers.js')));

  return store;
}
