/* @flow */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const path = require('path')
const { Key, utils } = require('interface-datastore')
const rimraf = require('rimraf')
const { MountDatastore } = require('datastore-core')
const CID = require('cids')
const { promisify } = require('util')

const LevelStore = require('../src')

describe('LevelDatastore', () => {
  describe('interface-datastore (leveldown)', () => {
    const dir = utils.tmpdir()
    require('interface-datastore/src/tests')({
      setup: () => new LevelStore(dir, { db: require('leveldown') }),
      teardown: () => promisify(rimraf)(dir)
    })
  })

  // TODO: unskip when datastore-core is converted to async/await/iterators
  describe.skip('interface-datastore (mount(leveldown, leveldown, leveldown))', () => {
    const dirs = [
      utils.tmpdir(),
      utils.tmpdir(),
      utils.tmpdir()
    ]

    require('interface-datastore/src/tests')({
      setup () {
        return new MountDatastore([{
          prefix: new Key('/a'),
          datastore: new LevelStore(dirs[0], {
            db: require('leveldown')
          })
        }, {
          prefix: new Key('/q'),
          datastore: new LevelStore(dirs[1], {
            db: require('leveldown')
          })
        }, {
          prefix: new Key('/z'),
          datastore: new LevelStore(dirs[2], {
            db: require('leveldown')
          })
        }])
      },
      teardown () {
        return Promise.all(dirs.map(dir => promisify(rimraf)(dir)))
      }
    })
  })

  it.skip('interop with go', async () => {
    const store = new LevelStore(path.join(__dirname, 'test-repo', 'datastore'), {
      db: require('leveldown')
    })

    let cids = []

    for await (const e of store.query({})) {
      cids.push(new CID(1, 'dag-cbor', e.key.toBuffer()))
    }

    expect(cids[0].version).to.be.eql(0)
    expect(cids).to.have.length(4)
  })
})
