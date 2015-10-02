// import log from '../../../../shared/utils/logTailor';
import { uploadStreamToS3 } from '../../../s3/queryS3';

// The default processor for any file types
export default function processAnyFile(fileStream) {
  
  // Simply uploads the stream to S3 while keeping its name unchanged
  return new Promise((resolve, reject) => {
    
    const name = fileStream.hapi.filename;
    
    // Full stream file processing!
    uploadStreamToS3(fileStream, name, 'public-read').then(
      url => resolve({ name, url }),
      err => reject(err)
    );
  });
}
