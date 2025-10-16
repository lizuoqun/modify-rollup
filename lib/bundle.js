const fs = require('fs');
const path = require('path');
const Module = require('./module');

class Bundle {
  constructor(options) {
    this.entryPath = path.resolve(options.entry);
  }

  build(output) {
    const entryModule = this.fetchModule(this.entryPath);
    console.log('entryModule:', entryModule);
    this.statements = entryModule.expandAllStatements();
    console.log('statements:', this.statements);
  }

  fetchModule(importee) {
    let route = importee;
    if (route) {
      let code = fs.readFileSync(route, 'utf8');
      const module = new Module({
        code, path: importee, bundle: this
      });
      return module;
    }
  }
}

/* global module */
module.exports = Bundle;
