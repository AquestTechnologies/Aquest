import Joi from 'joi';

const userId    = Joi.string().trim().required().min(1).max(15).regex(/^[0-9a-zA-Z]{1,15}$/);
const chatId    = Joi.number().positive().integer().required().min(1);
const email     = Joi.string().email();
const password  = Joi.string().trim().required().min(6);

/**
 * Hapijs Joi validation schema
 * Description : This const defines a Joi validation schema that can be use against headers, query, params, payload, and auth.
 * Like data constraints might change over development time, they arn't "final" ( especially regex(/^.*$/) )
 * 
 * Structure : 
 * {
     intention: {
        headers || query || params || payload || auth :{
           <object_key>: <Joi constraint https://github.com/hapijs/joi>
        }
     }
 * }
 * */
const API_VALIDATION_SCHEMA = {
  
  createUser: {
    pseudo:       userId,
    email,
    password
  },
  
  createUniverse: {
    name:         Joi.string().trim().required().min(1).max(100),
    description:  Joi.string().trim().max(200),
    picture:      Joi.string().required().regex(/^http.+\.cloudfront\.net\/.+\.png$/),
    related:      Joi.array().required(),
    ranks:        Joi.array().required(),
  },
  
  createTopic: {
    title:        Joi.string().trim().required().min(1).regex(/^.*$/),
    universeId:   Joi.string().trim().required().min(1).regex(/^.*$/),
    atoms:        Joi.array().items(
      Joi.object().keys({
        type: Joi.string().trim().required().min(1),
        content: Joi.object().required(),
      }).unknown(false).required()).required(), 
  },
  
  login: {
    password,
    email: Joi.alternatives().try(userId, email),
  }
};

const WEBSOCKET_VALIDATION_SCHEMA = {
  joinChat: chatId,
  leaveChat: chatId,
  createMessage: {
    chatId,
    message: {
      id: Joi.string().trim().required().regex(/^lc-[0-9]+$/),      
      content:  Joi.object({
                  type: Joi.string().trim().required().min(1).regex(/^[0-9a-zA-Z]{1,}$/)
                }).unknown(true).required()
    }
  }
};  

export { API_VALIDATION_SCHEMA, WEBSOCKET_VALIDATION_SCHEMA };
