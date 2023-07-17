const path = require('path')
const webpack = require('webpack')

// Copies details between configs
const CopyWebpackPlugin = require('copy-webpack-plugin')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')

// Fetch CSS files from JS and outputs CSS to you
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')

// Tip: don't get lost in the details of packages
// - when you really need one, you'll know
// - do it all by use case!

const IS_DEVELOPMENT = process.env.NODE_ENV === 'dev'

const dirApp = path.join(__dirname, 'app')
const dirShared = path.join(__dirname, 'shared') // favicons and stuff
const dirStyles = path.join(__dirname, 'styles')
const dirNode = 'node_modules'

module.exports = {
  entry: [path.join(dirApp, 'index.ts'), path.join(dirStyles, 'index.scss')],

  // Makes import/export clean
  resolve: {
    modules: [dirApp, dirShared, dirStyles, dirNode]
  },

  plugins: [
    // webpack builtin
    new webpack.DefinePlugin({
      IS_DEVELOPMENT
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: './shared',
          to: ''
        }
      ]
    }),

    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),

    new CleanWebpackPlugin()
  ],

  optimization: {
    minimize: true,
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['jpegtran', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }]
            ]
          }
        }
      }),
      new TerserPlugin()
    ]
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: ''
            }
          },
          {
            loader: 'css-loader'
          },
          {
            // prefixes css for browser compatibility
            loader: 'postcss-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      // {
      // webp is google's optimized img format
      // good for webgl textures using webp
      // test: /\.(jpe?g|png|svg|woff2?|fnt|webp)$/,
      // loader: 'file-loader',
      // options: {
      // in order to prevent outdated images on frontend
      // due to caching, use a hash so the cache knows its new
      // name (file) {
      //   return '[hash].[ext]'
      // }
      // can change output file name
      // based on which file is tested
      // e.g.(image, fonts, etc.)
      //   }
      // },
      {
        test: /\.(png|jpg|gif|jpe?g|svg|woff2?|fnt|webp|mp4)$/,
        type: 'asset/resource',
        generator: {
          filename: '[name].[hash].[ext]'
        }
      },

      {
        test: /\.(glsl|frag|vert)$/,
        loader: 'raw-loader',
        exclude: /node_modules/
      },

      {
        test: /\.(glsl|frag|vert)$/,
        loader: 'glslify-loader',
        exclude: /node_modules/
      }
    ]
  }
}
