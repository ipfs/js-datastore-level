/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
// @ts-ignore
import levelmem from 'level-mem'
// @ts-ignore
import level from 'level'
import { LevelDatastore } from '../src/index.js'
import tempdir from 'ipfs-utils/src/temp-dir.js'
import { interfaceDatastoreTests } from 'interface-datastore-tests'

describe('LevelDatastore', () => {
  describe('initialization', () => {
    it('should default to a leveldown database', async () => {
      const levelStore = new LevelDatastore('init-default')
      await levelStore.open()

      expect(levelStore.db.options).to.include({
        createIfMissing: true,
        errorIfExists: false
      })
      expect(levelStore.db.db.codec.opts).to.include({
        valueEncoding: 'binary'
      })
    })

    it('should be able to override the database', async () => {
      const levelStore = new LevelDatastore('init-default', {
        db: levelmem,
        createIfMissing: true,
        errorIfExists: true
      })

      await levelStore.open()

      expect(levelStore.db.options).to.include({
        createIfMissing: true,
        errorIfExists: true
      })
    })
  })

  ;[levelmem, level].forEach(database => {
    describe(`interface-datastore ${database.name}`, () => {
      interfaceDatastoreTests({
        setup: () => new LevelDatastore(tempdir(), { db: database }),
        teardown () {}
      })
    })
  })
})
