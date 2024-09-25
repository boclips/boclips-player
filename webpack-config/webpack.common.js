import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const srcPath = path.resolve(__dirname, '../src');
const distPath = path.resolve(__dirname, '../dist');

export default {
  entry: path.resolve(srcPath, 'index.ts'),
  output: {
    filename: 'index.js',
    path: distPath,
    publicPath: '/',
    library: 'Boclips',
    module: false,
    libraryTarget: 'umd',
  },
  resolve: {
    alias: {
      src: srcPath,
    },
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              api: 'legacy',
            },
          },
        ],
        sideEffects: true,
      },
      {
        test: /.svg$/i,
        exclude: /node_modules/,
        oneOf: [
          {
            use: 'svg-inline-loader',
          },
          {
            use: 'file-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      chunkFilename: '[id].css',
      filename: '[name].css',
    }),
  ],
};
