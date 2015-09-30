import Boom from 'boom';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import queryDb from '../queryDb.js';
import log, {logError} from '../../shared/utils/logTailor.js';
import devConfig from '../../../config/dev_server';
import actionCreators from '../../shared/actionCreators';
import { getAtomsValidationErrors, generatePreview } from '../../shared/components/atoms';
import {API_VALIDATION_SCHEMA as validationSchema} from '../validationSchema.js';

export default function apiPlugin(server, options, next) {
  
  const { key, ttl } = devConfig.jwt;
  const cookieOptions = {ttl, path: '/'};
  const createReason = (code, msg, err) => ({code, msg, err});
  
  // Allows validation and params mutation before querying db
  const beforeQuery = {
    
    createUser: (request, params) => new Promise((resolve, reject) =>
      bcrypt.genSalt(10, (err, salt) => {
        if (err) return reject(createReason(500, 'createUser bcrypt.genSalt', err));
        
        bcrypt.hash(params.password, salt, (err, hash) => {
          if (err) return reject(createReason(500, 'createUser bcrypt.hash', err));
          
          params.picture = '';
          params.passwordHash = hash;
          params.ip = request.info.remoteAddress;
          delete params.password;
          resolve();
        });
      })
    ),
    
    createUniverse: (request, params) => new Promise((resolve, reject) => {
      params.name = params.name.trim(),
      params.ip = request.info.remoteAddress;
      params.userId = JWT.decode(request.state.jwt).userId; // The real user id
      resolve();
    }),
    
    createTopic: (request, params) => new Promise((resolve, reject) => {
      const validationErrors = getAtomsValidationErrors(params.atoms); // On both client and server
      if (validationErrors.some(error => error)) return reject(createReason(400, validationErrors));
      
      params.title = params.title.trim(),
      params.userId = JWT.decode(request.state.jwt).userId; // The real user id
      
      // generatePreview(params.atoms[params.previewAtomPosition]).then(...)
      params.previewType = 'text',
      params.previewContent = {
        text: 'This needs to be generated dynamically.',
      };
      resolve();
    }),
  };
  
  // ...
  const afterQuery = {
    
    login: (request, {email, password}, result) => new Promise((resolve, reject) => {
      if (result) bcrypt.compare(password, result.passwordHash, (err, isValid) => {
        if (err) return reject(createReason(500, 'login bcrypt.compare', err));
        
        if (isValid) {
          delete result.passwordHash; // We know how to keep secrets
          
          resolve({
            userId: result.id,
            expiration: new Date().getTime() + ttl,
          });
        }
        else reject(createReason(401, 'Invalid password'));
      });
      else reject(createReason(401, 'User not found'));
    }),
    
    createUser: (request, params, result) => new Promise((resolve, reject) => {
      if (!result || !result.id) return reject(createReason(500, 'createUser no userId'));
      
      resolve({
        userId: result.id,
        expiration: new Date().getTime() + ttl,
      });
    }),
  };
  
  // Dynamic construction of the API routes from actionCreator with API calls
  for (let acKey in actionCreators) {
    
    const getShape = actionCreators[acKey].getShape || undefined;
    const { intention, method, pathx, auth } = getShape ? getShape() : {};
    
    if (method && pathx) {
      const before = beforeQuery[intention] || (() => Promise.resolve());
      const after  = afterQuery[intention]  || (() => Promise.resolve());
      
      server.route({
        method,
        path: pathx,
        config: {
          auth, 
          validate: { 
            payload: validationSchema[intention],
            failAction: (request, reply, source, error) => { 
              const { details } = error.data;
              log('... Joi failed:', details);
              reply(Boom.badRequest(JSON.stringify(details)));
            }
          }
        },
        handler: (request, reply) => {
          const requestToken = request.state.jwt;
          const response = reply.response().hold();
          const params = method === 'post' ? request.payload : Object.keys(request.params).length === 1 && request.params.p ? request.params.p : request.params;
          
          before(request, params).then(
            () => queryDb(intention, params).then(
              result => after(request, params, result).then(
                token => {
                  
                  response.source = result;
                  
                  if (token) response.state('jwt', JWT.sign(token, key), cookieOptions).send();
                  
                  else if (requestToken) JWT.verify(requestToken, key, (err, {userId, expiration}) => {
                    if (err) return handleError(response, 'handler JWT.verify', createReason(500, '', err));
                    
                    const t = new Date().getTime();
                    if (expiration > t) {
                      response.state('jwt', JWT.sign({userId, expiration: t + ttl}, key), cookieOptions);
                      log('... Token renewed');
                    }
                    response.send();
                  });
                  
                  else response.send();
                },
                
                handleError.bind(null, response, 'afterQuery')
              ),
              err => handleError(response, 'queryDb', createReason(500, '', err))
            ),
            handleError.bind(null, response, 'beforeQuery')
          );
        },
      });
    }
  }

  next();
  
  function handleError(response, origin, reason) {
    
    const code = reason.code || 500;
    const msg = reason.msg || '';
    const err = reason.err;
    
    log('!!! Error while API', origin);
    logError(msg, err);
    log('Replying', code);
    
    response.source = JSON.stringify(code < 500 ? msg : 'Internal server error');
    response.code(code).send();
  }
}

apiPlugin.attributes = {
  name:         'apiPlugin',
  description:  'REST API',
  main:         'API.js'
};
