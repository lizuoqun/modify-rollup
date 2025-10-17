const MagicString = require('magic-string');
const analyse = require('./analyse');
const {parse} = require('acorn');
const {hasOwnProperty} = require('./utils');

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
    // console.log('imports', this.imports);
    // console.log('exports', this.exports);
    // console.log('definitions', this.definitions);
  }

  expandAllStatements() {
    let allStatements = [];
    this.ast.body.forEach(statement => {
      if (statement.type === 'ImportDeclaration') {
        return;
      }
      let statements = this.expandStatement(statement);
      allStatements.push(...statements);
    });
    return allStatements;
  }

  expandStatement(statement) {
    statement._included = true;
    let result = [];
    const _dependOn = Object.keys(statement._dependOn);
    _dependOn.forEach(name => {
      let definitions = this.define(name);
      result.push(...definitions);
    });
    result.push(statement);
    return result;
  }

  define(name) {
    // 区分变量是导入还是内部的
    if (hasOwnProperty(this.imports, name)) {
      // 找到是哪个模块导入的
      const {source, importedName} = this.imports[name];
      const importModule = this.bundle.fetchModule(source, this.path);
      const exportName = importModule.exports[importedName].name;
      return importModule.define(exportName);
    } else {
      // 如果非导入模块，是本地模块的话，获取此变量的变量定义语句
      let statement = this.definitions[name];
      if (statement && !statement._included) {
        return this.expandStatement(statement);
      } else {
        return [];
      }
    }
  }
}

/* global module */
module.exports = Module;
