import r from 'rethinkdb';
import log from '../src/shared/utils/logTailor';
import dbOptions from '../config/dev_rethinkdb';
import createTables from './createTables';

export default function initializeDatabase() {
  
  return new Promise((resolve, reject) => {
    
    r.connect(dbOptions, (err, conn) => {
      if (err) return reject(err);
      
      
      r.dbList().run(conn, (err, result) => {
        if (err) return reject(err);
        
        const { db } = dbOptions;
        const closeConn = callback => {
          log('+++ Database initialized');
          conn.close(callback);
        };
        
        if (result.indexOf(db) === -1) {
          
          log(`+++ The database called ${db} could not be found, creating a new one`); 
          r.dbCreate(db).run(conn, (err, result) => {
            if (err) return reject(err);
            
            createTables(conn).then(() => closeConn(resolve), reject);
          });
        } 
        else closeConn(resolve);
      });
    });
  });
}
