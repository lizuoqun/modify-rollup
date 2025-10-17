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
    this.imports = {};
    this.exports = {};
    // 存放本模块的定义变量的语句
    this.definitions = {};
    analyse(this.ast, this.code, this);
    console.log('imports', this.imports);
    console.log('exports', this.exports);
    console.log('definitions', this.definitions);
  }

  expandAllStatements() {
    let allStatements = [];
    this.ast.body.forEach(statement => {
      let statements = this.expandStatement(statement);
      allStatements.push(...statements);
    });
    return allStatements;
  }

  expandStatement(statement) {
    statement._included = true;
    let result = [];
    result.push(statement);
    return result;
  }
}

/* global module */
module.exports = Module;
