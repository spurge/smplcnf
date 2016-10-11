Smplcnf
=======

Promised JSON config reader

Install
-------

`npm install --save smplcnf`

How to use it
-------------

```javascript
const simple_config = require('smplcnf');

// Create a new config instance
const conf = simple_config();

// Load json configuration file
conf.load('config.json');

// Get config data with a fallback value
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
