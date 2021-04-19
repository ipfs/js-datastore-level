## [5.0.1](https://github.com/ipfs/js-datastore-level/compare/v5.0.0...v5.0.1) (2021-04-19)



# [5.0.0](https://github.com/ipfs/js-datastore-level/compare/v4.0.0...v5.0.0) (2021-04-15)


### Features

* split .query into .query and .queryKeys ([#70](https://github.com/ipfs/js-datastore-level/issues/70)) ([39ba735](https://github.com/ipfs/js-datastore-level/commit/39ba735c591524270740b49bfaa09fa4bcbb11d0))



# [4.0.0](https://github.com/ipfs/js-datastore-level/compare/v3.0.0...v4.0.0) (2021-01-29)


### chore

* **deps:** bump level from 5.0.1 to 6.0.1 ([#31](https://github.com/ipfs/js-datastore-level/issues/31)) ([06853bd](https://github.com/ipfs/js-datastore-level/commit/06853bd389f1f0c8cd00d12219040a903ed48633))


### BREAKING CHANGES

* **deps:** requires an upgrade to existing datastores created in the browser with level-js@4 or below



# [3.0.0](https://github.com/ipfs/js-datastore-level/compare/v2.0.0...v3.0.0) (2021-01-22)


### Bug Fixes

* fix constructor ([#58](https://github.com/ipfs/js-datastore-level/issues/58)) ([621e425](https://github.com/ipfs/js-datastore-level/commit/621e42569d8c31c3d2b7311a8abd2594fa6621bd))


### Features

* types ([#53](https://github.com/ipfs/js-datastore-level/issues/53)) ([51cd55e](https://github.com/ipfs/js-datastore-level/commit/51cd55e34aa5139dd9dfdb8966df5283e3c5a324))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/ipfs/js-datastore-level/compare/v1.1.0...v2.0.0) (2020-07-29)


### Bug Fixes

* remove node buffers ([#39](https://github.com/ipfs/js-datastore-level/issues/39)) ([19fe886](https://github.com/ipfs/js-datastore-level/commit/19fe886))


### BREAKING CHANGES

* remove node buffers in favour of Uint8Arrays



<a name="1.1.0"></a>
# [1.1.0](https://github.com/ipfs/js-datastore-level/compare/v1.0.0...v1.1.0) (2020-05-07)


### Bug Fixes

* **ci:** add empty commit to fix lint checks on master ([60d14c0](https://github.com/ipfs/js-datastore-level/commit/60d14c0))


### Features

* add streaming/cancellable API ([#34](https://github.com/ipfs/js-datastore-level/issues/34)) ([6bfb51a](https://github.com/ipfs/js-datastore-level/commit/6bfb51a))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/ipfs/js-datastore-level/compare/v0.14.1...v1.0.0) (2020-04-28)



<a name="0.14.1"></a>
## [0.14.1](https://github.com/ipfs/js-datastore-level/compare/v0.14.0...v0.14.1) (2020-01-14)


### Bug Fixes

* leveldb iterator memory leak ([#26](https://github.com/ipfs/js-datastore-level/issues/26)) ([e503c1a](https://github.com/ipfs/js-datastore-level/commit/e503c1a)), closes [/github.com/Level/leveldown/blob/d3453fbde4d2a8aa04d9091101c25c999649069b/binding.cc#L545](https://github.com//github.com/Level/leveldown/blob/d3453fbde4d2a8aa04d9091101c25c999649069b/binding.cc/issues/L545)


### Performance Improvements

* optimize prefix search ([#25](https://github.com/ipfs/js-datastore-level/issues/25)) ([8efa812](https://github.com/ipfs/js-datastore-level/commit/8efa812))



<a name="0.14.0"></a>
# [0.14.0](https://github.com/ipfs/js-datastore-level/compare/v0.13.0...v0.14.0) (2019-11-29)



<a name="0.13.0"></a>
# [0.13.0](https://github.com/ipfs/js-datastore-level/compare/v0.12.1...v0.13.0) (2019-11-29)


### Bug Fixes

* init db in overridable method for easier extending ([#21](https://github.com/ipfs/js-datastore-level/issues/21)) ([b21428c](https://github.com/ipfs/js-datastore-level/commit/b21428c))



<a name="0.12.1"></a>
## [0.12.1](https://github.com/ipfs/js-datastore-level/compare/v0.12.0...v0.12.1) (2019-06-26)


### Bug Fixes

* swap leveldown/level.js for level ([#20](https://github.com/ipfs/js-datastore-level/issues/20)) ([d16e212](https://github.com/ipfs/js-datastore-level/commit/d16e212))



<a name="0.12.0"></a>
# [0.12.0](https://github.com/ipfs/js-datastore-level/compare/v0.11.0...v0.12.0) (2019-05-29)


### Bug Fixes

* remove unused var ([74d4a36](https://github.com/ipfs/js-datastore-level/commit/74d4a36))
* tests ([601599d](https://github.com/ipfs/js-datastore-level/commit/601599d))



<a name="0.11.0"></a>
# [0.11.0](https://github.com/ipfs/js-datastore-level/compare/v0.10.0...v0.11.0) (2019-04-29)



<a name="0.10.0"></a>
# [0.10.0](https://github.com/ipfs/js-datastore-level/compare/v0.9.0...v0.10.0) (2018-10-24)



<a name="0.9.0"></a>
# [0.9.0](https://github.com/ipfs/js-datastore-level/compare/v0.8.0...v0.9.0) (2018-09-19)


### Features

* add basic error codes ([02a5146](https://github.com/ipfs/js-datastore-level/commit/02a5146))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/ipfs/js-datastore-level/compare/v0.7.0...v0.8.0) (2018-05-29)


### Bug Fixes

* add test and fix constructor ([396f657](https://github.com/ipfs/js-datastore-level/commit/396f657))
* update binary encoding for levelup 2 ([a5d7378](https://github.com/ipfs/js-datastore-level/commit/a5d7378))
* upgrade level libs to resolve node 10 failure ([a427eca](https://github.com/ipfs/js-datastore-level/commit/a427eca))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/ipfs/js-datastore-level/compare/v0.6.0...v0.7.0) (2017-11-06)


### Bug Fixes

* Windows interop ([#4](https://github.com/ipfs/js-datastore-level/issues/4)) ([5d67042](https://github.com/ipfs/js-datastore-level/commit/5d67042))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/ipfs/js-datastore-level/compare/v0.5.0...v0.6.0) (2017-07-23)



<a name="0.5.0"></a>
# [0.5.0](https://github.com/ipfs/js-datastore-level/compare/v0.4.2...v0.5.0) (2017-07-22)



<a name="0.4.2"></a>
## [0.4.2](https://github.com/ipfs/js-datastore-level/compare/v0.4.0...v0.4.2) (2017-05-24)


### Bug Fixes

* Object.assign is now evil and no longer is behaving as spec says when Webpacked ([5e40f3b](https://github.com/ipfs/js-datastore-level/commit/5e40f3b))
* Object.assign is now evil and no longer is behaving as spec says when Webpacked ([c3f50ec](https://github.com/ipfs/js-datastore-level/commit/c3f50ec))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/ipfs/js-datastore-level/compare/v0.4.0...v0.4.1) (2017-05-24)


### Bug Fixes

* Object.assign is now evil and no longer is behaving as spec says when Webpacked ([077bbc1](https://github.com/ipfs/js-datastore-level/commit/077bbc1))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ipfs/js-datastore-level/compare/v0.3.0...v0.4.0) (2017-05-23)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipfs/js-datastore-level/compare/v0.2.0...v0.3.0) (2017-03-23)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipfs/js-datastore-level/compare/v0.1.0...v0.2.0) (2017-03-23)


### Features

* add open method ([fd12c6b](https://github.com/ipfs/js-datastore-level/commit/fd12c6b))



<a name="0.1.0"></a>
# 0.1.0 (2017-03-15)


### Bug Fixes

* key handling ([682f8b3](https://github.com/ipfs/js-datastore-level/commit/682f8b3))
* working interop with go ([f5e03c6](https://github.com/ipfs/js-datastore-level/commit/f5e03c6))



