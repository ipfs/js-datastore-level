'use strict'

const { utils } = require('interface-datastore')
const LevelStore = require('../../src')

async function testLevelIteratorDestroy () {
  const store = new LevelStore(utils.tmpdir(), { db: require('level') })
  await store.open()
  await store.put(`/test/key${Date.now()}`, Buffer.from(`TESTDATA${Date.now()}`))
  for await (const d of store.query({})) {
    console.log(d) // eslint-disable-line no-console
  }
}

// Will exit with:
// > Assertion failed: (ended_), function ~Iterator, file ../binding.cc, line 546.
// If iterator gets destroyed (in c++ land) and .end() was not called on it.
testLevelIteratorDestroy()
