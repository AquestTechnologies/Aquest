import r from 'rethinkdb';
import log from '../src/shared/utils/logTailor';
import dbOptions from '../config/dev_rethinkdb';
import createTables from './createTables';

export default function initializeDatabase() {
  
  return new Promise((resolve, reject) => {
    
    r.connect(dbOptions, (err, conn) => {
      if (err) throw err;
      
      r.dbList().run(conn, (err, result) => {
        if (err) throw err;
        
        const { db } = dbOptions;
        if (result.indexOf(db) === -1) {
          
          log(`+++ The database called ${db} could not be found, creating a new one`); 
          r.dbCreate(db).run(conn, (err, result) => {
            if (err) throw err;
            
            createTables(conn).then(resolve, reject);
          });
        } 
        else resolve();
      });
    });
  });
}

initializeDatabase();