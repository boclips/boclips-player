const common = require('../../webpack-config/webpack.common');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require('path');

module.exports = {
  ...common,
  mode: 'development',
  plugins: [
    ...common.plugins,
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
      inject: 'head',
    }),
  ],
};
