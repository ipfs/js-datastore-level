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
const childProcess = require('child_process')

const LevelStore = require('../src')

describe('LevelDatastore', () => {
  describe('interface-datastore (leveldown)', () => {
    const dir = utils.tmpdir()
    require('interface-datastore/src/tests')({
      setup: () => new LevelStore(dir, { db: require('level') }),
      teardown: () => promisify(rimraf)(dir)
    })
  })

  describe('interface-datastore (mount(leveldown, leveldown, leveldown))', () => {
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
            db: require('level')
          })
        }, {
          prefix: new Key('/q'),
          datastore: new LevelStore(dirs[1], {
            db: require('level')
          })
        }, {
          prefix: new Key('/z'),
          datastore: new LevelStore(dirs[2], {
            db: require('level')
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
      db: require('level')
    })

    const cids = []

    for await (const e of store.query({})) {
      cids.push(new CID(1, 'dag-cbor', e.key.toBuffer()))
    }

    expect(cids[0].version).to.be.eql(0)
    expect(cids).to.have.length(4)
  })

  // The `.end()` method MUST be called on LevelDB iterators or they remain open,
  // leaking memory.
  //
  // This test exposes this problem by causing an error to be thrown on process
  // exit when an iterator is open AND leveldb is not closed.
  //
  // Normally when leveldb is closed it'll automatically clean up open iterators
  // but if you don't close the store this error will occur:
  //
  // > Assertion failed: (ended_), function ~Iterator, file ../binding.cc, line 546.
  //
  // This is thrown by a destructor function for iterator objects that asserts
  // the iterator has ended before cleanup.
  //
  // https://github.com/Level/leveldown/blob/d3453fbde4d2a8aa04d9091101c25c999649069b/binding.cc#L545
  it('should not leave iterators open and leak memory', (done) => {
    const cp = childProcess.fork(`${__dirname}/fixtures/test-level-iterator-destroy`, { stdio: 'pipe' })

    let out = ''
    cp.stdout.on('data', d => { out += d })
    cp.stderr.on('data', d => { out += d })

    cp.on('exit', code => {
      expect(code).to.equal(0)
      expect(out).to.not.include('Assertion failed: (ended_)')
      done()
    })
  })
})
