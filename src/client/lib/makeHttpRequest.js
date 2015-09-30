import log from '../../shared/utils/logTailor';

// A promise wrapper around XMLHttpRequest 
export default function makeHttpRequest(method, path, params) {
  
  log('... makeHttpRequest', method, path, params);
  if (!method || !path) return Promise.reject(new Error('makeHttpRequest: method or path arg missing'));
  
  return new Promise((resolve, reject) => {
    
    const xhr = new XMLHttpRequest();
    xhr.onerror = err => reject(err);
    
    xhr.open(method, path);
    xhr.onload = () => {
      const { status, response } = xhr;
      if (status === 200) resolve(JSON.parse(response));
      else reject({ status, response });
    };
    
    if (params) {
      let form = new FormData();
      for (let key in params) { 
        if (params.hasOwnProperty(key)) form.append(key, params[key]); 
      } 
      
      xhr.send(form);
    } 
    
    else xhr.send(); // Bon voyage !
  });
}