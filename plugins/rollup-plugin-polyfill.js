const PROXY_SUFFIX = '?inject-polyfill';
const POLYFILL_ID = '\0polyfill';

function polyfill() {
  return {
    name: 'rollup-plugin-polyfill',
    version: '0.0.1',
    async resolveId(source, importer, options) {
      if (source === POLYFILL_ID) {
        return {id: POLYFILL_ID, moduleSideEffects: true};
      }
      // 说明这是一个入口点
      if (options.isEntry) {
        // PluginContext.resolve 方法用于解析模块 ID，它返回一个 Promise，解析为一个包含模块信息的对象。该对象包含模块的 ID、路径、是否为外部模块等信息。
        const resolution = await this.resolve(source, importer, {skipSelf: true, ...options});
        console.log('resolveId', resolution);
        // 如果该模块无法解析，或者是外部模块，直接返回，rollup会进行external提示
        if (!resolution || resolution.external) {
          return resolution;
        }
        // 加载模块内容
        const moduleInfo = await this.load(resolution);
        console.log('load', moduleInfo);
        // 模块有副作用，不要 tree-shaking
        moduleInfo.moduleSideEffects = true;

        return `${resolution.id}${PROXY_SUFFIX}`;
      }
      return null;
    },

    async load(id) {
      if (id === POLYFILL_ID) {
        return 'console.log("polyfill")';
      }
      // 判断是不是从resolveId()返回的代理 ID
      if (id.endsWith(PROXY_SUFFIX)) {
        const entryId = id.slice(0, -PROXY_SUFFIX.length);
        let code = `
          import ${JSON.stringify(POLYFILL_ID)}';
          export * from ${JSON.stringify(entryId)};
        `;
        // 如果钩子有返回值，不去走后面的load()钩子，也不会读硬盘上的文件
        return code;
      }
      return null;
    }
  };
}
