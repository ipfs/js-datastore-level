/* eslint-env mocha */
'use strict'

const { MountDatastore } = require('datastore-core')
const { Key } = require('interface-datastore')
const leveljs = require('level')
const LevelStore = require('../src')

describe('LevelDatastore', () => {
  describe('interface-datastore (leveljs)', () => {
    require('interface-datastore/src/tests')({
      setup: () => new LevelStore('hello', { db: leveljs }),
      teardown: () => new Promise((resolve, reject) => {
        leveljs.destroy('hello', err => {
          if (err) return reject(err)
          resolve()
        })
      })
    })
  })

  describe('interface-datastore (mount(leveljs, leveljs, leveljs))', () => {
    require('interface-datastore/src/tests')({
      setup () {
        return new MountDatastore([{
          prefix: new Key('/a'),
          datastore: new LevelStore('one', { db: leveljs })
        }, {
          prefix: new Key('/q'),
          datastore: new LevelStore('two', { db: leveljs })
        }, {
          prefix: new Key('/z'),
          datastore: new LevelStore('three', { db: leveljs })
        }])
      },
      teardown () {
        return Promise.all(['one', 'two', 'three'].map(dir => {
          return new Promise((resolve, reject) => {
            leveljs.destroy(dir, err => {
              if (err) return reject(err)
              resolve()
            })
          })
        }))
      }
    })
  })
})
