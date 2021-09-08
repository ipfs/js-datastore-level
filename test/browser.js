/* eslint-env mocha */

import { MountDatastore } from 'datastore-core'
import { Key } from 'interface-datastore/key'
// @ts-ignore
import leveljs from 'level'
import { LevelDatastore } from '../src/index.js'
import { interfaceDatastoreTests } from 'interface-datastore-tests'

describe('LevelDatastore', () => {
  describe('interface-datastore (leveljs)', () => {
    interfaceDatastoreTests({
      setup: () => new LevelDatastore('hello', { db: leveljs }),
      teardown: () => new Promise((resolve, reject) => {
        // @ts-ignore
        leveljs.destroy('hello', err => {
          if (err) return reject(err)
          resolve(true)
        })
      })
    })
  })

  describe('interface-datastore (mount(leveljs, leveljs, leveljs))', () => {
    interfaceDatastoreTests({
      setup () {
        return new MountDatastore([{
          prefix: new Key('/a'),
          datastore: new LevelDatastore('one', { db: leveljs })
        }, {
          prefix: new Key('/q'),
          datastore: new LevelDatastore('two', { db: leveljs })
        }, {
          prefix: new Key('/z'),
          datastore: new LevelDatastore('three', { db: leveljs })
        }])
      },
      teardown () {
        return Promise.all(['one', 'two', 'three'].map(dir => {
          return new Promise((resolve, reject) => {
            // @ts-ignore
            leveljs.destroy(dir, err => {
              if (err) return reject(err)
              resolve(true)
            })
          })
        }))
      }
    })
  })
})
