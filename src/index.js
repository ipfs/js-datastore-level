'use strict'

const {
  Key, Errors, Adapter,
  utils: {
    filter, map, take, sortAll
  }
} = require('interface-datastore')

/**
 * @typedef {import('interface-datastore').Datastore} Datastore
 * @typedef {import('interface-datastore').Pair} Pair
 * @typedef {import('interface-datastore').Batch} Batch
 * @typedef {import('interface-datastore').Query} Query
 * @typedef {import('interface-datastore').Options} QueryOptions
 */

/**
 * A datastore backed by leveldb.
 *
 * @implements {Datastore}
 */
class LevelDatastore extends Adapter {
  /**
   * @param {any} path
   * @param {Object} [opts]
   * @param {any} [opts.db] - level db reference
   * @param {boolean} [opts.createIfMissing]
   * @param {boolean} [opts.errorIfExists]
   */
  constructor (path, opts) {
    super()

    let database

    if (opts && opts.db) {
      database = opts.db
      delete opts.db
    } else {
      // @ts-ignore
      database = require('level')
    }

    this.db = this._initDb(database, path, opts)
  }

  /**
   * @param {(arg0: any, arg1: any) => any} database
   * @param {string} path
   * @param {any} opts
   */
  _initDb (database, path, opts = {}) {
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

  /**
   * @param {Key} key
   * @param {Uint8Array} value
   */
  async put (key, value) {
    try {
      await this.db.put(key.toString(), value)
    } catch (err) {
      throw Errors.dbWriteFailedError(err)
    }
  }

  /**
   * @param {Key} key
   * @returns {Promise<Uint8Array>}
   */
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

  /**
   * @param {Key} key
   * @returns {Promise<boolean>}
   */
  async has (key) {
    try {
      await this.db.get(key.toString())
    } catch (err) {
      if (err.notFound) return false
      throw err
    }
    return true
  }

  /**
   * @param {Key} key
   * @returns {Promise<void>}
   */
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

  /**
   * @returns {Batch}
   */
  batch () {
    /** @type {{ type: string; key: string; value?: Uint8Array; }[]} */
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

  /**
   * @param {Query} q
   * @returns {AsyncIterable<Pair>}
   */
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
      // @ts-ignore
      opts.gte = prefix
      // less than `prefix` + \xFF (hex escape sequence)
      // @ts-ignore
      opts.lt = prefix + '\xFF'
    }

    let it = levelIteratorToIterator(
      this.db.iterator(opts)
    )

    it = map(it, ({ key, value }) => {
      if (values) {
        return { key, value }
      }
      return /** @type {Pair} */({ key })
    })

    if (Array.isArray(q.filters)) {
      it = q.filters.reduce((it, f) => filter(it, f), it)
    }

    if (Array.isArray(q.orders)) {
      it = q.orders.reduce((it, f) => sortAll(it, f), it)
    }
    const { offset, limit } = q
    if (offset) {
      let i = 0
      it = filter(it, () => i++ >= offset)
    }

    if (limit) {
      it = take(it, limit)
    }

    return it
  }
}

/**
 * @typedef {Object} LevelIterator
 * @property {(cb: (err: Error, key: string | Uint8Array | null, value: any)=> void)=>void} next
 * @property {(cb: (err: Error) => void) => void } end
 */

/**
 * @param {LevelIterator} li - Level iterator
 * @returns {AsyncIterable<Pair>}
 */
function levelIteratorToIterator (li) {
  return {
    [Symbol.asyncIterator] () {
      return {
        next: () => new Promise((resolve, reject) => {
          li.next((err, key, value) => {
            if (err) return reject(err)
            if (key == null) {
              return li.end(err => {
                if (err) return reject(err)
                resolve({ done: true, value: undefined })
              })
            }
            resolve({ done: false, value: { key: new Key(key, false), value } })
          })
        }),
        return: () => new Promise((resolve, reject) => {
          li.end(err => {
            if (err) return reject(err)
            resolve({ done: true, value: undefined })
          })
        })
      }
    }
  }
}

module.exports = LevelDatastore
