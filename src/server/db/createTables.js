import r from 'rethinkdb';
import log from '../src/shared/utils/logTailor';

export default function createTables(conn) {
  
  return new Promise((resolve, reject) => {
    
    const tables = ['users', 'universes', 'topics', 'chats', 'messages', 'ballots', 'votes', 'images'];
    const datas = [
      {
        table: 'users',
        data: {
          pseudo: 'admin',
          email: 'admin@aquest.tech',
          fullName: 'Super Admin',
          passwordHash: '$2a$10$m3jpaE2uelYFzoPTu/fG/eU5rTkmL0d8ph.eF3uQrdQE46UbhhpdW',
          creationIp: '192.168.0.1',
        }
      },
      {
        table: 'ballots',
        data: {
          content: 'Thanks',
          description: 'Say thank you.',
          value: 1,
        }
      },
      {
        table: 'ballots',
        data: {
          content: 'Agree',
          description: 'You definitely agree.',
          value: 1,
        }
      },
      {
        table: 'ballots',
        data: {
          content: 'Disagree',
          description: 'No estoy de acuerdo amigo.',
          value: 0,
        }
      },
      {
        table: 'ballots',
        data: {
          content: 'Irrelevant',
          description: 'This sould not be here.',
          value: -1,
        }
      },
      {
        table: 'ballots',
        data: {
          content: 'Shocking',
          value: -10,
        }
      },
      {
        table: 'ballots',
        data: {
          content: 'Startups',
          value: 1,
        }
      },
    ];
    
    function wrapTableCreate(table) {
      
      return new Promise((resolve, reject) => {
        r.tableCreate(table).run(conn, (err, result) => {
          log(`+++ Created table ${table}`);
          
          err ? reject(err) : resolve();
        });
      });
    }
    
    function wrapInsert({table, data}) {
      
      return new Promise((resolve, reject) => {
        const d = new Date().getTime();
        data.createdAt = d;
        data.updatedAt = d;
        data.deleted = false;
        
        r.table(table).insert(data).run(conn, (err, result) => {
          log(`+++ Inserted one item into table ${table}`);
          
          err ? reject(err) : resolve();
        });
      });
    }
    PASSER PAR QUERYDB
    Promise.all(tables.map(table => wrapTableCreate(table))).then(
      () => Promise.all(datas.map(data => wrapInsert(data))).then(
        () => {
          r.table('ballots').run(conn, (err, ballotsCursor) => {
            if (err) throw err;
            
            r.table('users').filter({pseudo: 'admin'}).run(conn, (err, adminUser) => {
              if (err) throw err;
              
              r.table('universes').insert({
                handle: 'Startups',
                name: 'Startups',
                creationIp: '0.0.0.0',
                
                
              });
            });
          });
        },
        reject
      ),
      reject
    );
    
  });
}
