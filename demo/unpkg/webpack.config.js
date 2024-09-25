import { merge } from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import common from '../../webpack-config/webpack.dev.js';

import { resolve } from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default merge(common.default, {
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, 'index.html'),
      inject: false,
    }),
    new HtmlWebpackPlugin({
      inject: false,
      filename: 'silent-check-sso.html',
      template: resolve(__dirname, 'silent-check-sso.html'),
    }),
  ],
});
