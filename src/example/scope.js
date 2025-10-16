class Scope {
  constructor(options = {}) {
    // 作用域的名称
    this.name = options.name;
    // 父作用域
    this.parent = options.parent;
    // 此作用域内定义的变量
    this.names = options.names || [];
  }

  add(name) {
    this.names.push(name);
  }

  findDefiningScope(name) {
    if (this.names.includes(name)) {
      return this;
    } else if (this.parent) {
      return this.parent.findDefiningScope(name);
    } else {
      return null;
    }
  }
}

const a = 1;

function one() {
  const b = 1;

  function two() {
    const c = 2;
    console.log(a, b, c);
  }
}

let globalScope = new Scope({name: 'global', names: [], parent: null});
let oneScope = new Scope({name: 'one', names: ['b'], parent: globalScope});
let twoScope = new Scope({name: 'two', names: ['c'], parent: oneScope});
console.log(
  twoScope.findDefiningScope('a')?.name,
  twoScope.findDefiningScope('b')?.name,
  twoScope.findDefiningScope('c')?.name
);
