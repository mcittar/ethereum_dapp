const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './app/javascripts/app.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.js'
  },
  plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './app/index.html', to: "index.html" }
    ]),
    new ExtractTextPlugin('static/css/[name].[contenthash:8].css')
  ],
  resolve: {
    extensions: ['.js', '.jsx', '*']
  },
  module: {
    loaders: [
      { test: /\.json$/, use: 'json-loader' },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      },
    ],
    rules: [
      {
       test: /\.css$/,
       use: [ 'style-loader', 'css-loader' ]
     },
     {
       test: /\.jsx?$/,
       exclude: /(node_modules|bower_components)/,
       loader: 'babel-loader',
       query: {
         presets: ['react', 'es2015']
       }
     },
    ]
  },
  devtool: 'source-maps'
};
