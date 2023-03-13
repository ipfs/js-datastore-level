/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { MemoryLevel } from 'memory-level'
import { Level } from 'level'
import { LevelDatastore } from '../src/index.js'
import tempdir from 'ipfs-utils/src/temp-dir.js'
import { interfaceDatastoreTests } from 'interface-datastore-tests'

describe('LevelDatastore', () => {
  describe('initialization', () => {
    it('should default to a leveldown database', async () => {
      const levelStore = new LevelDatastore('init-default')
      await levelStore.open()

      expect(levelStore.db).to.be.an.instanceOf(Level)
    })

    it('should be able to override the database', async () => {
      const levelStore = new LevelDatastore(
        // @ts-expect-error MemoryLevel does not implement the same interface as Level
        new MemoryLevel({
          keyEncoding: 'utf8',
          valueEncoding: 'view'
        })
      )

      await levelStore.open()

      expect(levelStore.db).to.be.an.instanceOf(MemoryLevel)
    })
  })

  describe('interface-datastore MemoryLevel', () => {
    interfaceDatastoreTests({
      setup: () => new LevelDatastore(
        // @ts-expect-error MemoryLevel does not implement the same interface as Level
        new MemoryLevel({
          keyEncoding: 'utf8',
          valueEncoding: 'view'
        })
      ),
      teardown () {}
    })
  })

  describe('interface-datastore Level', () => {
    interfaceDatastoreTests({
      setup: () => new LevelDatastore(tempdir()),
      teardown () {}
    })
  })
})
