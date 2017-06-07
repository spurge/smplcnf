Smplcnf
=======

[![Build Status](https://semaphoreci.com/api/v1/spurge/smplcnf/branches/master/shields_badge.svg)](https://semaphoreci.com/spurge/smplcnf) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Redux based and promised JSON config reader

Install
-------

`npm install --save -E smplcnf`

How to use it
-------------

```javascript
const simpleConfig = require('smplcnf');

// Create a new config instance
const conf = simpleConfig();

// Load json configuration file
// This changes the Redux store state
conf.load('config.json');

// Then get config data with a fallback value
// from the latest state
conf('some-level-1.some-level-2.property', 'fallback')
.then(value => {
    // some code ...
});

// Clear all config data
conf.clear();

// Load multiple configurations and set values into current state.
// Useful for global.json and local-environment.json
conf.load('global.config.json');
conf.load('local.config.json');
conf.set({key: 'value'});

// Which is also chainable
conf
.load('global.config.json')
.load('local.config.json')
.set({key: 'value'});
```

How to test
-----------

* Tests: `npm test`
* Lints: `npm run lint`
