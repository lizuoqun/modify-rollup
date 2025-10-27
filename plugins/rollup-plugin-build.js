/**
 * 构建插件
 * */
function build() {

  return {
    name: 'rollup-plugin-build',
    version: '0.0.1',
    options() {
      console.log('options');
    },
    buildStart(inputOptions) {
      console.log('buildStart');
    },
    async resolveId(source, importer) {
      console.log('resolveId', source, importer);
    },
    async load(id) {
      console.log('load', id);
    },
    async transform(code, id) {
      console.log('transform', code, id);
    },
    buildEnd() {
      console.log('buildEnd');
    }
  };
}

export default build;
