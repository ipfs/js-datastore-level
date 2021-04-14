'use strict'

const path = require('path')

/** @type {import('aegir').Options["build"]["config"]} */
const esbuild = {
  inject: [path.join(__dirname, './scripts/node-globals.js')]
}

/** @type {import('aegir').PartialOptions} */
module.exports = {
  build: {
    bundlesizeMax: '253kB'
  },
  test: {
    browser: {
      config: {
        buildConfig: esbuild
      }
    }
  }
}