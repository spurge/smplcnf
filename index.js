'use strict'

const _ = require('lodash')
const fs = require('fs')
const redux = require('redux')

function readFile (filename) {
  return new Promise((resolve, reject) =>
    fs.readFile(filename, (err, data) => {
      if (err) return reject(err)
      return resolve(data)
    })
  )
}

function load (current, filename) {
  return readFile(filename)
  .then(JSON.parse)
  .then(data => merge(current, data))
}

function merge (current, data) {
  return Promise.all([
    current,
    data
  ])
  .then(data => {
    return _.merge(data[0], data[1])
  })
}

function get (state, name, val) {
  return state.then(data => _.get(data, name, val))
}

function reducer (state, action) {
  switch (action.type) {
    case 'clear':
      return Promise.resolve({})
    case 'load':
      return load(state, action.filename)
    case 'set':
      return merge(state, action.data)
    default:
      if (typeof state === 'undefined') {
        return Promise.resolve({})
      }

      return state
  }
}

function getFromCurrentState (store, name, val) {
  return get(store.getState(), name, val)
}

function dispatchClear (store) {
  store.dispatch({
    type: 'clear'
  })
}

function dispatchLoad (store, filename) {
  store.dispatch({
    type: 'load',
    filename: filename
  })
}

function dispatchSet (store, data) {
  store.dispatch({
    type: 'set',
    data: data
  })
}

function wrapDispatcher (conf, store) {
  return func => (...args) => {
    if (typeof func === 'function') {
      func.apply(null, [store].concat(args))
    } else {
      throw new ReferenceError('Wrapped dispatcher are not defined')
    }

    return conf
  }
}

function wrapper () {
  const store = redux.createStore(reducer)
  const conf = _.merge(
    _.wrap(store, getFromCurrentState),
    {
      clear: null,
      load: null,
      set: null
    }
  )

  const dispatcher = wrapDispatcher(conf, store)

  conf.clear = dispatcher(dispatchClear)
  conf.load = dispatcher(dispatchLoad)
  conf.set = dispatcher(dispatchSet)

  return conf
}

module.exports = wrapper
