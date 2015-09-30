import r from 'rethinkdb';
import log from '../src/shared/utils/logTailor';

export default function createTables(conn) {
  
  return new Promise((resolve, reject) => {
    
    const tables = ['users', 'universes', 'topics', 'chats', 'messages', 'ballots', 'votes', 'images'];
    const datas = [
      {
        table: 'users',
        data: {
          id: 'admin',
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
    ];
    
    function chainTableCreate(i = 0) {
      
      return new Promise((resolve, reject) => {
        
        const table = tables[i];
        
        if (!table) resolve();
        else r.tableCreate(table).run(conn, (err, result) => {
          log(`+++ Created table ${table}`);
          
          if (err) reject(err);
          else chainTableCreate(i + 1).then(resolve, reject);
        });
      });
    }
    
    function chainInsert(i = 0) {
      
      return new Promise((resolve, reject) => {
        
        const toBeInserted = datas[i];
        if (!toBeInserted) resolve();
        else {
          const { table, data } = toBeInserted;
          const d = new Date().getTime();
          data.createdAt = d;
          data.updatedAt = d;
          r.table(table).insert(data).run(conn, (err, result) => {
            log(`+++ Inserted one item into table ${table}`);
            
            if (err) reject(err);
            else chainInsert(i + 1).then(resolve, reject);
          });
        }
      });
    }
    
    chainTableCreate().then(() => {
      chainInsert().then(resolve, reject);
    }, reject);
    
  });
}
