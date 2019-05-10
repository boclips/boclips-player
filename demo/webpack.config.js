const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const distPath = path.resolve(__dirname, 'dist');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devServer: {
    contentBase: distPath,
  },
  output: {
    filename: 'boclips-player.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: "/",
    library: 'BoclipsPlayer',
    libraryTarget: "umd"
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({template: path.resolve(__dirname, 'index.html')})
  ]
};
