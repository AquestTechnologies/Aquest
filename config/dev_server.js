import { localIP, wdsPort, apiPort, wsPort } from './dev_local';
import { sessionDuration } from './dev_shared';

export default {
  api: {
    host: localIP,
    port: apiPort,
  },
  ws : {
    host: localIP,
    port: wsPort,
  },
  jwt: {
    key: 'ohPleaseHackMe',
    ttl: sessionDuration,
  },
  wds: {
    host:           '0.0.0.0',
    port:           wdsPort,
    filename:       'bundle.js',
    path:           __dirname + '/dist',
    publicPath:     'http://' + localIP + ':' + wdsPort + '/static/', // NEVER USE `${foo}` HERE !!!
    hotFile:        'http://' + localIP + ':' + wdsPort + '/webpack-dev-server.js', // SATANIC STUFF HAPPENS !!!
    proxyPathRegex: '^(?!.*\/static\/)(.*)$',
  },
  pg: {  
    host:     '130.211.111.160', 
    port:     '5432', 
    user:     'aquestuser',
    password: 'aquestuser',
    database: 'aquestdb',
  },
};
