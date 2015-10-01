import fs from 'fs';
import r from 'rethinkdb';
import log from '../../shared/utils/logger';
import { run } from './queryDb';
import appConfig from '../../../config/dev_app.js';

export default function importDefault() {
  
  log('... Importing defaults from database');
  
  return new Promise((resolve, reject) => {
    
    fs.readdir('src/server/s3/starting_images/', (err, files) => {
      if (err) return reject(err);
      
      Promise.all([
        run(
          r.table('ballots')
          .filter({ deleted: false })
          .orderBy('createdAt')
          .limit(5)
          .without('deleted', 'createdAt', 'updatedAt')
        ),
        run(
          r.table('images')
          .filter({ deleted: false })
          .orderBy('createdAt')
          .limit(files.length)
          .pluck('id', 'url')
        )
      ]).then(
        values => {
          appConfig.defaultBallots = values[0];
          appConfig.defaultUniverseImages = values[1];
        } ,
        reject
      );
    });
  });
}
