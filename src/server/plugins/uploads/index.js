import Joi from 'joi';
import Boom from 'boom';
import JWT from 'jsonwebtoken';
import queryDatabase from '../../db/databaseMiddleware';
import log, {logError} from '../../../shared/utils/logTailor';
import imageProcessor from './processors/image';
import defaultProcessor from './processors/default';


export default function uploadsPlugin(server, options, next) {
  
  // A list of authorized MIME type
  // paired with a file processor
  const processors = [
    {
      MIMERegex: /image\/*/,
      processor: imageProcessor
    },
    {
      MIMERegex: /application\/pdf/,
      processor: defaultProcessor
    },
  ];
  
  server.route([
    {
      method: 'POST',
      path: '/uploadFile', // Useless for now, can be hurtful if a user messes around
      config: {
        auth: 'jwt', // Auth required
        payload:{
          parse: true, // Converts payload with 'Content-type' into an object (true is the default)
          output:'stream', // With parse: true, field are text and files are stream
          maxBytes: 5 * 1024 * 1024, // 5 MB
        },
        validate: { 
          payload: {
            file: Joi.object({ // From Joi#472
              pipe: Joi.func().required()
            }).unknown()
          },
          failAction: (request, reply, source, error) => { 
            const { details } = error.data;
            log('... Joi failed:', details);
            reply(Boom.badRequest(JSON.stringify(details)));
          }
        }
      },
      handler: (request, reply) => {
        
        const { file } = request.payload; // Stream
        const fileName = file.hapi.filename;
        const MIMEType = file.hapi.headers['content-type'];
        const { userId } = JWT.decode(request.state.jwt); // No need to try/catch token malformations because auth plugin validated it
        
        log('Received file:', userId, fileName);
        
        const typeMatch = processors.find(({MIMERegex}) => MIMERegex.test(MIMEType));
        
        if (!typeMatch) reply(Boom.unsupportedMediaType('That media is not supported')); // 415
        else typeMatch.processor(file).then( // Processes the stream
          ({ name, url }) => {
            
            log('Upload processed, will query DB');
            
            // Inserts a record of who uploaded the file
            queryDatabase('createFile', { url, name, userId, ip: request.info.remoteAddress }).then(
              () => {
                log('Upload complete: ', name);
                reply({url});
              },
              
              err => {
                logError('queryDatabase', err);
                reply(Boom.badImplementation(err.message)); // 500, args are not sent to client, just logged by Boom on server
              }
            );
          },
          err => {
            logError('file processing', err);
            reply(Boom.badImplementation(err.message));
          }
        );
      }
    },
    {
      method: 'POST',
      path: '/uploadImage',
      config: {
        auth: 'jwt', // Auth required
        payload:{
          parse: true, // Converts payload with 'Content-type' into an object (true is the default)
          output:'stream', // With parse: true, field are text and files are stream
          maxBytes: 5 * 1024 * 1024, // 5 MB
        },
        validate: { 
          payload: {
            file: Joi.object({ // From Joi#472
              pipe: Joi.func().required()
            }).unknown()
          },
          failAction: (request, reply, source, error) => { 
            const { details } = error.data;
            log('... Joi failed:', details);
            reply(Boom.badRequest(JSON.stringify(details)));
          }
        }
      },
      handler: (request, reply) => {
        
        const { userId } = JWT.decode(request.state.jwt); // No need to try/catch token malformations because auth plugin validated it
        log('... Receiving image from ', userId);
        
        const { file } = request.payload; // Stream
        const MIMEType = file.hapi.headers['content-type'];
        const typeMatch = /image\/*/.test(MIMEType);
        
        if (!typeMatch) reply(Boom.unsupportedMediaType('That media is not supported')); // 415
        else imageProcessor(file).then( // Processes the stream
          ({ name, url }) => {
            
            log('... Upload processed, querying DB');
            
            queryDatabase('createImage', { url, name, userId, creationIp: request.info.remoteAddress }).then(
              ({ id }) => {
                log('... Upload complete, replying ', id);
                reply({ url, id });
              },
              
              err => {
                logError('queryDatabase', err);
                reply(Boom.badImplementation(err.message)); // 500, args are not sent to client, just logged by Boom on server
              }
            );
          },
          err => {
            logError('file processing', err);
            reply(Boom.badImplementation(err.message));
          }
        );
      }
    }
  ]);
  
  next();
}

uploadsPlugin.attributes = {
  name:         'uploadsPlugin',
  description:  'A file upload handler',
};
