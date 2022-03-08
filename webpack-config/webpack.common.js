const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const srcPath = path.resolve(__dirname, '../src');
const distPath = path.resolve(__dirname, '../dist');

module.exports = {
  entry: {
    'boclips-player': path.resolve(srcPath, 'index.ts'),
  },
  output: {
    filename: '[name].js',
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
        test: /\.(less|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'less-loader',
          },
        ],
      },
      {
        test: /\.(scss)$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
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
