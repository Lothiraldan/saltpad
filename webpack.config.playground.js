var path = require('path'),
    _ = require('lodash'),
    devConfig = require('./webpack.config.dev');

module.exports = _.extend(devConfig, {
  entry: [
    'webpack-hot-middleware/client?reload=true',
    'cosmos-js'
  ],
  resolve: {
    alias: {
      COSMOS_COMPONENTS: path.join(__dirname, 'app/components'),
      COSMOS_FIXTURES: path.join(__dirname, 'app/fixtures')
    }
  }
});
