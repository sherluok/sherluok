// https://www.w3.org/TR/appmanifest/
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest

import { Element } from 'hast';
import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import { visit } from 'unist-util-visit';
import { LoaderDefinitionFunction, PitchLoaderDefinitionFunction } from 'webpack';
import { compileEntrypoint } from '../utils/child-compiler';

// https://webpack.js.org/api/loaders/
const htmlLoader: LoaderDefinitionFunction = async function (this, content, map, meta) {
  const startAt = performance.now();

  // https://webpack.js.org/api/loaders/#asynchronous-loaders
  const logger = this.getLogger('html-loader');

  console.log();
  console.log('[html-entry-loader]');
  console.log('file:', this.resource);
  console.log('code:', content);
  console.log();

  const tasks: Promise<unknown>[] = [];
  const htmlRoot = fromHtml(content);

  // 分析 <link> 元素
  visit(htmlRoot, { type: 'element', tagName: 'link' }, (element, index, parent) => {
    if (Array.isArray(element.properties.rel)) {
      if (element.properties.rel.includes('icon')) {
        if (typeof element.properties.href === 'string' && isRelativeResource(element.properties.href)) {
          this.addDependency(this.utils.absolutify(this.context, element.properties.href));
          // https://webpack.js.org/api/loaders/#thisimportmodule
          // https://github.com/webpack/webpack/issues/18928
          const request = addAssetAutoParam(element.properties.href);
          // const wrapper = `data:text/javascript;charset=UTF-8,export { default } from ${JSON.stringify(this.utils.absolutify(this.context, request))};`;
          const wrapper = `!!${require.resolve('./asset-request-loader')}!${request}`;
          tasks.push(this.importModule(wrapper).then((result) => {
            console.log('this.importModule("%s") result:', wrapper, result);
            element.properties.href = result;
          }));
        }
      }
    }
  });

  // 分析 <script> 元素
  visit(htmlRoot, { type: 'element', tagName: 'script' }, (element, index, parent) => {
    const srcAttr = element.properties.src;
    // src为相对路径才处理
    if (typeof srcAttr === 'string' && isRelativeResource(srcAttr)) {
      const srcFile = this.utils.absolutify(this.context, srcAttr);
      logger.info(`detected <script src="${srcAttr}">, add to entry \x1b[36m${srcFile}\x1b[0`);
      this.addDependency(srcFile);

      const compiler = this._compiler!;
      const compilation = this._compilation!;

      // tasks.push(new Promise<void>((fulfill, reject) => {
      //   const childCompiler = compilation.createChildCompiler('html-loader_child-compiler', {}, [
      //     new compiler.webpack.node.NodeTargetPlugin(),
      //     new compiler.webpack.node.NodeTemplatePlugin(),
      //     new compiler.webpack.LoaderTargetPlugin('node'),
      //     new compiler.webpack.library.EnableLibraryPlugin('var'),
      //   ]);

      //   childCompiler.context = compiler.context;

      //   console.log('childCompiler.context:', childCompiler.context);
      //   console.log('childCompiler.loaders:', childCompiler.options.module.rules?.length);
      //   console.log('childCompiler.plugins:', childCompiler.options.plugins?.length);

      //   new childCompiler.webpack.EntryPlugin(
      //     childCompiler.context,
      //     srcFile,
      //     entryOptions,
      //   ).apply(childCompiler);

      //   childCompiler.hooks.thisCompilation.tap('html-loader', (childCompilation) => {
      //     console.log('childCompiler.hooks.thisCompilation');
      //     childCompilation.hooks.processAssets.tapPromise({
      //       name: 'html-loader',
      //       // https://webpack.js.org/api/compilation-hooks/#list-of-asset-processing-stages
      //       stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
      //     }, async () => {
      //       console.log('childCompilation.hooks.processAssets');
      //       const entrypoint = childCompilation.entrypoints.get(entryName)!;
      //       const files = entrypoint.getFiles();
      //       console.log('files:', files);
      //       // fulfill();

      //       const publicPath = compiler.options.output.publicPath ?? '/';
      //       const replaceWithScriptElements = entrypoint.getFiles().filter((it) => {
      //         return it.endsWith('.js');
      //       }).map((relativePathToOutDir: string): Element => {
      //         return {
      //           type: 'element',
      //           tagName: 'script',
      //           properties: {
      //             src: publicPath + relativePathToOutDir,
      //           },
      //           children: [],
      //         };
      //       });
      //       parent!.children.splice(index!, 1, ...replaceWithScriptElements);
      //       const addCssLinks = entrypoint.getFiles().filter((it) => it.endsWith('.css')).map((relativePathToOutDir: string): Element => {
      //         return {
      //           type: 'element',
      //           tagName: 'link',
      //           properties: {
      //             rel: ['stylesheet'],
      //             href: publicPath + relativePathToOutDir,
      //           },
      //           children: [],
      //         };
      //       });
      //       visit(htmlRoot, { type: 'element', tagName: 'head' }, (node) => {
      //         node.children.push(...addCssLinks);
      //       });
      //     });
      //   });

      //   childCompiler.runAsChild((error, entries, childCompilation) => {
      //     if (error || !entries || !childCompilation) {
      //       reject(error);
      //     } else {
      //       fulfill();
      //     }
      //   });
      // }));
      tasks.push(compileEntrypoint(compilation, srcFile).then((entrypoint) => {
        const files = entrypoint.getFiles();
        console.log('files:', files);

        const publicPath = compiler.options.output.publicPath ?? '/';
        const replaceWithScriptElements = entrypoint.getFiles().filter((it) => it.endsWith('.js')).map((relativePathToOutDir: string): Element => {
          return {
            type: 'element',
            tagName: 'script',
            properties: {
              src: publicPath + relativePathToOutDir,
            },
            children: [],
          };
        });
        parent!.children.splice(index!, 1, ...replaceWithScriptElements);
        const addCssLinks = entrypoint.getFiles().filter((it) => it.endsWith('.css')).map((relativePathToOutDir: string): Element => {
          return {
            type: 'element',
            tagName: 'link',
            properties: {
              rel: ['stylesheet'],
              href: publicPath + relativePathToOutDir,
            },
            children: [],
          };
        });
        visit(htmlRoot, { type: 'element', tagName: 'head' }, (node) => {
          node.children.push(...addCssLinks);
        });
      }));
    }
  });

  await Promise.all(tasks);

  const endAt = performance.now();
  console.log('[html-loader] %s \x1b[35m%sms\x1b[0m', this.resource, (endAt - startAt).toFixed(0));

  return toHtml(htmlRoot);
};

const htmlLoaderPitch: PitchLoaderDefinitionFunction = function (this, remainingRequest, previousRequest, data) {
  console.log(data);
};

// module.exports.pitch = htmlLoaderPitch;
module.exports = htmlLoader;

function isRelativeResource(uri: string): boolean {
  return ['http://', 'https://', '/'].every((prefix) => !uri.startsWith(prefix));
}

function addAssetAutoParam(uri: string): string {
  const [path, query] = uri.split('?');
  const searchParams = new URLSearchParams(query);
  if (!searchParams.has('asset')) {
    searchParams.set('asset', 'auto');
  }
  return [path, searchParams.toString()].join('?');
}
