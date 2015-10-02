import r from 'rethinkdb';
import log from '../../shared/utils/logTailor';
import dbOptions from '../../../config/dev_rethinkdb';

export default function deleteDatabase() {
  
  return new Promise((resolve, reject) => {
    r.connect(dbOptions, (err, conn) => {
      if (err) return reject(err);
      
      r.dbList().run(conn, (err, result) => {
        if (err) return reject(err);
        
        const { db } = dbOptions;
        const closeConn = callback => {
          log('+++ Database deleted!');
          conn.close(callback);
        };
        
        if (result.indexOf(db) !== -1) {
          
          log(`+++ Deleting database ${db}...`); 
          r.dbDrop(db).run(conn, (err, result) => {
            if (err) return reject(err);
            
            closeConn(resolve);
          });
        } 
        else closeConn(resolve);
      });
    });
  });
}
