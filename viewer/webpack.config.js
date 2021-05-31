const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { join } = require('path');
const { ProvidePlugin } = require('webpack');

module.exports = {
  entry: {
    index: './src/index.tsx',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true
        }
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    fallback: {
      buffer: require.resolve('buffer/'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
    },
  },
  plugins: [
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    new CopyPlugin({ patterns: [{ from: 'static' }] }),
    new ForkTsCheckerWebpackPlugin({ typescript: { configFile: join(__dirname, 'tsconfig.json') } }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, 'templates', 'index.html'),
      inject: 'body',
      hash: true,
      chunks: ['index']
    })
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
  mode: 'development',
  optimization: {
    usedExports: true,
  },
}
