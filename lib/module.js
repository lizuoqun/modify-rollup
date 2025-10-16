const MagicString = require('magic-string');
const analyse = require('./analyse');
const {parse} = require('acorn');

class Module {
  constructor({code, path, bundle}) {
    this.code = new MagicString(code, {filename: path});
    this.path = path;
    this.bundle = bundle;
    this.ast = parse(code, {
      ecmaVersion: 8,
      sourceType: 'module'
    });
    analyse(this.ast, this.code, this);
  }
}

/* global module */
module.exports = Module;
