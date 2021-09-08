/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import path from 'path'
import { Key } from 'interface-datastore/key'
import rimraf from 'rimraf'
import { MountDatastore } from 'datastore-core'
import { CID } from 'multiformats/cid'
import * as Digest from 'multiformats/hashes/digest'
import * as dagCbor from '@ipld/dag-cbor'
import { promisify } from 'util'
import childProcess from 'child_process'
// @ts-ignore
import level from 'level'
// @ts-ignore
import { interfaceDatastoreTests } from 'interface-datastore-tests'
import { LevelDatastore } from '../src/index.js'
import tempdir from 'ipfs-utils/src/temp-dir.js'

describe('LevelDatastore', () => {
  describe('interface-datastore (leveldown)', () => {
    const dir = tempdir()
    interfaceDatastoreTests({
      setup: () => new LevelDatastore(dir, { db: level }),
      teardown: () => promisify(rimraf)(dir)
    })
  })

  describe('interface-datastore (mount(leveldown, leveldown, leveldown))', () => {
    const dirs = [
      tempdir(),
      tempdir(),
      tempdir()
    ]

    interfaceDatastoreTests({
      setup () {
        return new MountDatastore([{
          prefix: new Key('/a'),
          datastore: new LevelDatastore(dirs[0], {
            db: level
          })
        }, {
          prefix: new Key('/q'),
          datastore: new LevelDatastore(dirs[1], {
            db: level
          })
        }, {
          prefix: new Key('/z'),
          datastore: new LevelDatastore(dirs[2], {
            db: level
          })
        }])
      },
      teardown () {
        return Promise.all(dirs.map(dir => promisify(rimraf)(dir)))
      }
    })
  })

  it.skip('interop with go', async () => {
    const store = new LevelDatastore(path.join(__dirname, 'test-repo', 'datastore'), {
      db: level
    })

    const cids = []

    for await (const e of store.query({})) {
      cids.push(CID.createV1(dagCbor.code, Digest.decode(e.key.uint8Array())))
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
    const cp = childProcess.fork(path.join(process.cwd(), '/test/fixtures/test-level-iterator-destroy'), { stdio: 'pipe' })

    let out = ''
    const { stdout, stderr } = cp
    stdout && stdout.on('data', d => { out += d })
    stderr && stderr.on('data', d => { out += d })

    cp.on('exit', code => {
      expect(code).to.equal(0)
      expect(out).to.not.include('Assertion failed: (ended_)')
      done()
    })
  })
})
