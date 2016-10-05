# Use webpack for react-native

Webpack have fully support for CommonJS, and provides much more features.

You can skip this README if you just want things work. Read [sample](./example) and use the webpack.config.js and read package.json for dependencies. 

We just need to do these:

## Base configure

```bash
npm install webpack json-loader clean-webpack-plugin react-native-webpack --save
npm install webpack-dev-server --save-dev
```

```javascript
global.__PLATFORM__ = process.env.RN_PLATFORM || 'ios';

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
```

## Configure babel

Install dependencies: 

```bash
npm install babel-loader babel-presets-react-native babel-plugin-syntax-trailing-function-commas babel-plugin-transform-flow-strip-types --save
```

You can configure babel-loader via query like:  

```javascript
const babelLoader = `babel?${JSON.stringify({
  presets: ['react-native'],                    // Use default babel-presets-react-native
  plugins: [
    'syntax-trailing-function-commas',          // Fix a extra comma in react-native
    'transform-flow-strip-types',               // Strip flow types in react-native source code. 
    require.resolve('react-native-webpack/fixRequireIssueLoader'),  // Fix a direct usage of require in react-native which caused issue.
  ],
})}`

module.exports = {
  //...other configures
  module: {
    loaders: [
      {
        // Enable babel for your code and libraries.
        test: /\.jsx?$/, loaders: [
          babelLoader,
        ]
      },
      { test: /\.json$/, loader: 'json-loader' },
    ],
  },
};
```

## Support for @providesModule for specified modules

```javascript
module.exports = {
  //...other configures
  resolve: {
    modulesDirectories: [
      'src',
      'node_modules',
    ],
    alias: findProvidesModule([
      // Find @providesModule in react-native
      path.resolve(process.cwd(), 'node_modules/react-native'),
      // You can find in event more modules like fbjs here. 
    ]),
    extensions: ['', `.${__PLATFORM__}.js`, '.js'],
  },
}
```

## Support for assets require (require('./xxx.png')

```javascript
module.exports = {
  //...other configures
  plugins: [
    new AssetsResolverPlugin(),
  ],
};
```

## TODO:

1. Bundle command for android/ios
2. Support windows. 
3. Code Splitting(require.ensure) support

