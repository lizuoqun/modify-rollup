const fs = require('fs');
const path = require('path');
const MagicString = require('magic-string');
const Module = require('./module');

class Bundle {
  constructor(options) {
    this.entryPath = path.resolve(options.entry);
  }

  build(output) {
    const entryModule = this.fetchModule(this.entryPath);
    // console.log('entryModule:', entryModule);
    this.statements = entryModule.expandAllStatements();
    // console.log('statements:', this.statements);
    const {code} = this.generate();
    // console.log('code:', code);
    fs.writeFileSync(output, code);
    console.log('modify-rollup bundle success');
  }

  fetchModule(importer) {
    let route = importer;
    if (route) {
      let code = fs.readFileSync(route, 'utf8');
      return new Module({
        code, path: importer, bundle: this
      });
    }
  }

  generate() {
    let magicString = new MagicString.Bundle();
    this.statements.forEach(statement => {
      const source = statement._source.clone();
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
