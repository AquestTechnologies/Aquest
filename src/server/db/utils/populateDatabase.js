import fs from 'fs';
import queryDatabase from '../databaseMiddleware';
import log from '../../../shared/utils/logTailor';
import processImage from '../../plugins/uploads/processors/image';
import { randomInteger } from '../../../shared/utils/randomGenerators';

export default function populateDatabase(conn) {
  
  return new Promise((resolve, reject) => {
    
    const defaultUser = { // has no image
      pseudo: 'admin',
      email: 'admin@aquest.tech',
      fullName: 'Super Admin',
      passwordHash: '$2a$10$m3jpaE2uelYFzoPTu/fG/eU5rTkmL0d8ph.eF3uQrdQE46UbhhpdW',
      creationIp: '192.168.0.1',
    };
    
    const defaultUniverse = {
      name: 'Meta Aquest',
      description: 'Aquest is intriguing, right?',
      rules: 'Be nice please.',
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
    
    log('... Inserting initial content');
    log('... Default user:');
    
    queryDatabase('createUser', defaultUser).then(
      user => {
        
        const userId = user.id;
        
        log('... Default ballots:');
        
        Promise.all(defaultBallots.map(ballot => 
          queryDatabase('createBallot', Object.assign({ userId }, ballot))
        )).then(
          ballots => {
            const path = 'src/server/s3/starting_images/'; // config ?
            
            fs.readdir(path, (err, files) => {
              if (err) return reject(err);
              
              log('... Default images:');
              
              Promise.all(files.map(file => processImage(fs.createReadStream(path + file)))).then(
                data => {
                  
                  log('... Default universe:');
                  
                  queryDatabase('createUniverse', Object.assign(defaultUniverse, {
                    userId, imageId: data[randomInteger(0, data.length - 1)].id
                  })).then(resolve, reject);
                },
                reject
              );
            });
          },
          reject
        );
      },
      reject
    );
  });
}
