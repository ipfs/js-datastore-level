/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const levelmem = require('level-mem')
const level = require('level')
const os = require('os')
const LevelStore = require('../src')

describe('LevelDatastore', () => {
  describe('initialization', () => {
    it('should default to a leveldown database', async () => {
      const levelStore = new LevelStore('init-default')
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
      const levelStore = new LevelStore('init-default', {
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
      require('interface-datastore/src/tests')({
        setup: () => new LevelStore(`${os.tmpdir()}/datastore-level-test-${Math.random()}`, { db: database }),
        teardown () {}
      })
    })
  })
})
