import AWS from 'aws-sdk';
import { accessKeyId, secretAccessKey, imageBucketName, cloudFrontDomainName } from '../../../config/dev_aws';


// This is sooooo unsecure, before prod we need to use something more recommended
// http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html
AWS.config.update({accessKeyId, secretAccessKey});

export function uploadStreamToS3(localStream, Key, ACL) {
  
  return new Promise((resolve, reject) => {
    
    new AWS.S3().upload({ 
      ACL,
      Key,
      Body: localStream,
      Bucket: imageBucketName,
    })
    // .on('httpUploadProgress', e => log('Uploading stream to S3...', Math.round(100 * e.loaded / e.total) + '%'))
    .send((err, data) => err ? reject(err) : resolve(cloudFrontDomainName + Key));
  });
}
