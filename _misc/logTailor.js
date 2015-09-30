import path from 'path';
import isClient from './isClient';

export default function log(args) {
  
  let filePath, logConfiguration;  
  let isServer = !isClient();
  
  if (isServer) {
    let fileLocation = path.join(__dirname.substring(0, __dirname.indexOf('/src/')), 'log');
    // console.log('file location : ' + fileLocation);
    
    let fileName = "info.log";
    filePath = path.join(fileLocation, fileName);
    // console.log('filepath : ' + filePath);
    
    logConfiguration = {
      separator: ' -- ',
      template: [
        // { date:['day','sep/','month','sep/','year','sep-','hours','sep:','minutes'] },
        { date:['day','sep/','month','sep/','year','sep-','hours','sep:','minutes'] },
        { dataLog: true }
      ]
    };
  } else {
    logConfiguration = {
      separator: ' -- ',
      template: [
        { dataLog: true }
      ]
    };
  }
  
  /**
   * @objectName		:   -
   * @functionName	:	printObject	
   * @description		:	affiche un objet javascript sous une forme lisible
   * 
   * @param {obj}    Objet à afficher
   * @param {indent} Indentation à afficher
   * @return			  :   Une chaine de caractère contenant l'objet indenté
   * 
   * */
  function printObject(obj, indent){
    let isArray = Array.isArray(obj) ? true : false;
    let allObject = '';
    
    if(isArray){allObject += '[\n';}
    else{allObject += '{\n'};
    
    let objLength = Object.keys(obj).length;
    let i=0;
    for (let objKey in obj) {
      if (obj.hasOwnProperty(objKey)) {
          if(!isArray){allObject += indent + '"' + objKey + '": ';}
          if(obj[objKey] === null || obj[objKey] === "undefined" || Object.keys(obj[objKey]).length === 0){
            allObject += '""';
            if(i<objLength-1){allObject += ',';}
          } else if(typeof obj[objKey] === 'object'){
            allObject += printObject(obj[objKey], indent + ' ');
            if(i<objLength-1){allObject += ',';}
          }
          else {
            allObject += '"' + obj[objKey] + '"';
            if(i<objLength-1){allObject += ',';}
          }
          allObject += '\n';
      }
      i++;
    }
    
    if(isArray){allObject += indent + ']\n';}
    else{allObject += indent + '}\n';}
    
    return allObject;
  }
  
  
  function transformDate(dateTable){
    let d = new Date();
    let transformedDate = '';
    
    dateTable.forEach(function(data) {
      if (data.substring(0, 3) == 'sep') {
        transformedDate += data.substring(3, data.length);
      }
      else{
        switch(data){
          case 'day':
            transformedDate += d.getDate();
            break;
            
          case 'month':
            transformedDate += d.getMonth()+1;
            break;
            
          case 'year':
            transformedDate += d.getFullYear();
            break;
            
          case 'hours':
            transformedDate += d.getHours()+2;
            break;
            
          case 'minutes':
            transformedDate += d.getMinutes();
            break;
        }
      }
    });
    
    return transformedDate;
  }
  
  let dataLog = '';
  let formatData = '';
  
  //console.log(arguments + ' ' + typeof arguments + ' ' + arguments.length);
  /**
   * Il est déconseillé d'utiliser slice sur les arguments
   * car cela peut empêcher certaines optimisations des moteurs JavaScripts. 
   * Pour ce scénario, on peut par exemple 
   * construire un nouveau tableau en parcourant l'objet arguments.
   * CF : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Fonctions/arguments
   */
   
  //Array.prototype.slice.call(arguments).forEach(function(argument){});
  
  //Attention arguments est un objet, et non un tableau, même si on peut le parcourir
  for(let i=0, argsTabLength = arguments.length; i < argsTabLength; i++){
    if(i!=0 && i != argsTabLength -1){
      dataLog += logConfiguration.separator;
    }
    
    if ((typeof arguments[i] === 'object' || Array.isArray(arguments[i])) && !(Object.getOwnPropertyNames(arguments[i]).length === 0)){
      if(arguments[i].hasOwnProperty('stack')){
        dataLog += ' Error ' + arguments[i].stack;
      } else {
        dataLog += printObject(arguments[i], '');
      }
    }
    else if(typeof arguments[i] === 'string'){
      dataLog += arguments[i];
    }
  }
  
  console.log(dataLog);
  
  if (logConfiguration.template) {
    for (let i = 0, confLength = logConfiguration.template.length; i < confLength; i++) {
      //on ajoute un séparateur si on est pas au début ou à la fin du template de log
      if (i != 0 && i != confLength) {formatData += logConfiguration.separator;}
      
      for (let key in logConfiguration.template[i]) {
        switch (key) {
          case 'date':
            formatData += transformDate(logConfiguration.template[i][key]) + dataLog;
            break;
          
          default:
            // on pourra mettre de la mise en forme ici
            
            break;
        }  
      }  
    }
  }
  
  //à condition que la transformation est été effective
  if (formatData != '') {dataLog = formatData;}
  
  //console.log('filePath : ' + filePath);
  
  //à mettre en asynchrone en cas de charge serveur importantes
  if (isServer) {
    // import fs from 'fs';
    var fs = require('fs');
    fs.appendFile(filePath, dataLog +'\n', function(err) {
        if(err) {
            return console.log(err);
        }
    });
  }
}