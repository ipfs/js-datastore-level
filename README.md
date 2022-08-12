# datastore-level <!-- omit in toc -->

[![ipfs.io](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io)
[![IRC](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Discord](https://img.shields.io/discord/806902334369824788?style=flat-square)](https://discord.gg/ipfs)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-datastore-level.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-datastore-level)
[![CI](https://img.shields.io/github/workflow/status/ipfs/js-datastore-level/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/ipfs/js-datastore-level/actions/workflows/js-test-and-release.yml)

> Datastore implementation with level(up|down) backend

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
  - [Browser Shimming Leveldown](#browser-shimming-leveldown)
  - [Database names](#database-names)
- [Contribute](#contribute)
- [License](#license)
- [Contribute](#contribute-1)

## Install

```console
$ npm i datastore-level
```

## Usage

```js
import { LevelDatastore } from 'datastore-level'

// Default using level as backend for node or the browser
const store = new LevelDatastore('path/to/store')

// another leveldown compliant backend like memory-level
const memStore = new LevelDatastore(
  new MemoryLevel({
    keyEncoding: 'utf8',
    valueEncoding: 'view'
  })
)
```

### Browser Shimming Leveldown

`LevelStore` uses the `level` module to automatically use `level` if a modern bundler is used which can detect bundle targets based on the `pkg.browser` property in your `package.json`.

If you are using a bundler that does not support `pkg.browser`, you will need to handle the shimming yourself, as was the case with versions of `LevelStore` 0.7.0 and earlier.

### Database names

`level-js@3` changed the database prefix from `IDBWrapper-` to `level-js-`, so please specify the old prefix if you wish to continue using databases created using `datastore-level` prior to `v0.12.0`.  E.g.

```javascript
import leveljs from 'level-js'
import browserStore = new LevelDatastore(
  new Level('my/db/name', {
    prefix: 'IDBWrapper-'
  })
})
```

More information: [https://github.com/Level/level-js/blob/master/UPGRADING.md#new-database-prefix](https://github.com/Level/level-js/blob/99831913e905d19e5f6dee56d512b7264fbed7bd/UPGRADING.md#new-database-prefix)

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-datastore-level/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipfs-unixfs-importer/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)
