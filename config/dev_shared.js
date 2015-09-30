import { localIP, wsPort, apiPort} from './dev_local';

export default {
  wsUrl: `http://${localIP}:${wsPort}`,
  apiUrl: `http://${localIP}:${apiPort}`,
  sessionDuration: 60 * 60 * 1000, //60 minutes
};
