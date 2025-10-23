const MagicString = require('magic-string');
const analyse = require('./analyse');
const {parse} = require('acorn');
const {hasOwnProperty} = require('./utils');
const SYSTEM_VAR = ['console', 'log'];

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
    // 存放变量修改语句
    this.modifications = {};
    // 重命名的变量
    this.canonicalNames = {};
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
      if (statement.type === 'VariableDeclaration') {
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
    // 找此语句定义的变量以及其修改的变量语句
    const defines = Object.keys(statement._defines);
    defines.forEach(name => {
      // 找其修改语句
      const modifications = hasOwnProperty(this.modifications, name) && this.modifications[name];
      if (modifications) {
        modifications.forEach(modification => {
          if (!modification._included) {
            const expanded = this.expandStatement(modification);
            result.push(...expanded);
          }
        });
      }
    });
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
      if (statement) {
        if (!statement._included) {
          return this.expandStatement(statement);
        } else {
          return [];
        }
      } else {
        // 排除掉系统变量
        if (SYSTEM_VAR.includes(name)) {
          return [];
        } else {
          throw new Error(`${name} is not defined`);
        }
      }
    }
  }

  reName(oldName, newName) {
    this.canonicalNames[oldName] = newName;
  }
}

/* global module */
module.exports = Module;
