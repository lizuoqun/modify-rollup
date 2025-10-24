const fs = require('fs');
const path = require('path');
const MagicString = require('magic-string');
const Module = require('./module');
const {hasOwnProperty} = require('./utils');
const walk = require('./walk');

class Bundle {
  constructor(options) {
    this.entryPath = path.resolve(options.entry.replace(/\.js$/, '') + '.js');
  }

  build(output) {
    const entryModule = this.fetchModule(this.entryPath);
    // console.log('entryModule:', entryModule);
    this.statements = entryModule.expandAllStatements();
    // console.log('statements:', this.statements);

    this.deConflict();

    const {code} = this.generate();
    // console.log('code:', code);
    fs.writeFileSync(output, code);
    console.log('created dist in 2.6s');
  }

  // 解决变量名冲突
  deConflict() {
    // 定义过的变量
    const defines = {};
    // 变量名冲突的变量
    const conflicts = {};

    this.statements.forEach(statement => {
      Object.keys(statement._defines).forEach(name => {
        if (hasOwnProperty(defines, name)) {
          conflicts[name] = true;
        } else {
          defines[name] = [];
        }
        defines[name].push(statement._module);
      });
    });

    Object.keys(conflicts).forEach(name => {
      const modules = defines[name];
      // 最后一个用这个名字可以不做处理
      modules.pop();
      modules.forEach((module, index) => {
        const replaceName = `${name}$${modules.length - index}`;
        module.reName(name, replaceName);
      });
    });
  }

  fetchModule(importee, importer) {
    let route;
    if (!importer) {
      route = importee;
    } else {
      if (path.isAbsolute(importee)) {
        route = importee;
      } else {
        route = path.resolve(path.dirname(importer), importee.replace(/\.js$/, '') + '.js');
      }
    }

    if (route) {
      let code = fs.readFileSync(route, 'utf8');
      return new Module({
        code, path: route, bundle: this
      });
    }
  }

  generate() {
    let magicString = new MagicString.Bundle();
    this.statements.forEach(statement => {

      let replaceNames = {};
      // 定义的变量、依赖的变量都要进行重命名
      Object.keys(statement._defines).concat(Object.keys(statement._dependOn)).forEach(name => {
        const canonicalName = statement._module.getCanonicalName(name);
        if (canonicalName !== name) {
          replaceNames[name] = canonicalName;
        }
      });


      const source = statement._source.clone();

      // 如果是导出语句，从export
      if (statement.type === 'ExportNamedDeclaration') {
        source.remove(statement.start, statement.declaration.start);
      }

      this.replaceIdentifier(statement, source, replaceNames);

      magicString.addSource({
        content: source, separator: '\n'
      });
    });
    return {code: magicString.toString()};
  }

  replaceIdentifier(statement, source, replaceNames) {
    walk(statement, {
      enter(node) {
        // 表示是一个标识符，且是需要重命名的
        if (node.type === 'Identifier' && node.name && replaceNames[node.name]) {
          source.overwrite(node.start, node.end, replaceNames[node.name]);
        }
      }
    });
  }
}

/* global module */
module.exports = Bundle;
