// var webpack = require('webpack');
import webpack from 'webpack';
import devConfig from '../../../config/dev_server';

const { path, filename, publicPath } = devConfig.wds;

export default {
  devtool: 'eval',
  entry: [
    'babel/polyfill',
    'webpack/hot/dev-server',
    './src/client/client.js'
  ],
  output: {
    path,
    filename,
    publicPath,
    // https://github.com/webpack/webpack-dev-server/issues/135
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.IgnorePlugin(/queryDb/),
    new webpack.ContextReplacementPlugin(/chalk/, null)
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['react-hot', 'babel'],
        // include: [__dirname + '/src', __dirname + '/config'],
        exclude: /node_modules/
      },
      {
        test:   /\.css$/,
        loader: "style!css!cssnext"
      }
    ]
  },
  node: {
    fs: 'empty'
  },
  cssnext: {
    browsers: "last 2 versions",
  },
};

/*let deps = [
  'react/dist/react.min.js',
  'react-router/dist/react-router.min.js'
];

//optimisation pour la prod 
deps.forEach(function (dep) {
  let depPath = path.resolve(node_modules_dir, dep);
  config.resolve.alias[dep.split(path.sep)[0]] = depPath;
  config.module.noParse.push(depPath);
});*/
