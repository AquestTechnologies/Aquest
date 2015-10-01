import r from 'rethinkdb';
import log from '../shared/utils/logTailor';
import dbConfig from '../../config/dev_rethinkdb';

let connection;
r.connect(dbConfig, (err, conn) => {
  if (err) throw err;
  connection = conn;
});

export default function queryDb(intention, params) {
  const d = new Date();
  
  return !connection ? 
    Promise.reject('!!! Not connected to database') :
    new Promise((resolve, reject) => {
      
      const {query, callback} = buildQuery(intention, params);
      
      if (query) query.run(connection, (err, result) => {
        if (err) return reject(err);
        
        log(`+++ <-- ${intention} after ${new Date() - d}ms`);
        resolve(callback ? callback(result) : result);
      });
      
      else reject(`queryDb.buildQuery did not yield, check your intention: ${intention}`);
      
    });
  
  
  // Builds the SQL query and optionnal callback
  function buildQuery(intention, params) {
    
    const {userId, universeId, title, chatId, offset, atoms, content, name, description, previewType, previewContent, pseudo, email, passwordHash, ip, picture, url} = 
      typeof params === 'object' && !Array.isArray(params) ? params : {};
      
    // Define the maximum number of messages to load
    const nbrChatMessages = 30;
    let query, callback;
    
    switch (intention) {
      
      
      case 'readUniverses':
        
        // sql = 
        // 'SELECT ' + 
        //   'id, name, description, picture, chat_id "chatId", rules ' +
        // 'FROM ' + 
        //   'aquest_schema.universe';
        
        // break;
        
        query = r.table('universes').merge(universe => ({
          'ballots': r.table('ballots').get_all()
        }));
        callback = cursor => cursor.toArray();
        
        
      case 'readUniverse':
        
        // sql = 
        // 'SELECT ' + 
        //   'id, name, description, picture, chat_id "chatId" ' +
        // 'FROM ' +
        //   'aquest_schema.universe ' +
        // 'WHERE ' +
        //   'id = $1';
        
        // paramaterized = [params];
        // callback = rows => rows[0] || {id: params, notFound: true};
        
        // break;
        
        return r.tables('universes').filter({ id: params });
        
        
      // case 'readUniverseWithTopics':
        
      //   sql =
      //   'SELECT ' + 
      //     'aquest_schema.concat_json_object(' +
      //       'to_json(universe),' +
      //       `json_build_object('topics',` +
      //         'array_agg(' + 
      //           'json_build_object(' +
      //             `'id',topics.id,` +
      //             `'title',topics.title,` +
      //             `'universeId',topics.universe_id,` +
      //             `'author',topics.user_id,` +
      //             `'timestamp',topics.updated_at,` +
      //             `'chatId',topics.chat_id` +
      //           ')' + 
      //         ')' +
      //       ')' +
      //     ') as "UniverseWithTopics"' +   
      //   'FROM (' +
      //     'SELECT ' +    
      //       'universe, topic.* ' +
      //     'FROM' +   
      //       '(SELECT universe.id, universe.name, universe.description, universe.picture, universe.chat_id "chatId" FROM aquest_schema.universe WHERE universe.id = $1) universe ' +  
      //       'LEFT JOIN aquest_schema.topic ON universe.id = topic.universe_id ' +
      //   ') topics GROUP BY universe';
        
      //   paramaterized = [params];
      //   callback = rows => rows[0].UniverseWithTopics;
        
      //   break;
        
        
      case 'readChatOffset':
        
        sql = 
        'SELECT ' +
          'json_build_object(' + 
            `'id', chat.id,` + 
            `'name', chat.name,` + 
            `'messages', array_agg(` + 
              'json_build_object(' + 
                `'id', atommessage.id,` +
                `'userId', aquest_user.id,` + 
                `'type', atommessage.type,` +
                `'content', atommessage.content,` +
                `'createdAt', atommessage.created_at` +
              ')' + 
            ')' + 
          ') as chat ' +
        'FROM ' +
          'aquest_schema.chat ' +
        `LEFT JOIN (SELECT * FROM (SELECT * from aquest_schema.atommessage ORDER BY id DESC OFFSET $2 LIMIT ${nbrChatMessages}) atommessagedesc ORDER BY id ASC) AS atommessage ON chat.id = atommessage.chat_id ` +
        'LEFT JOIN aquest_schema.user aquest_user ON atommessage.user_id = aquest_user.id ' +
        'WHERE chat.id = $1 GROUP BY chat.id';
          
        paramaterized = [chatId, offset];
        
        callback = rows => {
          const chat = rows[0] ? rows[0].chat : {
            id: chatId,
            notFound: true,
          };
          
          if (chat.messages && !chat.messages[0].content) chat.messages = [];
          
          return chat;
        };
        
        break;
        
      case 'readChat':
        
        sql = 
        'SELECT ' +
          'json_build_object(' + 
            `'id', chat.id,` + 
            `'name', chat.name,` + 
            `'firstMessageId', (SELECT id FROM aquest_schema.atommessage WHERE atommessage.chat_id = $1 ORDER BY id ASC LIMIT 1),` +
            `'messages', array_agg(` + 
              'json_build_object(' + 
                `'id', atommessage.id,` +
                `'userId', aquest_user.id,` + 
                `'type', atommessage.type,` +
                `'content', atommessage.content,` +
                `'createdAt', atommessage.created_at` +
              ')' + 
            ')' +
          ') as chat ' +
        'FROM ' +
          'aquest_schema.chat ' +
        `LEFT JOIN (SELECT * FROM (SELECT * from aquest_schema.atommessage ORDER BY id DESC LIMIT ${nbrChatMessages}) atommessagedesc ORDER BY id ASC) AS atommessage ON chat.id = atommessage.chat_id ` +
        'LEFT JOIN aquest_schema.user aquest_user ON atommessage.user_id = aquest_user.id ' +
        'WHERE chat.id = $1 GROUP BY chat.id';
          
        paramaterized = [params];
        
        callback = rows => {
          const chat = rows[0] ? rows[0].chat : {
            id: chatId,
            notFound: true,
          };
          
          if (chat.messages && !chat.messages[0].content) chat.messages = [];
          
          return chat;
        };
        
        break;
        
        
      case 'readInventory':
          
        sql =
        'SELECT ' + 
          `id, title, universe_id "universeId", user_id "userId", preview_type "previewType", preview_content "previewContent", COALESCE(to_char(created_at, 'MM-DD-YYYY HH24:MI:SS'), '') "createdAt", chat_id "chatId" ` +
        'FROM ' +    
          'aquest_schema.topic ' +
        'WHERE ' + 
          'topic.universe_id = $1';
        
        paramaterized = [params];
        
        break;  
        
        
      case 'readTopic':
        
        sql =
        'SELECT json_build_object(' +
          `'id', topic.id,` +
          `'userId', topic.user_id,` +
          `'chatId', topic.chat_id,` +
          `'universeId', topic.universe_id,` +
          `'title', topic.title,` +
          `'previewContent', topic.preview_content,` +
          `'previewType', topic.preview_type,` +
          `'createdAt', COALESCE(to_char(topic.created_at, 'MM-DD-YYYY HH24:MI:SS'), ''),` +
          `'atoms', atomtopic.atoms` +
        ') as topic ' +
        'FROM aquest_schema.topic ' +
        'LEFT JOIN ' +
          '(SELECT ' +
            'atomtopic.topic_id, ' +
            'array_agg(' +
              'json_build_object(' +
                `'type', atomtopic.type,` +
                `'content', atomtopic.content` +
              ') ' +
              'ORDER BY atomtopic.position ' +
            ') as atoms ' +
          'FROM aquest_schema.atomtopic ' +
          'GROUP BY atomtopic.topic_id' +
          ') as atomtopic ' +
        'ON topic.id = atomtopic.topic_id ' +
        'WHERE topic.id = $1';
        
        paramaterized = [params];
        callback = rows => rows[0] ? rows[0].topic : {id: params, notFound: true};
        
        break;
        
        
      case 'readTopicAtoms':
        
        sql =
        'SELECT ' +
          'type, content ' +
        'FROM ' +
          'aquest_schema.atomtopic ' +
        'WHERE ' +
          'atomtopic.topic_id = $1 ' + 
        'ORDER BY ' + 
          'atomtopic.position';
        
        paramaterized = [params];
        
        break;
        
        
      case 'createMessage':
        // atomTopicId, content, ordered, deleted, topicId, atomId
        
        sql = 
        'INSERT INTO aquest_schema.atommessage ' +
          '(chat_id, user_id, type, content) ' +
        'VALUES' +
          '($1, $2, $3, $4) ' +
        "RETURNING json_build_object('id', id, 'chatId', chat_id, 'type', type, 'content', content) AS message";
        
        paramaterized = [chatId, userId, 'text', JSON.stringify(content)];
        callback = rows => rows[0].message;
        
        break;
        
        
      case 'createUniverse':
        
        sql = 
        'INSERT INTO aquest_schema.universe ' +
          '(name, user_id, description, picture, creation_ip) ' +
        'VALUES ' +
          '($1, $2, $3, $4, $5) ' +
        `RETURNING json_build_object('id', id, 'chatId', chat_id, 'name', name, 'description', description, 'picture', picture, 'rules', rules) AS universe`;
        
        paramaterized = [name, userId, description, picture, ip];
        callback = rows => rows[0].universe;
        
        break;
        
        
      case 'createTopic':
        
        sql = 
        'SELECT ' + 
          'aquest_schema.create_topic($1, $2, $3, $4, $5, $6) ' +
        'AS topic';
        
        paramaterized = [userId, universeId, title, previewType, JSON.stringify(previewContent), JSON.stringify(atoms)];
        callback = rows => rows[0].topic;
        
        break;
        
        
      case 'createUser':
        
        sql = 
        'INSERT INTO aquest_schema."user" ' +
          '(id, email, password_hash, creation_ip, picture) ' +
        'VALUES ' +
          '($1, $2, $3, $4, $5)' +
        "RETURNING json_build_object('id', id, 'email', email, 'picture', picture) AS user";
        
        paramaterized = [pseudo, email, passwordHash, ip, picture];
        callback = rows => rows[0].user;
        
        break;
        
        
      case 'login':
        
        sql = 
        'SELECT ' +
          'id, email, bio, first_name "firstName", last_name "lastName", picture, password_hash "passwordHash"' +
        'FROM aquest_schema."user" ' +
        `WHERE "user".id = '${email}' OR "user".email = '${email}' LIMIT 1`;
        
        callback = rows => rows[0];
        
        break;
        
      case 'createFile':
        sql = 
        'INSERT INTO aquest_schema.file ' +
          '(user_id, name, url, creation_ip) ' +
        'VALUES ' +
          '($1, $2, $3, $4)';
        
        paramaterized = [userId, name, url, ip];
        callback = rows => rows[0];
        
        break;
        
      case 'randomRow':
        
        sql = `SELECT * FROM aquest_schema.${params} ORDER BY RANDOM() LIMIT 1`;
        
        callback = rows => rows[0];
        
        break;
    }
    
    return {sql, callback, paramaterized};
  }
}
