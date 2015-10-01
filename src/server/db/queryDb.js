import r from 'rethinkdb';
import log from '../shared/utils/logTailor';
import appConfig from '../../config/dev_app';
import dbConfig from '../../config/dev_rethinkdb';


/* Connection and configuration */

let connection;
r.connect(dbConfig, (err, conn) => {
  if (err) throw err;
  connection = conn;
});
// TODO: handle deconnections

const table = r.table;
const { topicsLoadLimit, messagesLoadLimit, universesLoadLimit, defaultBallots } = appConfig;


/* Runner to handle errors */

export const run = query => new Promise((resolve, reject) => 
  query.run(connection, (err, result) => {
    if (err) return reject(err);
    if (result.errors) return reject(result.first_error);
    
    resolve(result);
  })
);


/* Shared functions among builders */

const filterDeleted = q => q.filter({ deleted: false }).without('deleted');

const prepareUniverse = q => q.merge(universe => ({
  ballots: table('ballots').getAll(r.args(universe('relatedBallots'))).coerceTo('array'),
  imageUrl: table('images').get(r.args(universe('imageId')))('url')
})).without('deleted', 'imageId', 'userId', 'creationIp', 'createdAt', 'updatedAt');

const addVotesTo = q => q.merge(votable => ({
  votes: table('votes').filter({ votableId: votable('id')})
}));

const addCommonFlags = obj => {
  const d = new Date().getTime();
  
  return Object.assign({
    createdAt: d,
    updatedAt: d,
    deleted: false,
  }, obj);
};

const createChat = (name, chattableId) => run(table('chats').insert(addCommonFlags({
  name, chattableId
})));

const cursorToArray = cursor => cursor.toArray();

const normalize = cursor => {  
  const obj = {};
  cursor.toArray().forEach(o => {
    obj[o.id] = o;
  });
  
  return obj;
};
  

/* Builders return a Promise that resolves the data */

const builders = {
  
  
  // READ USER
  readUser: ({ emailOrPseudo }) => run(
    
    table('users')
    .filter(user => r.and(r.or(user('email').eq(emailOrPseudo), user('pseudo').eq(emailOrPseudo)), user('deleted').eq(false)))
    .limit(1)
    .merge(user => ({
      imageUrl: table('images').get(r.args(user('imageId')))('url'),
    }))
    .without('deleted', 'creationIp', 'imageId')
  ),
  
  // READ UNIVERSES
  readUniverses: () => run(prepareUniverse(
    
    table('universes')
    .filter({ deleted: false })
    .limit(universesLoadLimit)
  ))
  .then(normalize),
  
    
  // READ UNIVERSE BY HANDLE
  readUniverseByHandle: ({ handle }) => run(prepareUniverse(
    
    table('universes')
    .filter({ handle, deleted: false })
    .limit(1)
  )),
  
  
  // READ CHATS
  readChats: ({ chattableId }) => run(
    
    table('chats')
    .filter({ chattableId, deleted: false })
    .merge(chat => ({
      messages: addVotesTo(
        table('messages')
        .filter({ 
          chatId: chat('id'),
          deleted: false
        })
        .orderBy('createdAt')
        .limit(messagesLoadLimit)
      ),
    }))
    .without('deleted', 'updatedAt')
  )
  .then(normalize),
    
  
  // READ MESSAGES
  readMessages: ({ chatId, lastMessageId }) => {
    
    const x = table('messages').filter({ chatId }).orderBy('createdAt');
    const i = x.offsetsOf(lastMessageId);
    
    return run(addVotesTo(filterDeleted(x.slice(i, i + messagesLoadLimit))))
      .then(cursorToArray);
      
    // Which is better ?
    // query: addVotesTo(
      // x
      // // .skip(x.offsetsOf(r.row('id').eq(lastMessageId)))
      // .skip(x.offsetsOf(lastMessageId))
      // .limit(messagesLoadLimit)
    // ),
  },
  
  
  // READ TOPICS
  readTopics: ({ universeId }) => run(addVotesTo(
    
    table('topics')
    .filter({ 
      universeId,
      deleted: false
    })
    .orderBy('createdAt')
    .limit(topicsLoadLimit)
    .without('atoms', 'creationIp', 'deleted')
  ))
  .then(cursorToArray),

  
  // READ TOPIC
  readTopic: ({ topicId }) => run(addVotesTo(
    
    table('topics').get(topicId)
    .filter({ deleted: false })
    .without('creationIp', 'deleted')
  )),
  
  // READ TOPIC ATOMS
  readTopicAtoms: ({ topicId }) => run(
    
    table('topics').get(topicId)('atoms')
  ),
  
  
  // CREATE USER
  createUser: ({ pictureId, pseudo, email, passwordHash, creationIp }) => run(
    
    table('users').insert(addCommonFlags({
      pseudo, email, passwordHash, creationIp, pictureId, 
    })))
    .then(result => ({
      pseudo, email, pictureId, 
      id: result.generated_keys[0],
    })),
  
  
  // CREATE UNIVERSE
  createUniverse: ({ userId, imageId, name, description, rules, relatedUniverses, creationIp }) => new Promise((resolve, reject) => {
    
    const handle = 'yolo';
    
    run(
      table('universes')
      .insert(addCommonFlags({ 
        userId, imageId, handle, name, description, rules, relatedUniverses, creationIp,
      }))
    ).then(
      result => {
        const id = result.generated_keys[0];
        const newBallot = { content: name, value: 1 };
        
        Promise.all([
          createChat(name + ' Agora', id),
          run(
            table('ballots')
            .insert(addCommonFlags(newBallot))  
          ).then(result => result.generated_keys[0])
        ])
        .then(
          ([chatResult, ballotResult]) => resolve({ 
            id, name, description, rules, relatedUniverses, 
            ballots: Object.assign({}, defaultBallots, Object.assign(newBallot, { 
              id: ballotResult.generated_keys[0]
            }))
            
          }), // imageUrl is missing, delegated to client.
          reject 
        );
      },
      reject
    );
      
      
    
  }),
  
  
  // CREATE MESSAGE
  createMessage: ({ userId, chatId, atom }) => ({
    
    query: table('messages').insert(addCommonFlags({
      userId, chatId, atom,
    })),
    
    callback: result => ({
      userId, chatId, atom,
      id: result.generated_keys[0],
    })
  }),
  
  
  // CREATE IMAGE
  createImage: ({ userId, name, url, creationIp }) => ({
    
    query: table('images').insert(addCommonFlags({
      userId, name, url, creationIp,
    })),
    
    callback: result => ({
      name, url,
      id: result.generated_keys[0],
    })
  }),
  
  
  // RANDOM ROW
  randomRow: ({ table }) => ({
    
    query: r.table(table).orderBy(row => r.random()).limit(1),
  })
  
};


const queryDb = (intention, params) => {
  const d = new Date();
  const builder = builders[intention];
  
  if (builder) {
    const x = builder(params);
    x.then(() => log(`+++ <-- ${intention} after ${new Date() - d}ms`));
    
    return x;
  }
  else return Promise.reject(`No query builder found for your intention: ${intention}`);
  
};

export default queryDb;
