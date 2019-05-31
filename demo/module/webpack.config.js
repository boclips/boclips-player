const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const common = require('../../webpack-config/webpack.dev.js');

const path = require('path');

module.exports = merge(common, {
  entry: {
    'demo': path.resolve(__dirname, 'App.ts')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
    }),
  ],
});
