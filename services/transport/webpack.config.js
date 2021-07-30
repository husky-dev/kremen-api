const { DefinePlugin } = require('webpack');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const { version, name } = require('./package.json');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  target: 'node',
  externals: [nodeExternals()],
  output: {
    libraryTarget: 'commonjs',
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new DefinePlugin({
      NAME: JSON.stringify(name),
      VERSION: JSON.stringify(version),
    })
  ],
};
