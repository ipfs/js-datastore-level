'use strict'

const path = require('path')

/** @type {import('aegir').Options["build"]["config"]} */
const esbuild = {
  inject: [path.join(__dirname, './scripts/node-globals.js')],
  plugins: [
    {
      name: 'node built ins',
      setup (build) {
        build.onResolve({ filter: /^immediate$/ }, () => {
          return { path: path.join(__dirname, './scripts/immediate.js') }
        })
      }
    }
  ]
}

/** @type {import('aegir').PartialOptions} */
module.exports = {
  build: {
    bundlesizeMax: '67KB'
  },
  test: {
    browser: {
      config: {
        buildConfig: esbuild
      }
    }
  }
}
