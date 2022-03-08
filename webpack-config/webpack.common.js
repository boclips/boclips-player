const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const srcPath = path.resolve(__dirname, '../src');
const distPath = path.resolve(__dirname, '../dist');

module.exports = {
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
    fallback: { querystring: require.resolve('querystring-es3') },
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
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
        sideEffects: true
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
    new CopyPlugin({
      patterns: [
        {
          from: './src/MediaPlayer/Plyr/resources/youtube-play.svg',
          to: 'resources',
        },
      ],
    }),
  ],
};
