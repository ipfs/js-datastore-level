import { Key } from 'interface-datastore'
import { BaseDatastore, Errors } from 'datastore-core'
import filter from 'it-filter'
import map from 'it-map'
import take from 'it-take'
import sort from 'it-sort'
import { Level } from 'level'

/**
 * @typedef {import('interface-datastore').Datastore} Datastore
 * @typedef {import('interface-datastore').Pair} Pair
 * @typedef {import('interface-datastore').Batch} Batch
 * @typedef {import('interface-datastore').Query} Query
 * @typedef {import('interface-datastore').KeyQuery} KeyQuery
 * @typedef {import('interface-datastore').Options} QueryOptions
 * @typedef {import('abstract-level').AbstractLevel<any, string, Uint8Array>} LevelDb
 */

/**
 * A datastore backed by leveldb
 */
export class LevelDatastore extends BaseDatastore {
  /**
   * @param {string | LevelDb} path
   * @param {import('level').DatabaseOptions<string, Uint8Array>} [opts]
   */
  constructor (path, opts = {}) {
    super()

    /** @type {LevelDb} */
    this.db = typeof path === 'string'
      ? new Level(path, {
        ...opts,
        keyEncoding: 'utf8',
        valueEncoding: 'view'
      })
      : path
  }

  async open () {
    try {
      await this.db.open()
    } catch (/** @type {any} */ err) {
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
    } catch (/** @type {any} */ err) {
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
    } catch (/** @type {any} */ err) {
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
    } catch (/** @type {any} */ err) {
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
    } catch (/** @type {any} */ err) {
      throw Errors.dbDeleteFailedError(err)
    }
  }

  close () {
    return this.db && this.db.close()
  }

  /**
   * @returns {Batch}
   */
  batch () {
    /** @type {Array<{ type: 'put', key: string, value: Uint8Array; } | { type: 'del', key: string }>} */
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
   */
  query (q) {
    let it = this._query({
      values: true,
      prefix: q.prefix
    })

    if (Array.isArray(q.filters)) {
      it = q.filters.reduce((it, f) => filter(it, f), it)
    }

    if (Array.isArray(q.orders)) {
      it = q.orders.reduce((it, f) => sort(it, f), it)
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

  /**
   * @param {KeyQuery} q
   */
  queryKeys (q) {
    let it = map(this._query({
      values: false,
      prefix: q.prefix
    }), ({ key }) => key)

    if (Array.isArray(q.filters)) {
      it = q.filters.reduce((it, f) => filter(it, f), it)
    }

    if (Array.isArray(q.orders)) {
      it = q.orders.reduce((it, f) => sort(it, f), it)
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

  /**
   * @param {object} opts
   * @param {boolean} opts.values
   * @param {string} [opts.prefix]
   * @returns {AsyncIterable<Pair>}
   */
  _query (opts) {
    /** @type {import('level').IteratorOptions<string, Uint8Array>} */
    const iteratorOpts = {
      keys: true,
      keyEncoding: 'buffer',
      values: opts.values
    }

    // Let the db do the prefix matching
    if (opts.prefix != null) {
      const prefix = opts.prefix.toString()
      // Match keys greater than or equal to `prefix` and
      iteratorOpts.gte = prefix
      // less than `prefix` + \xFF (hex escape sequence)
      iteratorOpts.lt = prefix + '\xFF'
    }

    return levelIteratorToIterator(this.db.iterator(iteratorOpts))
  }
}

/**
 * @param {import('level').Iterator<LevelDb, string, Uint8Array>} li - Level iterator
 * @returns {AsyncIterable<Pair>}
 */
async function * levelIteratorToIterator (li) {
  for await (const [key, value] of li) {
    yield { key: new Key(key, false), value }
  }

  await li.close()
}
