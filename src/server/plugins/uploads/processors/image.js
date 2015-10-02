import gm from 'gm';
import uuid from 'uuid';
import { uploadStreamToS3 } from '../../../s3/queryS3';
import log from '../../../../shared/utils/logTailor';

// To use this you must have GraphicsMagick on your local machine
// First download and install the png (libpgn) and jpeg (jpegsrc) delegates from ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/delegates/
// Then download and install GraphicsMagick from http://www.graphicsmagick.org/download.html
// Finally check if every needed image format is supported by typing: 'gm convert -list formats'
// If your encounter 'gm: error while loading shared libraries: libjpeg.so.9: cannot open shared object file: No such file or directory' do: 
// sudo ranlib /usr/local/lib/libjpeg.a
// sudo ldconfig /usr/local/lib
// And retry 'gm convert -list formats', JPEG and PNG should be there.

// -- Config --
const maxWidth = 1200;

// This plugin does not handle errors from unsupported image format (delegate not found)
// Which is bad
export default fileStream => !fileStream.pipe ? 
  Promise.reject('processImage - arg is not a stream') :
  new Promise((resolve, reject) => {
    log('... Processing image');
    
    // To identify() then write() or stream() a stream
    // gm buffers the stream in memory... https://github.com/aheckmann/gm#streams
    // Not knowing if this is as bad as it looks I'm doing it anyway
    
    const image = gm(fileStream) // Full stream image processing!
    .identify({bufferStream: true}, (err, data) => { // Not really, it's a buffer now...
      if (err) return reject(err);
      // console.log(data)
      const { format, size: { width } } = data;
      
      // Gif are cool enough to keep on being gif, any other format gets converted.
      const newFormat = format === 'GIF' ? 'gif' : 'png';
      const name = `${uuid.v1()}.${newFormat}`; 
      
      image
      .autoOrient() // Seems to be needed
      .resize(width > maxWidth ? maxWidth : null) // Resizes if necessary
      .stream(newFormat, (err, stdout, stderr) => {
        if (err) return reject(err);
        
        uploadStreamToS3(stdout, name, 'public-read').then(
          url => resolve({ url, name }),
          reject
        );
      });
    });
  });
