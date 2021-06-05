const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { join } = require('path');
const { ProvidePlugin } = require('webpack');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const entryNames = [
  'index',
  'feed/index',
  'feed/new',
];

const entries = {};
const htmlPlugins = [];
for (const entryName of entryNames) {
  entries[entryName] = `./src/entrypoints/${entryName}.tsx`;
  htmlPlugins.push(new HtmlWebpackPlugin({
    filename: `${entryName}.html`,
    template: path.resolve(__dirname, 'src', 'templates', 'main.html'),
    inject: 'body',
    hash: true,
    chunks: [entryName]
  }));
}

module.exports = {
  entry: entries,
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
      {
        test: /\.css$/,
        include: path.resolve(__dirname, 'src'),
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.html$/,
        use: 'html-loader',
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
    // new BundleAnalyzerPlugin(),
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
}
