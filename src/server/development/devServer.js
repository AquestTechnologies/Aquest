import chalk from 'chalk';
import webpack from 'webpack';
import config from './webpack.config';
import log, {logError} from '../../shared/utils/logTailor';
import webpackDevServer from 'webpack-dev-server';
import devConfig from '../../../config/dev_server';

export default function devServer() {
  
  let startTime;
  const bundle = webpack(config);
  const { api, wds: { host, port, proxyPathRegex } } = devConfig;
  
  bundle.plugin('compile', () => {
    startTime  = Date.now();
    log(chalk.green('Bundling...'));
  });
  
  bundle.plugin('done', () => log(chalk.green(`Bundled in ${Date.now() - startTime}ms!`)));
  
  new webpackDevServer(bundle, {
    publicPath: config.output.publicPath,
    hot: true,
    noInfo : true,
    historyApiFallback: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    stats: {
      colors: true
    },
    devServer: {
      hot: true,
      inline: true
    },
    proxy: [{
      // proxy toutes les requêtes ne contenant pas "*/static/*"
      path:    new RegExp(proxyPathRegex),
      target:  `http://localhost:${api.port}/`
    }]
  }).listen(port, host, err => {
    if (err) return logError('devServer.listen', err);
    log(`WDS listening at ${host}:${port}`);
  });
}
