/* @flow */
/* eslint-env mocha */
'use strict'

const utils = require('interface-datastore').utils
const rimraf = require('rimraf')
const each = require('async/each')
const MountStore = require('interface-datastore').MountDatastore
const Key = require('interface-datastore').Key

const LevelStore = require('../src')

describe('LevelDatastore', () => {
  describe('interface-datastore (leveldown)', () => {
    const dir = utils.tmpdir()
    require('interface-datastore/test/interface')({
      setup (callback) {
        callback(null, new LevelStore(dir))
      },
      teardown (callback) {
        rimraf(dir, callback)
      }
    })
  })

  describe('interface-datastore (mount(leveldown, leveldown, leveldown))', () => {
    const dirs = [
      utils.tmpdir(),
      utils.tmpdir(),
      utils.tmpdir()
    ]
    require('interface-datastore/test/interface')({
      setup (callback) {
        callback(null, new MountStore([{
          prefix: new Key('/a'),
          datastore: new LevelStore(dirs[0])
        }, {
          prefix: new Key('/q'),
          datastore: new LevelStore(dirs[1])
        }, {
          prefix: new Key('/z'),
          datastore: new LevelStore(dirs[2])
        }]))
      },
      teardown (callback) {
        each(dirs, rimraf, callback)
      }
    })
  })

  it('interop with go', () => {
  })
})
