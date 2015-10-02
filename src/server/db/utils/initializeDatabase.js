import r from 'rethinkdb';
import populateDatabase from './populateDatabase';
import log from '../../../shared/utils/logTailor';
import dbOptions from '../../../../config/dev_rethinkdb';
import chainPromises from '../../../shared/utils/chainPromises';

const tables = ['users', 'universes', 'topics', 'chats', 'messages', 'ballots', 'votes', 'images'];

export default function initializeDatabase() {
  log('... Initializing database');
  
  return new Promise((resolve, reject) => {
    
    r.connect(dbOptions, (err, conn) => {
      if (err) return reject(err);
      
      r.dbList().run(conn, (err, result) => {
        if (err) return reject(err);
        
        const { db } = dbOptions;
        const endThis = () => {
          log('... Database initialized!');
          conn.close(resolve);
        };
        
        const wrapTableCreate = table => new Promise((resolve, reject) => 
          r.tableCreate(table).run(conn, (err, result) => {
            log(`+++ Created table ${table}`);
            
            err ? reject(err) : resolve();
          })
        );
        
        if (result.indexOf(db) === -1) chainPromises([
          () => r.dbCreate(db).run(conn),
          () => log(`+++ Created database ${db}`),
          () => Promise.all(tables.map(table => wrapTableCreate(table))),
          populateDatabase
        ]).then(endThis, reject);
        else endThis();
      });
    });
  });
}
