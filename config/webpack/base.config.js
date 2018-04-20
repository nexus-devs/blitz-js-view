const isProd = cubic.config.local.environment !== 'development'
const webpack = require('webpack')
const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const MiniCss = require('mini-css-extract-plugin')

module.exports = {
  mode: isProd ? 'production' : 'development',

  // Output file which will be loaded by Vue (server & client side)
  output: {
    path: cubic.config.ui.core.publicPath,
    filename: isProd ? '[name]-bundle.[chunkhash].js' : 'dev-[name].bundle.js'
  },

  // Loaders which determine how file types are interpreted
  module: {
    rules: [
      // This is our main loader for vue files
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.s?[a|c]ss$/,
        use: (isProd ? [MiniCss.loader] : ['vue-style-loader']).concat(['css-loader', 'sass-loader'])
      },
      {
        test: /\.css$/,
        use: (isProd ? [MiniCss.loader] : ['vue-style-loader']).concat(['css-loader'])
      },
      // Transpile ES6/7 into older versions for better browser support
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          path.resolve(cubic.config.ui.sourcePath),
          path.resolve(__dirname, '../../vue')
        ]
      }
    ]
  },

  // Change how modules are resolved. (Places to look in, alias, etc)
  resolve: {
    // Resolve dependencies differently when in debug due to source code folder
    // being different from current working directory
    alias: Object.assign({
      src: cubic.config.ui.sourcePath,
      public: cubic.config.ui.core.publicPath
    })
  },

  // Plugins for post-bundle operations
  plugins: (isProd ? [
    new webpack.EnvironmentPlugin('NODE_ENV'),
    new MiniCss({
      filename: '[name].[contenthash].css',
      chunkFilename: '[name].[contenthash].css'
    })
  ] : [])
    .concat([
      new VueLoaderPlugin(),
      new webpack.DefinePlugin({
        '$apiUrl': JSON.stringify(cubic.config.ui.client.apiUrl),
        '$authUrl': JSON.stringify(cubic.config.ui.client.authUrl)
      })
    ])
}
