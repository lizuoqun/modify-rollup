const MagicString = require('magic-string');
const sourceCode = `export const name = 'magic-string'`;
const ms = new MagicString(sourceCode);

console.log('snip----', ms.snip(0, 6).toString());

console.log('remove----', ms.remove(0, 7).toString());

console.log('update----', ms.update(7, 12, 'let').toString());

const bundle = new MagicString.Bundle();
bundle.addSource({
  content: `const a = 'magic-string'`,
  separator: '\n'
});

bundle.addSource({
  content: `const b = 'magic-string'`,
  separator: '\n'
});

console.log('bundle----\n', bundle.toString());
