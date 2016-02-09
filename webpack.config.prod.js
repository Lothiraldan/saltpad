var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  devtool: 'source-map',
  entry: {
    app: './app/index.jsx',
    vendors: ['react', 'react-dom', 'lodash', 'baobab', 'react-router',
              'react-select', 'history']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: "/static/[name].js"
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     'NODE_ENV': JSON.stringify('production')
    //   }
    // }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    new HtmlWebpackPlugin({
      template: 'index-prod.html',
      inject: true
    }),
    new ExtractTextPlugin("/static/styles.css"),
  ],
  resolve: {
    extensions: ['', '.js', '.jsx'],
    // Tell webpack to look for required files in bower and node
    modulesDirectories: ['bower_components', 'node_modules']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel?optional[]=runtime&stage=0'],
        include: path.join(__dirname, 'app')
      },
      {
        test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader")
      },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=/static/[name]-[hash].[ext]" },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=/static/[name]-[hash].[ext]" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=/static/[name]-[hash].[ext]" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=/static/[name]-[hash].[ext]" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=/static/[name]-[hash].[ext]" },
      { test: /\.jpg$/, loader: "file?name=[name]-[hash].[ext]" },
      { test: /\.png$/, loader: "file?name=[name]-[hash].[ext]" },
    ]
  }
};
