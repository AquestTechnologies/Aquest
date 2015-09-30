import queryDb from '../queryDb';
import log, {logError} from '../../shared/utils/logTailor';
import {randomInteger, randomText} from '../../shared/utils/randomGenerators';
import {ip, universePicture, passwordHash, imageList, youtubeList, linkList, nameList} from './activistsConfig'; 

export class Activist {
  
  constructor() {
    this.id = null;
    this.started = false;
    this.counter = 0; // Counts the number of actions taken
    this.probabilities = [ // Reflects the chances to perform a given action
      {
        a: 'createMessage',
        p: 0.51,
      },
      {
        a: 'createVote',
        p: 0.3,
      },
      {
        a: 'createTopic',
        p: 0.11,
      },
      {
        a: 'createUser',
        p: 0.05,
      },
      {
        a: 'createUniverse',
        p: 0.03,
      },
    ];
  }
  
  
  // Starts the show at a given pace
  start(pace) {
    this._initialize().then(
      () => {
        this.started = true;
        const loopActivities = () => this._generateActivity().then(
          data => {
            if (this.started) setTimeout(loopActivities, pace);
          },
          err => logError('activityGenerator', err)
        );
        
        loopActivities();
      },
      err => logError('activityGenerator', err)
    );
    
  }
  
  
  // Stops the activity
  stop() {
    this.started = false;
  }
  
  
  // Initialization, returns a Promise
  _initialize() {
    
    const {probabilities} = this;
    let sum = 0;
    let lastValue = 0;
    
    // actionProbabilities construction
    probabilities.forEach(prob => {
      const { p } = prob;
      sum += p;
      prob.p = [lastValue, lastValue + p];
      lastValue += p;
    });
    
    return sum === 1 ? 
      this._changeId() :
      Promise.reject(`Sum of probabilities !== 1 (sum === ${sum})`);
  }
  
  
  // The main loop, returns a Promise
  _generateActivity() {
    this.counter++;
    const {id, counter} = this;
    
    const x = Math.random();
    const action = this.probabilities.find(({ p }) => x >= p[0] && x < p[1]).a;
    log(`o_o [${id} ${counter}] ${action}`);
    
    return this['_' + action]();
  }
  
  
  _changeId() {
    
    return new Promise((resolve, reject) => {
      
      const pseudo = getName();
      if (this.id) releaseName(this.id);
      this.id = pseudo;
      
      log('o_o logging ', pseudo);
      
      // We check if the user exists by login him/her
      queryDb('login', { email: pseudo }).then(
        result => {
          if (result) return resolve();
          
          // If not, we create it
          log('o_o creating ', pseudo);
          const createUserParams = {
            ip,
            pseudo,
            passwordHash,
            email: pseudo + '@activist.com',
          };
          
          queryDb('createUser', createUserParams).then(resolve, reject);
        },
        reject
      );
    });
  }
  
  _createUser() {
    
    return this._changeId();
  }
  
  _createMessage() {
    
    return new Promise((resolve, reject) => {
      
      queryDb('randomRow', 'chat').then(
        result => {
          const params = {
            userId: this.id,
            chatId: result.id,
            type: 'text',
            content: {
              text: randomText2(1, 20)
            },
          };
          
          queryDb('createMessage', params).then(resolve, reject);
        },
        reject
      );
    });
  }
  
  _createUniverse() {
    
    return queryDb('createUniverse', {
      ip,
      userId: this.id,
      name: randomText2(1, 3).slice(0, -1),
      picture: universePicture,
      description: randomText2(1, 20),
    });
  }
  
  _createTopic() {
    
    return new Promise((resolve, reject) => {
      
      queryDb('randomRow', 'universe').then(
        result => {
          const atoms = [];
          
          for (let i = 0, j = randomInteger(1, 6); i < j; i++) {
            const atom = {};
            switch(randomInteger(1, 8)) {
              
              case 1:
              case 2:
              case 3:
              case 4:
                atom.type = 'text';
                atom.content = {
                  text: randomText2(1, 150)
                };
                break;
              
              case 5:
              case 6:
                atom.type = 'image';
                atom.content = {
                  url: selectRandomItemIn(imageList)
                };
                break;
              
              case 7:
                atom.type = 'youtube';
                atom.content = {
                  id: selectRandomItemIn(youtubeList)
                };
                break;
                
              case 8:
                atom.type = 'link';
                atom.content = {
                  text: randomText2(1, 10),
                  href: selectRandomItemIn(linkList)
                };
                break;
            }
            atoms.push(atom);
          }
          
          const params = {
            atoms,
            userId: this.id,
            universeId: result.id,
            title: randomText2(1, 10),
            previewType: 'text',
            previewContent: {
              text: 'A topic that was automaticaly generated. ' + randomText2(1, 50)
            },
          };
          
          queryDb('createTopic', params).then(resolve, reject);
        },
        reject
      );
    });
  }
  
  _createVote() {
    
    return new Promise((resolve, reject) => {
      
      resolve();
    });
  }
  
}


// Creates a bunch of activists
export function createActivists(n, minPace, maxPace) {
  
  let activists = [];
  let paces = [];
  
  for (let i = 0; i < n; i++) {
    activists.push(new Activist());
    paces.push(randomInteger(minPace, maxPace));
  }
  
  function startActivists() {
    log('o_o Starting activityGenerator...');
    for (let i = 0; i < n; i++) {
      activists[i].start(paces[i]);
    }
  }
  
  function stopActivists() {
    for (let i = 0; i < n; i++) {
      activists[i].stop();
    }
  }
  
  return {startActivists, stopActivists};
}


// Makes sure no activist has the same id
const activeNames = [];
function getName() {
	
	let name, selectedName, existant;
	do {
		selectedName = selectRandomItemIn(nameList);
		existant = activeNames.find(name => name === selectedName);
		
		if (!existant) {
			name = selectedName;
			activeNames.push(selectedName);
		}
	} while(!name);
	
	return name;
}

function releaseName(name) {
  activeNames.splice(activeNames.indexOf(name), 1);
}


// Utilities
function randomText2(min, max) {
  
  return randomText(randomInteger(min, max));
}

function selectRandomItemIn(array) {
  
  return array[randomInteger(0, array.length - 1)];
}
