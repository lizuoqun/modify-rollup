const path = require('path');
const rollup = require('../lib/rollup');

const entry = path.resolve(__dirname, 'main.js');
const output = path.resolve(__dirname, '../dist/bundle.js');

rollup(entry, output);
