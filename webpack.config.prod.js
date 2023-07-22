const config = require('./webpack.config')
const merge = require('webpack-merge')

const join = require('path')

module.exports = merge(config, {
  mode: 'production',

  output: {
    path: join(__dirname, 'static')
  }
})
