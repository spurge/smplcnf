'use strict'
/* eslint-env mocha */

const expect = require('chai').expect
const format = require('util').format
const fs = require('fs')
const Promise = require('bluebird')

const writeFile = Promise.promisify(fs.writeFile)
const unlink = Promise.promisify(fs.unlink)

const simpleConfig = require('..')

describe('Simple Config', () => {
  it('loads json and gets values', () => {
    const filename = format(
      '/tmp/.smplcnf.test.config.%d.json',
      (new Date()).getTime()
    )

    const conf = simpleConfig()

    return writeFile(
      filename,
      '{"test":{"value":"exists!"}}'
    )
    .then(() => conf('test.value', 'dont exists'))
    .then(value => {
      expect(value)
        .to.equal('dont exists')
    })
    .then(() => {
      conf.load(filename)

      return conf('test.value', 'dont exists')
    })
    .then(value => {
      expect(value)
        .to.not.equal('dont exists')
    })
    .finally(() => unlink(filename))
  })

  it('loads multiple files and gets overwritten value', () => {
    const filename1 = format(
      '/tmp/.brewtils.test.config.%d.1.json',
      (new Date()).getTime()
    )

    const filename2 = format(
      '/tmp/.brewtils.test.config.%d.2.json',
      (new Date()).getTime()
    )

    const conf = simpleConfig()

    return Promise.all([
      writeFile(
        filename1,
        '{"test":{"value1":"funk","value2":"hello"}}'
      ),
      writeFile(
        filename2,
        '{"test":{"value2":"overwritten!","value3":"bye"}}'
      )
    ])
    .then(() => conf('test.value', 'dont exists'))
    .then(value => {
      expect(value)
        .to.equal('dont exists')
    })
    .then(() => {
      conf.load(filename1).load(filename2)

      return Promise.all([
        conf('test.value1'),
        conf('test.value2'),
        conf('test.value3')
      ])
    })
    .spread((value1, value2, value3) => {
      expect(value1).to.equal('funk')
      expect(value2).to.equal('overwritten!')
      expect(value3).to.equal('bye')
    })
    .finally(() => {
      return Promise.all([
        unlink(filename1),
        unlink(filename2)
      ])
    })
  })

  it('sets values from emptyness', () => {
    const conf = simpleConfig()

    return conf.set({key: 'value'})('key')
    .then(key => {
      expect(key).to.equal('value')
    })
  })

  it('loads and sets', () => {
    const filename = format(
      '/tmp/.brewtils.test.config.%d.json',
      (new Date()).getTime()
    )

    const conf = simpleConfig()

    return writeFile(
      filename,
      '{"test":{"value":"is there"}}'
    )
    .then(() => conf.load(filename).set({key: 'value'}))
    .then(() => conf('key'))
    .then(key => {
      expect(key).to.equal('value')

      return conf('test.value')
    })
    .then(value => {
      expect(value).to.equal('is there')
    })
    .finally(() => unlink(filename))
  })

  it('sets and clears', () => {
    const conf = simpleConfig()

    return conf.set({key: 'value'}).clear()('key', 'not there')
    .then(value => {
      expect(value).to.equal('not there')
    })
  })
})
