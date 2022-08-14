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
   * @param {import('level').DatabaseOptions<string, Uint8Array> & import('level').OpenOptions} [opts]
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

    /** @type {import('level').OpenOptions} */
    this.opts = {
      createIfMissing: true,
      compression: false, // same default as go
      ...opts
    }
  }

  async open () {
    try {
      await this.db.open(this.opts)
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

    const iterator = this.db.iterator(iteratorOpts)

    if (iterator[Symbol.asyncIterator]) {
      return levelIteratorToIterator(iterator)
    }

    // @ts-expect-error support older level
    if (iterator.next != null && iterator.end != null) {
      // @ts-expect-error support older level
      return oldLevelIteratorToIterator(iterator)
    }

    throw new Error('Level returned incompatible iterator')
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

/**
 * @typedef {object} LevelIterator
 * @property {(cb: (err: Error, key: string | Uint8Array | null, value: any)=> void)=>void} next
 * @property {(cb: (err: Error) => void) => void } end
 */

/**
 * @param {LevelIterator} li - Level iterator
 * @returns {AsyncIterable<Pair>}
 */
function oldLevelIteratorToIterator (li) {
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
