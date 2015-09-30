import React       from 'react';
import App         from './components/App';
import User        from './components/User';
import Explore     from './components/Explore';
import Universe    from './components/Universe';
import Login       from './components/Login';
import NewUniverse from './components/CreateUniverse';
import Topic       from './components/Topic';
import NewTopic    from './components/CreateTopic';
import NotFound    from './components/common/NotFound';
import { Route, Redirect } from 'react-router';
import { Provider } from 'react-redux';
import { ReduxRouter } from 'redux-router';
import log, { logAuthentication } from './utils/logTailor';


export default function protectRoutes(store) {
  
  log('.X. Adding authentication check on routes');
  
  const protectAccess = (nextState, transition) => { // RR 1.0 signature
    
    const {location: {pathname}, params: {topicId}} = nextState;
    
    if (topicId) return; // Exception: _universe/topic gets checked because of _universe, this solves it.
    
    const {userId, expiration} = store.getState().session;
    logAuthentication(`routeGuard ${pathname}`, userId, expiration);
    
    // If user is unauthenticated we save the path he wanted to go to and transition to /login
    if (!userId || expiration < new Date().getTime()) {
      log('!!! User unauthenticated: cancelling transition');
      store.dispatch({ type: 'SET_REDIRECTION', payload: pathname });
      transition.to('/login');
    }
  };
  
  return (
    <Route path='/' component={App}> 
      
      <Route path='login' component={Login} />
      
      <Route path='~:universeId' component={Universe} onEnter={protectAccess}>
        <Route path='Create_topic' component={NewTopic} onEnter={protectAccess} />
        <Route path=':topicId' component={Topic} />
      </Route>
      
      <Route path='@:userId' component={User} onEnter={protectAccess} />
      <Route path='Explore' component={Explore} onEnter={protectAccess} />
      <Route path='Create_universe' component={NewUniverse} onEnter={protectAccess} />
      
      <Route path="*" component={NotFound} />
      
      <Redirect from='about'    to='/' />
      <Redirect from='signup'   to='/' />
      <Redirect from='register' to='/' />
      
    </Route>
  );
}
