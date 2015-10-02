import r from 'rethinkdb';
import log from '../../shared/utils/logTailor';
import appConfig from '../../../config/dev_app';
import dbConfig from '../../../config/dev_rethinkdb';


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

const prepareUniverse = q => q.merge(universe => ({
  ballots: table('ballots').getAll(r.args(universe('relatedBallots'))).coerceTo('array'),
  imageUrl: table('images').get(r.args(universe('imageId')))('url')
})).without('imageId', 'userId', 'creationIp', 'createdAt', 'updatedAt');

const addVotesTo = q => q.merge(votable => ({
  votes: table('votes').filter({ votableId: votable('id')})
}));

// Adds timestamps and replaces undefined with null
const prepareInsertion = obj => {
  const d = new Date().getTime();
  const o = Object.assign({
    createdAt: d,
    updatedAt: d,
  }, obj);
  
  Object.keys(o).forEach(key => {
    if (o.hasOwnProperty(key) && o[key] === undefined) o[key] = null;
  });
  
  return o;
};

const createChat = (name, chattableId) => run(
  table('chats').insert(prepareInsertion({ name, chattableId }))
);

const createHandleFrom = string => string.replace(/((?![a-zA-Z0-9~!_\-\.\*]).)/g, '_');

const aggregate = cursor => cursor.toArray();

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
    .filter(user => r.or(user('email').eq(emailOrPseudo), user('pseudo').eq(emailOrPseudo)))
    .limit(1)
    .merge(user => ({
      imageUrl: table('images').get(r.args(user('imageId')))('url'),
    }))
    .without('creationIp', 'imageId')
  ),
  
  // READ UNIVERSES
  readUniverses: () => run(prepareUniverse(
    
    table('universes')
    .limit(universesLoadLimit)
  )).then(normalize),
  
  
  // READ UNIVERSE BY HANDLE
  readUniverseByHandle: ({ handle }) => run(prepareUniverse(
    
    table('universes')
    .filter({ handle })
    .limit(1)
  )),
  
  
  // READ CHATS
  readChats: ({ chattableId }) => run(
    
    table('chats')
    .filter({ chattableId })
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
    .without('updatedAt')
  ).then(normalize),
    
  
  // READ MESSAGES
  readMessages: ({ chatId, lastMessageId }) => {
    
    const x = table('messages').filter({ chatId }).orderBy('createdAt');
    const i = x.offsetsOf(lastMessageId);
    
    return run(addVotesTo(
      x.slice(i, i + messagesLoadLimit)
    )).then(aggregate);
      
    // Which is better ?
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
  )).then(aggregate),

  
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
  
  
  // CREATE UNIVERSE
  createUniverse: ({ userId, imageId, name, description, rules, relatedUniverses, creationIp }) => new Promise((resolve, reject) => {
    
    run(
      table('universes')
      .insert(prepareInsertion({ 
        userId, imageId, name, description, rules, relatedUniverses, creationIp,
        handle: createHandleFrom(name),
      }))
    ).then(
      result => {
        const id = result.generated_keys[0];
        const newBallot = { 
          userId,
          value: 1,
          content: name,
          description: 'Accurate', // ?
        };
        
        Promise.all([
          createChat(name + ' Agora', id),
          run(table('ballots').insert(prepareInsertion(newBallot)))
        ]).then(
          ([r1, r2]) => resolve({ // imageUrl is missing, delegated to client.
            id, name, description, rules, relatedUniverses, 
            ballots: defaultBallots.concat([Object.assign(newBallot, { 
              id: r2.generated_keys[0]
            })]) 
          }), 
          reject 
        );
      },
      reject
    );
  }),
  
  
  // CREATE TOPIC
  createTopic: ({ userId, universeId, title, atoms, creationIp }) => new Promise((resolve, reject) => {
    const handle = createHandleFrom(title);
    
    run(
      table('topics').insert(prepareInsertion({
        userId, universeId, title, atoms, creationIp, handle,
      }))
    ).then(
      result => {
        const id = result.generated_keys[0];
        
        createChat(title + ' Discution', result.generated_keys[0]).then(
          () => resolve({
            id, userId, universeId, title, atoms, handle,
          }), 
          reject
        );
      },
      reject
    );
  }),
  
  
  // CREATE USER
  createUser: ({ pictureId, pseudo, email, passwordHash, creationIp }) => run(
    
    table('users').insert(prepareInsertion({
      pseudo, email, passwordHash, creationIp, pictureId, 
    }))
  ).then(result => ({
    pseudo, email, pictureId, 
    id: result.generated_keys[0],
  })),
  
  
  // CREATE MESSAGE
  createMessage: ({ userId, chatId, atom }) => run(
    
    table('messages').insert(prepareInsertion({
      userId, chatId, atom,
    }))
  ).then(result => ({
    userId, chatId, atom,
    id: result.generated_keys[0]
  })),
  
  
  // CREATE IMAGE
  createImage: ({ userId, name, url, creationIp }) => run(
    
    table('images').insert(prepareInsertion({
      userId, name, url, creationIp,
    }))
  ).then(result => ({
    name, url,
    id: result.generated_keys[0]
  })),
  
  
  // CREATE BALLOT
  createBallot: ({ userId, content, value, description }) => run(
  
    table('ballots').insert(prepareInsertion({
      userId, content, value, description
    }))
  ).then(result => ({
    userId, content, value, description,
    id: result.generated_keys[0]
  })),
  
  
  // RANDOM ROW
  randomRow: ({ table }) => run(r.table(table).orderBy(row => r.random()).limit(1))
  
};


const queryDb = (intention, params) => {
  const d = new Date();
  const runQuery = builders[intention];
  
  if (runQuery) {
    const query = runQuery(params);
    query.then(() => log(`+++ <-- ${intention} after ${new Date() - d}ms`));
    
    return query;
  }
  else return Promise.reject(`No query builder found for your intention: ${intention}`);
  
};

export default queryDb;
