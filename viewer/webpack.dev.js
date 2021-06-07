const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    watchContentBase: true,
    compress: true,
    port: 9000,
    historyApiFallback: {
      rewrites: [
        { from: /^\/feed\/[^\/]+\/new\/?$/, to: '/feed_new.html' },
        { from: /^\/feed\/[^\/]+\/?$/, to: '/feed_index.html' },
        { from: /^\/feed\/[^\/]+\/?\/[0-9]+$/, to: '/feed_single.html' },
      ],
    },
  },
});