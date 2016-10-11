const _ = require('lodash');
const fs = require('fs');
const q = require('q');
const redux = require('redux');

function load(current, filename) {
    return q.nfcall(fs.readFile, filename)
    .then(JSON.parse)
    .then(data => merge(current, data));
}

function merge(current, data) {
    return q.all([
        current,
        data
    ])
    .spread((current_data, merging_data) => {
        return _.merge(current_data, merging_data);
    });
}

function get(state, name, val) {
    return state.then(data => _.get(data, name, val));
}

function reducer(state, action) {
    switch (action.type) {
    case 'clear':
        return q({});
    case 'load':
        return load(state, action.filename);
    case 'set':
        return merge(state, action.data);
    default:
        if (typeof state === 'undefined') {
            return q({});
        }

        return state;
    }
}


function get_from_current_state(store, name, val) {
    return get(store.getState(), name, val);
}

function dispatch_clear(store) {
    store.dispatch({
        type: 'clear'
    });
}

function dispatch_load(store, filename) {
    store.dispatch({
        type: 'load',
        filename: filename
    });
}

function dispatch_set(store, data) {
    store.dispatch({
        type: 'set',
        data: data
    });
}

function wrap_dispatcher(conf, store) {
    return func => (...args) => {
        func.apply(null, [store].concat(args));

        return conf;
    }
}

function wrapper() {
    const store = redux.createStore(reducer);
    const conf = _.merge(
        _.wrap(store, get_from_current_state),
        {
            clear: null,
            load: null,
            set: null
        }
    );

    const dispatcher = wrap_dispatcher(conf, store);

    conf.clear = dispatcher(dispatch_clear);
    conf.load = dispatcher(dispatch_load);
    conf.set = dispatcher(dispatch_set);

    return conf;
}

module.exports = wrapper;
