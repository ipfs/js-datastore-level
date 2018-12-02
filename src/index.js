/* @flow */
'use strict'

/* :: import type {Callback, Batch, Query, QueryResult, QueryEntry} from 'interface-datastore' */

const levelup = require('levelup')
const { Key, Errors, utils } = require('interface-datastore')
const encode = require('encoding-down')

const { filter, map, take, sortAll } = utils

/**
 * A datastore backed by leveldb.
 */
/* :: export type LevelOptions = {
  createIfMissing?: bool,
  errorIfExists?: bool,
  compression?: bool,
  cacheSize?: number,
  db?: Object
} */
class LevelDatastore {
  /* :: db: levelup */

  constructor (path /* : string */, opts /* : ?LevelOptions */) {
    let database

    if (opts && opts.db) {
      database = opts.db
      delete opts.db
    } else {
      // Default to leveldown db
      database = require('leveldown')
    }

    this.db = levelup(
      encode(database(path), { valueEncoding: 'binary' }),
      Object.assign({}, opts, {
        compression: false // same default as go
      }),
      (err) => {
        // Prevent an uncaught exception error on duplicate locks
        if (err) {
          throw err
        }
      }
    )
  }

  async open () /* : Promise */ {
    try {
      await this.db.open()
    } catch (err) {
      throw Errors.dbOpenFailedError(err)
    }
  }

  async put (key /* : Key */, value /* : Buffer */) /* : Promise */ {
    try {
      await this.db.put(key.toString(), value)
    } catch (err) {
      throw Errors.dbWriteFailedError(err)
    }
  }

  async get (key /* : Key */) /* : Promise */ {
    let data
    try {
      data = await this.db.get(key.toString())
    } catch (err) {
      if (err.notFound) throw Errors.notFoundError(err)
      throw Errors.dbWriteFailedError(err)
    }
    return data
  }

  async has (key /* : Key */) /* : Promise<Boolean> */ {
    try {
      await this.db.get(key.toString())
    } catch (err) {
      if (err.notFound) return false
      throw err
    }
    return true
  }

  async delete (key /* : Key */) /* : Promise */ {
    try {
      await this.db.del(key.toString())
    } catch (err) {
      throw Errors.dbDeleteFailedError(err)
    }
  }

  async close () /* : Promise */ {
    return this.db.close()
  }

  batch () /* : Batch<Buffer> */ {
    const ops = []
    return {
      put: (key /* : Key */, value /* : Buffer */) /* : void */ => {
        ops.push({
          type: 'put',
          key: key.toString(),
          value: value
        })
      },
      delete: (key /* : Key */) /* : void */ => {
        ops.push({
          type: 'del',
          key: key.toString()
        })
      },
      commit: async () /* : Promise */ => {
        return this.db.batch(ops)
      }
    }
  }

  query (q /* : Query<Buffer> */) /* : QueryResult<Buffer> */ {
    let values = true
    if (q.keysOnly != null) {
      values = !q.keysOnly
    }

    let it = levelIteratorToIterator(
      this.db.db.iterator({
        keys: true,
        values: values,
        keyAsBuffer: true
      })
    )

    it = map(it, ({ key, value }) => {
      const res /* : QueryEntry<Buffer> */ = { key: new Key(key, false) }
      if (values) {
        res.value = Buffer.from(value)
      }
      return res
    })

    if (q.prefix != null) {
      it = filter(it, e => e.key.toString().startsWith(q.prefix))
    }

    if (Array.isArray(q.filters)) {
      it = q.filters.reduce((it, f) => filter(it, f), it)
    }

    if (Array.isArray(q.orders)) {
      it = q.orders.reduce((it, f) => sortAll(it, f), it)
    }

    if (q.offset != null) {
      let i = 0
      it = filter(it, () => i++ >= q.offset)
    }

    if (q.limit != null) {
      it = take(it, q.limit)
    }

    return it
  }
}

function levelIteratorToIterator (li) {
  return {
    next: () => new Promise((resolve, reject) => {
      li.next((err, key, value) => {
        if (err) return reject(err)
        if (key == null) return resolve({ done: true })
        resolve({ done: false, value: { key, value } })
      })
    }),
    return: () => new Promise((resolve, reject) => {
      li.end(err => {
        if (err) return reject(err)
        resolve({ done: true })
      })
    }),
    [Symbol.asyncIterator] () {
      return this
    }
  }
}

module.exports = LevelDatastore
