const fs = require('fs');
const path = require('path');
const MagicString = require('magic-string');
const Module = require('./module');

class Bundle {
  constructor(options) {
    this.entryPath = path.resolve(options.entry.replace(/\.js$/, '') + '.js');
  }

  build(output) {
    const entryModule = this.fetchModule(this.entryPath);
    // console.log('entryModule:', entryModule);
    this.statements = entryModule.expandAllStatements();
    // console.log('statements:', this.statements);
    const {code} = this.generate();
    // console.log('code:', code);
    fs.writeFileSync(output, code);
    console.log('created dist in 2.6s');
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
      const source = statement._source.clone();

      // 如果是导出语句，从export
      if (statement.type === 'ExportNamedDeclaration') {
        source.remove(statement.start, statement.declaration.start);
      }

      magicString.addSource({
        content: source,
        separator: '\n'
      });
    });
    return {code: magicString.toString()};
  }
}

/* global module */
module.exports = Bundle;
