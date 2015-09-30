import fs        from 'fs';
import React     from 'react';
import ReatDOMServer from 'react-dom/server';
import JWT       from 'jsonwebtoken';
import createLocation from 'history/lib/createLocation';
import { RoutingContext, match } from 'react-router';
import log, { logAuthentication, logError }  from '../shared/utils/logTailor';
import phidippides    from './phidippides';
import protectRoutes  from '../shared/routes';
import devConfig      from '../../config/dev_server';
import configureStore from '../shared/configureStore';
import { Provider } from 'react-redux';

const { wds: { hotFile, publicPath, filename }, jwt: { key, ttl } } = devConfig;
const HTML = fs.readFileSync('src/server/index.html', 'utf8');

// Replies a prerendered application
export default function prerender(request, reply) {
  
  const d = new Date();
  const response = reply.response().hold();
  
  const checkCookie = typeof request.state.jwt === 'string' ? // If there is a JWT in the cookie, we verify it
    new Promise((resolve, reject) => JWT.verify(request.state.jwt, key, (err, {userId, expiration}) => {
      if (err) return reject(err);
      
      const t = new Date().getTime();
      logAuthentication('checkCookie', userId, expiration);
      if (!userId || expiration < t) resolve({}); // If the JWT is expired then the cookie should be inexistent anyway for the cookie and JWT both have the same time to live
      else {
        const session = {userId, expiration: t + ttl};
        response.state('jwt', JWT.sign(session, key), {ttl, path: '/'}); // Adds a renewed cookie to the reponse. Note: somehow, path: '/' is important
        resolve({session});
      }
    })) :
    Promise.resolve({}); // No cookie, no problem
  // First we scan the request for a cookie to renew
  checkCookie.then(reduxState => {
    
    // Then we create a new Redux store and initialize the routes with it
    const html = HTML;
    const store = configureStore(reduxState);
    const routes = protectRoutes(store);
    
    // URL processing : /foo/ --> /foo || /foo?bar=baz --> /foo || / --> /
    const requestUrl = request.url.path.split('?')[0];
    const url = requestUrl.slice(-1) === '/' && requestUrl !== '/' ? requestUrl.slice(0, -1) : requestUrl;
    const location = createLocation(url);
    match({ routes, location }, (err, redirectLocation, renderProps) => {
      log('... Matching routes with url');
      if (err) {
        logError('Router.match', err);
        response.statusCode = 500;
        return response.send();
      }
      // If routeGuard canceled a route transition (for example) then we send back a 301 (redirect)
      if (redirectLocation) {
        log('... Transition cancelled: redirecting');
        return response.redirect(redirectLocation.pathname + '?r=' + url).send();
      }
      
      // Fetches initial data for components in router's branch
      log('... Entering phidippides');
      const dd = new Date();
      phidippides(renderProps, store.dispatch).then(() => {
        log(`... Exiting phidippides (${new Date() - dd}ms)`);
        log('... Entering React.renderToString');
        
        // Renders the app (try...catch to be removed in production)
        try {
          var mountMeImFamous = ReatDOMServer.renderToString(
            <Provider store={store}>
              <RoutingContext  {...renderProps}/>
            </Provider>
          );
        } 
        catch(err) { logError('React.renderToString', err); }
        log('... Exiting React.renderToString');
        
        // Passage du state dans window
        const serverState = store.getState();
        ['router', 'records', 'lastError'].forEach(key => delete serverState[key]);
        for (let key in serverState) {
          const value = serverState[key];
          const isEmpty = value === '' || (typeof value === 'object' && !Object.keys(value).length); // Could be better
          if (isEmpty) delete serverState[key];
        }
        
        response.source = html.replace('<body>', `<body><div id="mountNode">${mountMeImFamous}</div>` +
          `<script>window.STATE_FROM_SERVER=${JSON.stringify(serverState)}</script>` +
          `<script src="${hotFile}"></script>` +
          `<script src="${publicPath + filename}"></script>`);
        
        response.send(); // Bon voyage
        log(`Served ${url} in ${new Date() - d}ms.\n`);
          
      }, err => logError('Phidippides', err));
    });
  }, err => logError('checkCookie', err));
}
