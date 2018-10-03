const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')


module.exports = (env, argv) => {
  const project = argv.project || ''
  
  return {
    devtool: '#source-map',
    entry: argv.mode === 'production'
      ? `./src/${project}/index.js`
      : ['webpack-dev-server/client?http://0.0.0.0:8007',
        'webpack/hot/only-dev-server',
        `./src/${project}/index.js`],
    output: {
      path: path.join(__dirname, project, 'dist'),
      filename: 'bundle.js'
    },
    resolve: {
      alias: {
        'three-examples': path.join(__dirname, './node_modules/three/examples/js')
      }
    },
    module: {
      rules: [
        {
          // this does not work 
          test: /node_modules\/three\/examples\/js/,
          loader: 'imports-loader?THREE=three'
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /(node_modules)/
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: '[name].[hash:7].[ext]'
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'fonts/[name].[hash:7].[ext]'
          }
        },
        {
          test: /\.(glsl)$/,
          loader: 'glsl-shader-loader'
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', project, 'index.html'),
        inject: 'body'
      }),
      new CopyWebpackPlugin([
        {
          from: path.join(__dirname, 'src', project, 'static')
        }
      ])
    ]
  }
}