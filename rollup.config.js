import build from './plugins/rollup-plugin-build.js';

export default {
  input: './src/main.js',
  output: {
    file: './dist/rollup-bundle.js',
    format: 'cjs'
  },
  plugins: [
    build()
  ]
};
