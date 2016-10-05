/**
 * Created by tdzl2003 on 10/3/16.
 */

/**
 * Created by Yun on 2015-11-28.
 */

/* eslint-disable import/no-extraneous-dependencies, no-underscore-dangle */

global.__DEV__ = process.env.NODE_ENV !== 'production';
global.__PLATFORM__ = process.env.RN_PLATFORM || 'ios';

const path = require('path');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');
const {AssetsResolverPlugin, findProvidesModule} = require('react-native-webpack');

const assetsPath = path.join(__dirname,
  'build',
  __DEV__ ? 'debug' : 'release'
);

const babelLoader = `babel?${JSON.stringify({
  presets: ['react-native'],
  plugins: [
    'syntax-trailing-function-commas',
    'transform-flow-strip-types',
    require.resolve('react-native-webpack/fixRequireIssuePlugin'),
  ],
})}`

module.exports = {
  context: __dirname,
  entry: {
    index: [
      'react-native-webpack/clients/polyfills.js',
      `./index.${__PLATFORM__}.js`,
    ],
  },
  output: {
    path: assetsPath,
    filename: `[name].${__PLATFORM__}.bundle`,
    chunkFilename: '[name].chunk.js',
    publicPath: '/',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/, loaders: [
          babelLoader,
        ]
      },
      { test: /\.json$/, loader: 'json-loader' },
    ],
  },
  progress: true,
  resolve: {
    modulesDirectories: [
      'src',
      'node_modules',
    ],
    alias: findProvidesModule([
      path.resolve(process.cwd(), 'node_modules/react-native'),
    ]),
    extensions: ['', `.${__PLATFORM__}.js`, '.js'],
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__,
      'process.env': {
        // Useful to reduce the size of client-side libraries, e.g. react
        NODE_ENV: __DEV__ ? JSON.stringify('development') : JSON.stringify('production'),
      },
    }),
    new AssetsResolverPlugin(),
  ].concat(__DEV__ ? [
  ] : [
    new CleanPlugin([assetsPath]),
    new webpack.IgnorePlugin(/\.\/dev/, /\/config$/),

    // optimizations
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
  ]),

  devServer: {
    port: 8081,
    quiet: false,
    noInfo: true,
    lazy: true,
    filename: `[name].${__PLATFORM__}.bundle`,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
    },
    publicPath: '/',
    stats: { colors: true },
  },
};
