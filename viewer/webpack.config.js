const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { join } = require('path');
const { ProvidePlugin } = require('webpack');

const entryNames = [
  'index',
];

const entries = {};
const htmlPlugins = [];
for (const entryName of entryNames) {
  entries[entryName] = `./src/${entryName}.tsx`;
  htmlPlugins.push(new HtmlWebpackPlugin({
    filename: `${entryName}.html`,
    template: path.resolve(__dirname, 'templates', `${entryName}.html`),
    inject: 'body',
    hash: true,
    chunks: [entryName]
  }));
}

module.exports = {
  entry: entries,
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
    ...htmlPlugins,
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    historyApiFallback: {
      rewrites: [
        { from: /^\/feed\/.+/, to: '/index.html' }
      ],
    },
  },
  mode: 'development',
  optimization: {
    usedExports: true,
  },
}
