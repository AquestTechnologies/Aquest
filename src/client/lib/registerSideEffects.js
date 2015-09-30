import docCookies from '../vendor/cookie';
import log from '../../shared/utils/logTailor';
import { isAPIUnauthorized } from '../../shared/actionCreators';

export default function registerSideEffects(store, transitionTo) {
  
  const logR = type => log('.E. redirecting after', type);

  const setRedirection = path => store.dispatch({
    type: 'SET_REDIRECTION',
    payload: path,
  });
  
  function redirectAfterLogin(type, {query}, {redirection}) {
    logR(type);
    const r = query ? query.r : undefined;
    transitionTo(r ? r : redirection ? redirection : '/Explore');
    setRedirection('');
  }
  
  store.subscribe(() => {
    const { records, router, session } = store.getState();
    const lastAction = records[records.length - 1];
    const { type, payload } = lastAction;
    
    if (isAPIUnauthorized(lastAction)) {
      const { pathname } = router;
      log('.E. Unauthorized access, will redirect to', pathname);
      docCookies.removeItem('jwt');
      setRedirection(pathname);
      transitionTo('/login');
      return;
    }
    
    switch (type) {
      
      case 'TRANSITION_TO':
        const { pathname, query, state } = payload;
        log('.E. transitionTo ', pathname, query, state);
        transitionTo(pathname, query, state);
        return;
        
      case 'LOGOUT':
        logR(type);
        docCookies.removeItem('jwt');
        transitionTo('/');
        return;
        
      case 'SUCCESS_LOGIN':
        redirectAfterLogin(type, router, session);
        return;
        
      case 'SUCCESS_CREATE_USER':
        redirectAfterLogin(type, router, session);
        return;
        
      case 'SUCCESS_CREATE_UNIVERSE':
        logR(type);
        transitionTo(`/~${payload.id}`);
        return;
        
      case 'SUCCESS_CREATE_TOPIC':
        const { id, universeId } = payload;
        logR(type);
        transitionTo(`/~${universeId}/${id}`);
        return;
        
    }
  });
}
