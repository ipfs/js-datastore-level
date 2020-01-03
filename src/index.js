'use strict'

const { Key, Errors, utils } = require('interface-datastore')
const { filter, map, take, sortAll } = utils

/**
 * A datastore backed by leveldb.
 */
class LevelDatastore {
  constructor (path, opts) {
    let database

    if (opts && opts.db) {
      database = opts.db
      delete opts.db
    } else {
      database = require('level')
    }

    this.db = this._initDb(database, path, opts)
  }

  _initDb (database, path, opts) {
    return database(path, {
      ...opts,
      valueEncoding: 'binary',
      compression: false // same default as go
    })
  }

  async open () {
    try {
      await this.db.open()
    } catch (err) {
      throw Errors.dbOpenFailedError(err)
    }
  }

  async put (key, value) {
    try {
      await this.db.put(key.toString(), value)
    } catch (err) {
      throw Errors.dbWriteFailedError(err)
    }
  }

  async get (key) {
    let data
    try {
      data = await this.db.get(key.toString())
    } catch (err) {
      if (err.notFound) throw Errors.notFoundError(err)
      throw Errors.dbWriteFailedError(err)
    }
    return data
  }

  async has (key) {
    try {
      await this.db.get(key.toString())
    } catch (err) {
      if (err.notFound) return false
      throw err
    }
    return true
  }

  async delete (key) {
    try {
      await this.db.del(key.toString())
    } catch (err) {
      throw Errors.dbDeleteFailedError(err)
    }
  }

  close () {
    return this.db.close()
  }

  batch () {
    const ops = []
    return {
      put: (key, value) => {
        ops.push({
          type: 'put',
          key: key.toString(),
          value: value
        })
      },
      delete: (key) => {
        ops.push({
          type: 'del',
          key: key.toString()
        })
      },
      commit: () => {
        return this.db.batch(ops)
      }
    }
  }

  query (q) {
    let values = true
    if (q.keysOnly != null) {
      values = !q.keysOnly
    }

    const opts = {
      keys: true,
      values: values,
      keyAsBuffer: true
    }

    // Let the db do the prefix matching
    if (q.prefix != null) {
      const prefix = q.prefix.toString()
      // Match keys greater than or equal to `prefix` and
      opts.gte = prefix
      // less than `prefix` + \xFF (hex escape sequence)
      opts.lt = prefix + '\xFF'
    }

    let it = levelIteratorToIterator(
      this.db.iterator(opts)
    )

    it = map(it, ({ key, value }) => {
      const res = { key: new Key(key, false) }
      if (values) {
        res.value = Buffer.from(value)
      }
      return res
    })

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
        if (key == null) {
          return li.end(err => {
            if (err) return reject(err)
            resolve({ done: true })
          })
        }
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
