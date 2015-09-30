// A promise wrapper around XMLHttpRequest
export default function uploadFile(file, fnProgress, fnLoad) {
  
  return new Promise((resolve, reject) => {
    
    const xhr = new XMLHttpRequest();
    
    if (typeof fnLoad === 'function') xhr.upload.addEventListener('load', fnLoad);
    if (typeof fnProgress === 'function') xhr.upload.addEventListener('progress', e => {
      fnProgress(Math.floor(e.loaded * 100 / e.total));
    });
    
    xhr.onerror = err => reject(err);
    xhr.open('post', '/uploadFile');
    xhr.onload = () => {
      const { status, response } = xhr;
      if (status === 200) resolve(JSON.parse(response));
      else reject({ status, response });
    };
    
    let form = new FormData();
    form.append('file', file);
    
    xhr.send(form);
  });
}
