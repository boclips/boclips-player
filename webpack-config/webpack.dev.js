import { merge } from 'webpack-merge'

import * as common from './webpack.common.js';

import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const distPath = path.resolve(__dirname, '../dist');

export default merge(common.default, {
  mode: 'development',
  devServer: {
    port: 8081,
    static: distPath,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
    ],
  },
});
