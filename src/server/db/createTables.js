import fs from 'fs';
import r from 'rethinkdb';
import queryDb from './queryDb';
import log from '../../shared/utils/logTailor';

export default function createTables(conn) {
  
  return new Promise((resolve, reject) => {
    
    const tables = ['users', 'universes', 'topics', 'chats', 'messages', 'ballots', 'votes', 'images'];
    
    const defaultUser = { // has no image
      pseudo: 'admin',
      email: 'admin@aquest.tech',
      fullName: 'Super Admin',
      passwordHash: '$2a$10$m3jpaE2uelYFzoPTu/fG/eU5rTkmL0d8ph.eF3uQrdQE46UbhhpdW',
      creationIp: '192.168.0.1',
    };
    
    const defaultBallots = [
      {
        content: 'Thanks',
        description: 'Say thank you.',
        value: 1,
      },
      {
        content: 'Agree',
        description: 'You definitely agree.',
        value: 1,
      },
      {
        content: 'Disagree',
        description: 'No estoy de acuerdo amigo.',
        value: 0,
      },
      {
        content: 'Irrelevant',
        description: 'This sould not be here.',
        value: -1,
      },
      {
        content: 'Shocking',
        description: 'This hurts the community.',
        value: -10,
      },
    ];
    

    const wrapTableCreate = table => new Promise((resolve, reject) => 
      r.tableCreate(table).run(conn, (err, result) => {
        log(`+++ Created table ${table}`);
        
        err ? reject(err) : resolve();
      })
    );
    
    
    // Table creation
    Promise.all(tables.map(table => wrapTableCreate(table))).then(
      // First user creation
      () => {
        conn.close();
        log('+++ Inserting initial content...');
        queryDb('createUser', defaultUser).then(
        // Default ballots creation
          user => Promise.all(defaultBallots.map(ballot => 
            queryDb('createBallot', Object.assign({ userId: user.id }, ballot))
          )).then(
            // Default images creation
            ballots => fs.readdir('../s3/starting_images', (err, files) => {
              if (err) throw err;
              
              files.forEach(file => console.log(file));
              resolve();
            }),
            reject
          ),
          reject
        );
      },
      reject
    );
  });
}
