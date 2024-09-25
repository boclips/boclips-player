import { merge } from 'webpack-merge'
import HtmlWebpackPlugin from 'html-webpack-plugin';

import * as common from '../../webpack-config/webpack.dev.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default merge(common.default, {
  entry: {
    demo: path.resolve(__dirname, 'App.ts'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
    }),
    new HtmlWebpackPlugin({
      inject: false,
      filename: 'silent-check-sso.html',
      template: path.resolve(__dirname, 'silent-check-sso.html'),
    }),
  ],
});
