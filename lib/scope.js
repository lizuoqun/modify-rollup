class Scope {
  constructor(options = {}) {
    // 作用域的名称
    this.name = options.name;
    // 父作用域
    this.parent = options.parent;
    // 此作用域内定义的变量
    this.names = options.names || [];
    // 是否为块级作用域
    this.block = !!options.block;
  }

  /**
   * 添加变量到作用域
   * @param {string} name 变量名
   * @param {boolean} isBlockDeclaration 是否为块级声明
   * */
  add(name, isBlockDeclaration) {
    // 不是块级声明，且为块级作用域，进行变量提升
    if (!isBlockDeclaration && this.block) {
      this.parent.add(name, isBlockDeclaration);
    } else {
      this.names.push(name);
    }
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

module.exports = Scope;
