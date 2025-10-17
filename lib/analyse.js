const walk = require('./walk');
const Scope = require('./scope');

/**
 * 分析抽象语法树，给statement定义属性
 * @param {*} ast 抽象语法树
 * @param {*} code 代码字符串
 * @param {*} module 模块对象
 * */
function analyse(ast, code, module) {
  // 开始找import和export
  ast.body.forEach(statement => {
    Object.defineProperties(statement, {
      _included: {value: false, writable: true},
      _module: {value: module},
      _source: {value: code.snip(statement.start, statement.end)},
      // 依赖的变量
      _dependOn: {value: {}},
      _defines: {value: {}}
    });
    // 判断类型是否为ImportDeclaration，即import语句
    if (statement.type === 'ImportDeclaration') {
      // 找到其来源，即./message
      let source = statement.source.value;
      // 找到其导入的变量
      statement.specifiers.forEach(specifier => {
        let importedName = specifier.imported.name;
        let localName = specifier.local.name;
        // 表示import导入的变量
        module.imports[localName] = {
          source, importedName
        };
      });
    }
    // 判断类型是否为ExportNamedDeclaration，即export语句
    else if (statement.type === 'VariableDeclaration') {
      const {declaration} = statement;
      if (declaration && declaration.type === 'VariableDeclarator') {
        const {declarations} = declaration;
        declarations.forEach(item => {
          const name = item.id;
          module.exports[name] = {name};
        });
      }
    }
  });

  // 模块全局作用域
  let globalScope = new Scope({name: 'global', names: [], parent: null});
  // 创建作用域链
  ast.body.forEach(statement => {

    // 把模块下的变量等加到全局作用域下
    function addToScope(name) {
      globalScope.add(name);
      if (!globalScope.parent) {
        statement._defines[name] = true;
        module.definitions[name] = statement;
      }
    }

    walk(statement, {
      enter(node) {
        if (node.type === 'Identifier') {
          // 表示当前语句依赖了node.name
          statement._dependOn[node.name] = true;
        }
        let newScope;
        switch (node.type) {
          case 'FunctionDeclaration':
            // 先把函数名添加到当前作用域
            addToScope(node.id.name);
            // 把参数添加到当前作用域
            const names = node.params.map(param => param.name);
            // 创建函数的作用域
            newScope = new Scope({name: node.id.name, names, parent: globalScope});
            break;
          case 'VariableDeclaration':
            // 变量声明
            node.declarations.forEach(declaration => {
              addToScope(declaration.id.name);
            });
            break;
          default:
            break;
        }
        if (newScope) {
          Object.defineProperty(node, '_scope', {value: newScope});
          globalScope = newScope;
        }
      }, leave(node) {
        if (Object.hasOwnProperty(node, '_scope')) {
          globalScope = globalScope.parent;
        }
      }
    });
  });
}


/* global module */
module.exports = analyse;
