/**
 * 分析抽象语法树，给statement定义属性
 * @param {*} ast 抽象语法树
 * @param {*} code 代码字符串
 * @param {*} module 模块对象
 * */
function analyse(ast, code, module) {
  // 给statement定义属性
  ast.body.forEach(statement => {
    Object.defineProperties(statement, {
      _included: {value: false},
      _module: {value: module},
      _source: {value: code.snip(statement.start, statement.end)}
    });
  });
}

/* global module */
module.exports = analyse;
