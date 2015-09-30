import log from './utils/logTailor';
import isClient from './utils/isClient';
const isServer = !isClient();

// Si une transition peut avoir lieu dans les sides effects alors preferer cette methode
// Cet AC est provisoire et devra être remplacé par <Link/> partout (SEO friendly)
export const transitionTo = (pathname, query, state) => ({ type: 'TRANSITION_TO', payload: {pathname, query, state} });

export const logout = () => ({ type: 'LOGOUT' });

export const readUniverse = createActionCreator({
  intention:  'readUniverse',
  method:     'get',
  pathx:      '/api/universe/{p}',
  auth:       false,
});

export const readUniverses = createActionCreator({
  intention:  'readUniverses',
  method:     'get',
  pathx:      '/api/universes/',
  auth:       'jwt',
});

export const readInventory = createActionCreator({
  intention:  'readInventory',
  method:     'get',
  pathx:      '/api/inventory/{p}',
  auth:       'jwt',
});

export const readTopic = createActionCreator({
  intention:  'readTopic',
  method:     'get',
  pathx:      '/api/topic/{p}',
  auth:       false,
});

export const readTopicAtoms = createActionCreator({
  intention:  'readTopicAtoms',
  method:     'get',
  pathx:      '/api/topicAtoms/{p}',
  auth:       false,
});

export const readChat = createActionCreator({
  intention:  'readChat',
  method:     'get',
  pathx:      '/api/chat/{p}',
  auth:       false,
});

export const readChatOffset = createActionCreator({
  intention:  'readChatOffset',
  method:     'get',
  pathx:      '/api/chat/{chatId}/{offset}', 
  auth:       false,
});

export const createUniverse = createActionCreator({
  intention:  'createUniverse',
  method:     'post',
  pathx:      '/api/universe/',
  auth:       'jwt',
});

export const createTopic = createActionCreator({
  intention:  'createTopic',
  method:     'post',
  pathx:      '/api/topic/',
  auth:       'jwt',
});

export const createUser = createActionCreator({
  intention:  'createUser',
  method:     'post',
  pathx:      '/api/user/',
  auth:       false,
});

export const login = createActionCreator({
  intention:  'login',
  method:     'post',
  pathx:      '/login',
  auth:       false,
});

export const emitJoinChat = params => ({ type: 'EMIT_JOIN_CHAT', payload: params });
  
export const emitLeaveChat = params => ({ type: 'EMIT_LEAVE_CHAT', payload: params });  
  
export const emitCreateMessage = params => ({ type: 'EMIT_CREATE_MESSAGE', payload: params });  
  
export const receiveJoinChat =  params => ({ type: 'RECEIVE_JOIN_CHAT', payload: params });

export const receiveJoinChatOwner =  params => ({ type: 'RECEIVE_JOIN_CHAT_OWNER', payload: params });
  
export const receiveLeaveChat = params => ({ type: 'RECEIVE_LEAVE_CHAT', payload: params });
  
export const receiveMessage = params => ({ type: 'RECEIVE_MESSAGE', payload: params });

export const receiveMessageOwner = params => ({ type: 'RECEIVE_MESSAGE_OWNER', payload: params });

const actionCreators = {
  transitionTo, login, logout,
  createUser, createUniverse, createTopic, 
  emitJoinChat, emitLeaveChat, emitCreateMessage, receiveJoinChat, receiveLeaveChat, receiveMessage,
  readUniverse, readUniverses, readInventory, readChat, readChatOffset, readTopic, readTopicAtoms, 
};

export default actionCreators;

// (string)            intention   The queryDb hook, also used to create actionTypes
// (string)            method      HTTP method
// (string)            pathx       API path. If (method && path) an corresponding API route gets created
// (string or false)   auth        Authentication strategy
function createActionCreator(shape) {
  
  const { intention, method, pathx } = shape;
  const types = ['REQUEST', 'SUCCESS', 'FAILURE'].map(t => `${t}_${intention.replace(/[A-Z]/g, '_$&')}`.toUpperCase());
  
  const actionCreator = params => {
    log('.A.', intention, params ? JSON.stringify(params) : '');
    const promise = new Promise((resolve, reject) => {
      
      // Server : direct db middleware call
      if (isServer) require('../server/queryDb')(intention, params).then(resolve, reject);
      
      // Client : API call through XMLHttpRequest
      else {
        const xhr = new XMLHttpRequest();
        const isPost = method === 'post' || method === 'put';
        const path = isPost || !params ? pathx : 
          pathx.replace(/{([A-Za-z]*)}/g, (match, p1) => params[p1] || params);
          
        log(`+++ --> ${method} ${path}`, params);
        
        xhr.onerror = err => reject({ 
          intention,
          status: 0, 
          response: 'An error occured, check your internet connection: ' + err.message, 
        });
        
        xhr.open(method, path);
        
        xhr.onload = () => {
          const {status} = xhr;
          const response = JSON.parse(xhr.response);
          status === 200 ? resolve(response) : reject({ status, intention, response });
        };
        
        if (isPost) { // Stringifies objects before a POST request
          let form = new FormData();
          for (let key in params) {
            if (params.hasOwnProperty(key)) {
              const value = params[key];
              form.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
            }
          }
          xhr.send(form);
        }
        else xhr.send();
      }
    });
    
    promise.then(
      result => {
        if (!isServer) log(`+++ <-- ${intention}`, result);
      }, 
      ({ status, response, intention }) => {
        log('!!! API Action error', intention);
        log('!!! params', params);
        log('!!! response', status, response);
      });
    
    return { types, params, promise };
  };
  
  // getters
  actionCreator.getTypes = () => types;
  actionCreator.getShape = () => shape;
  
  return actionCreator;
}

const acAPI = Object.keys(actionCreators)
  .map(key => actionCreators[key])
  .filter(ac => typeof ac.getTypes === 'function');

const APISuccessTypes = acAPI
  .map(ac => ac.getTypes()[1]);
  
const APIFailureTypes = acAPI
  .map(ac => ac.getTypes()[2]);
  
const APIAuthFailureTypes = acAPI
  .filter(ac => ac.getShape().auth)
  .map(ac => ac.getTypes()[2]);
  
export function isAPIUnauthorized(action) {
  const { type, payload } = action;
  return APIAuthFailureTypes.indexOf(type) !== -1 && payload && payload.status === 401;
}

export function isAPISuccess(action) {
  return APISuccessTypes.indexOf(action.type) !== -1;
}

export function isAPIFailure(action) {
  return APIFailureTypes.indexOf(action.type) !== -1;
}
