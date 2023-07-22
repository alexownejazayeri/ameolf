import { merge } from 'webpack-merge'
import config from './webpack.config'

const join = require('path')

module.exports = merge(config, {
  mode: 'production',

  output: {
    path: join(__dirname, 'static')
  }
})
