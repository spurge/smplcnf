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

function get(file, name, val) {
    return file.then(data => {
        return name.split('.')
        .reduce((data, name) => {
            if (typeof data === 'object' &&
                typeof data[name] !== 'undefined') {
                return data[name];
            }

            return val;
        }, data);
    });
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

const file_store = redux.createStore(reducer);

function get_from_current_state(name, val) {
    return get(file_store.getState(), name, val);
}

function dispatch_clear() {
    file_store.dispatch({
        type: 'clear'
    });

    return wrapper;
}

function dispatch_load(filename) {
    file_store.dispatch({
        type: 'load',
        filename: filename
    });

    return wrapper;
}

function dispatch_set(data) {
    file_store.dispatch({
        type: 'set',
        data: data
    });

    return wrapper;
}

const wrapper = Object.assign(
    get_from_current_state,
    {
        clear: dispatch_clear,
        load: dispatch_load,
        set: dispatch_set
    }
);

module.exports = wrapper;
