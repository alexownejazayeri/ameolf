import { join } from 'path'

import { merge } from 'webpack-merge'
import config from './webpack.config'

module.exports = merge(config, {
  mode: 'production',

  output: {
    path: join(__dirname, 'static')
  }
})
