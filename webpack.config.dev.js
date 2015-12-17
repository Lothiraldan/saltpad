var path = require('path')
var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-hot-middleware/client',
    './app/index.jsx'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.jsx', '.css'],
    // Tell webpack to look for required files in bower and node
    modulesDirectories: ['bower_components', 'node_modules']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['react-hot', 'babel?optional[]=runtime&stage=0'],
        include: path.join(__dirname, 'app')
      },
      {
        test: /\.css$/, loader: "style-loader!css-loader"
      },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/font-woff" },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/font-woff" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/octet-stream" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=image/svg+xml" },
      { test: /\.jpg$/, loader: "file" },
      { test: /\.png$/, loader: "file" },
    ]
  }
}
