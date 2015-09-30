import log from './utils/logTailor';
import _cloneDeep from 'lodash.clonedeep';
import { sessionDuration } from '../../config/dev_shared';
import { routerStateReducer } from 'redux-react-router';
import { isAPIUnauthorized, isAPISuccess, isAPIFailure } from './actionCreators';

export default {
  
  session: (state={}, action) => {
    const { userId, exp, redirection } = state;
    const { type, payload } = action;
    log('.R. ' + type); // Please keep this line in the first reducer
    
    if (type === 'SUCCESS_LOGIN' || type === 'SUCCESS_CREATE_USER') return {
      redirection,
      userId: payload.id,
      exp: new Date().getTime() + sessionDuration,
    };
    
    // If the API answers 200 then we renew the session expiration
    if (isAPISuccess(action)) return {
      userId,
      redirection,
      exp: new Date().getTime() + sessionDuration,
    };
    
    // If the API answers 401 or user logs out then we kill the session
    if (isAPIUnauthorized(action) || type === 'LOGOUT') return {};
    
    if (type === 'SET_REDIRECTION') return {
      exp,
      userId,
      redirection: payload,
    };
    
    return state;
  },
  
  users: (state={}, {type, payload}) => {
    switch (type) {
      
    case 'SUCCESS_CREATE_USER':
      return Object.assign({}, state, {[payload.id]: payload});
      
    case 'SUCCESS_LOGIN':
      return Object.assign({}, state, {[payload.id]: payload});
      
    default:
      return state;
    }
  },
  
  universes: (state={}, {type, payload, params}) => {
    let newState;
    switch (type) {
      
    case 'SUCCESS_READ_UNIVERSE':
      return Object.assign({}, state, {[payload.id]: payload});
  
    case 'SUCCESS_READ_UNIVERSES':
      newState = Object.assign({}, state);
      payload.forEach(universe => {
        if (!newState[universe.id]) newState[universe.id] = universe;
      });
      return newState;
      
    case 'SUCCESS_READ_INVENTORY':
      newState = Object.assign({}, state);
      newState[params].lastInventoryUpdate = new Date().getTime();
      return newState;
    
    case 'SUCCESS_CREATE_UNIVERSE':
      return Object.assign({}, state, {[payload.id]: payload});
    
    default:
      return state;
    }
  },
  
  chats: (state={}, action) => {
    const {type} = action;
    
    switch (type) {
      
    case 'SUCCESS_READ_CHAT_OFFSET':
      
      return ((action) => {
        const chatId = action.payload && action.payload.id ? parseInt(action.payload.id, 10) : action.params ? parseInt(action.params, 10) : false;
        const newState = _cloneDeep(state);
        
        if (action.payload.messages.length) newState[chatId].messages = action.payload.messages.concat(newState[chatId].messages);
        
        return newState;
      })(action);
      
    case 'SUCCESS_READ_CHAT':
      
      return ((action) => {
        const chatId = action.payload && action.payload.id ? parseInt(action.payload.id, 10) : action.params ? parseInt(action.params, 10) : false;
        const newState = _cloneDeep(state);
        newState[chatId] = Object.assign({}, newState[chatId], action.payload);
        
        return newState;
      })(action);
      
    case 'EMIT_CREATE_MESSAGE':
      
      return ((action) => {
        const chatId = parseInt(action.payload.chatId, 10);
        const newState = _cloneDeep(state);
        
        newState[chatId].messages.push(action.payload.message);
        
        return newState;
      })(action);
      
    case 'RECEIVE_MESSAGE_OWNER':
      
      return ((action) => {
        const chatId = parseInt(action.payload.chatId, 10);
        const { message, lcId } = action.payload;
        const messageIndex = state[chatId].messages.findIndex(({id}) => id === lcId);
        
        if (messageIndex !== -1) { 
          const newState = _cloneDeep(state);
          newState[chatId].messages[messageIndex] = message; // must enable the ui to know if the message was succesfully delivered or not
          
          return newState;
        }
        
        return state;
      })(action);
      
    case 'RECEIVE_MESSAGE':
      
      return ((action) => {
        const chatId = parseInt(action.payload.chatId, 10);
        const { message } = action.payload;
        const newState = _cloneDeep(state);
        
        newState[chatId].messages.push(message);
        
        return newState;
      })(action);
       
    case 'EMIT_JOIN_CHAT':
      
      return ((action) => {
        const chatId = parseInt(action.payload, 10);
        const newState = _cloneDeep(state);
        
        if (newState[chatId] && !newState[chatId].users) {
          newState[chatId] = Object.assign({}, newState[chatId], {users: []});
        } else if (!newState[chatId]) {
          newState[chatId] = {users: []};
        }
        
        return newState;        
      })(action);
            
    case 'RECEIVE_JOIN_CHAT_OWNER':
      
      return ((action) => {
        const chatId = parseInt(action.payload.chatId, 10);
        const { userList } = action.payload;
        const newState = _cloneDeep(state);
        
        newState[chatId] = Object.assign({}, newState[chatId], {users: userList});
        
        return newState;
      })(action);
      
    case 'RECEIVE_JOIN_CHAT':
      
      return ((action) => {
        const chatId = parseInt(action.payload.chatId, 10);
        const { userId } = action.payload;
        const newState = _cloneDeep(state);
        
        newState[chatId].users.push(userId);
        
        return newState;
      })(action);
    
    case 'EMIT_LEAVE_CHAT':
      
      return ((action) => {
        const chatId = parseInt(action.payload, 10);
        const newState = _cloneDeep(state);
        
        delete newState[chatId].users;  
        
        return newState;      
      })(action);
      
    case 'RECEIVE_LEAVE_CHAT':
      
      return ((action) => {
        const chatId = parseInt(action.payload.chatId, 10);
        const {userId} = action.payload;
        const newState = _cloneDeep(state);
        
        // remove the user from the user list
        if (newState[chatId].users && newState[chatId].users.length) newState[chatId].users.splice(newState[chatId].users.indexOf(userId), 1);
        
        return newState;
      })(action);
      
    default:
      return state;
    }
  },
  
  topics: (state={}, {type, payload, params}) => {
    let newState;
    switch (type) {
      
    case 'SUCCESS_READ_INVENTORY':
      newState = Object.assign({}, state);
      payload.forEach(topic => newState[topic.id] = topic);
      return newState;
      
    case 'SUCCESS_READ_TOPIC':
      return Object.assign({}, state, {[payload.id]: payload});
      
    case 'SUCCESS_READ_TOPIC_ATOMS':
      newState = Object.assign({}, state);
      newState[params].atoms = payload;
      return newState;
      
    case 'SUCCESS_CREATE_TOPIC':
      return Object.assign({}, state, {[payload.id]: payload});
      
    default:
      return state;
    }
  },
  
  router: (state={}, action) => routerStateReducer(state, action),
  
  lastError: (state=false, action) => isAPIFailure(action) ? action.payload : false,
  
  // Doit être exporté en dernier pour activer les side effects après la reduction des précédants
  records: (state = [], action) => [...state, Object.assign({date: new Date().getTime()}, action)]
};
