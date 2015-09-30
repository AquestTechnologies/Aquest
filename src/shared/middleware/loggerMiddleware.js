import log from '../utils/logTailor.js';

export default function loggerMiddleware({ dispatch, getState }) {
  
  return next => action => {
    log('Dispatching:', action);
    log('Next state:', getState());
    
    return next(action);
  };
}

