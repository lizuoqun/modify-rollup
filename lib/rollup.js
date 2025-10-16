const Bundle = require('./bundle')
function rollup(entry, output) {
  const bundle = new Bundle({entry});
  bundle.build(output);
}
/* global module */
module.exports = rollup;
