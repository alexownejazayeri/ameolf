const config = require('./webpack.config')
const webpackMerge = require('webpack-merge')
const path = require('path')

const { join } = path
const { merge } = webpackMerge

module.exports = merge(config, {
  mode: 'production',

  output: {
    path: join(__dirname, 'static')
  }
})
