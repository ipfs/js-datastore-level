# js-datastore-level <!-- omit in toc -->

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Build Status](https://flat.badgen.net/travis/ipfs/js-datastore-level)](https://travis-ci.com/ipfs/js-datastore-level)
[![Codecov](https://codecov.io/gh/ipfs/js-datastore-level/branch/master/graph/badge.svg)](https://codecov.io/gh/ipfs/js-datastore-level)
[![Dependency Status](https://david-dm.org/ipfs/js-datastore-level.svg?style=flat-square)](https://david-dm.org/ipfs/js-datastore-level)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D8.0.0-orange.svg?style=flat-square)


> Datastore implementation with [levelup](https://github.com/level/levelup) backend.

## Lead Maintainer <!-- omit in toc -->

[Alex Potsides](https://github.com/achingbrain)

## Table of Contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
  - [Browser Shimming Leveldown](#browser-shimming-leveldown)
  - [Database names](#database-names)
- [Contribute](#contribute)
- [License](#license)

## Install

```
$ npm install datastore-level
```

## Usage

```js
import { LevelDatastore } from 'datastore-level'

// Default using level as backend for node or the browser
const store = new LevelDatastore('path/to/store')

// another leveldown compliant backend like memdown
const memStore = new LevelDatastore('my/mem/store', {
  db: require('level-mem')
})
```

### Browser Shimming Leveldown

`LevelStore` uses the `level` module to automatically use `level.js` if a modern bundler is used which can detect bundle targets based on the `pkg.browser` property in your `package.json`.

If you are using a bundler that does not support `pkg.browser`, you will need to handle the shimming yourself, as was the case with versions of `LevelStore` 0.7.0 and earlier.

### Database names

`level-js@3` changed the database prefix from `IDBWrapper-` to `level-js-`, so please specify the old prefix if you wish to continue using databases created using `datastore-level` prior to `v0.12.0`.  E.g.

```javascript
import leveljs from 'level-js'
import browserStore = new LevelDatastore('my/db/name', {
  db: (path) => leveljs(path, {
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

[MIT](LICENSE)
