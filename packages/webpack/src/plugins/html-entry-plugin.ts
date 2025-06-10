import { Element, Root } from 'hast';
import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import { visit } from 'unist-util-visit';
import { Compilation, Compiler, WebpackPluginInstance } from 'webpack';

export class HtmlEntryPlugin implements WebpackPluginInstance {
  static readonly NAME = 'html-entry-plugin';

  #entries: Record<string, string>;

  constructor(entries: Record<string, string>) {
    for (const it of Object.values(entries)) {
      if (!it.endsWith('.html')) {
        throw new Error(`📦 [🧩 ${HtmlEntryPlugin.NAME}] Entry must be .html file, but recieved "${it}"!`);
      }
    }
    this.#entries = entries;
  }

  #log(message: string, ...args: unknown[]): void {
    return;
    console.log(`📦 [🧩 \x1b[32;1m${HtmlEntryPlugin.NAME}\x1b[0m] ` + message, ...args);
  }

  #info(message: string, ...args: unknown[]): void {
    return;
    console.log(`📦 [🧩 \x1b[32;1m${HtmlEntryPlugin.NAME}\x1b[0m] ` + '\x1b[33m' + message + '\x1b[0m', ...args);
  }

  #warn(message: string, ...args: unknown[]): void {
    return;
    console.log(`📦 [🧩 \x1b[32;1m${HtmlEntryPlugin.NAME}\x1b[0m] ` + '\x1b[31m' + message + '\x1b[0m', ...args);
  }

  apply(compiler: Compiler): void {
    if (compiler.isChild()) {
      this.#info('detected child compiler, skip...');
      return;
    }

    if (compiler.watchMode) {
      this.#info('detected watch mode, adding entries to watch files...');
    }

    compiler.hooks.thisCompilation.tap(HtmlEntryPlugin.NAME, (compilation) => {
      console.log(`📦 [🧩 \x1b[32;1m${HtmlEntryPlugin.NAME}\x1b[0m] ` + '\x1b[33m' + '%s' + '\x1b[0m', 'compiler.hooks.thisCompilation');

      type AbsoluteFilePath = string;
      type FileProtocolUriString = string;
      type OutputFileName = string;
      type EntryName = string;
      type ExportName = string;

      const outputItems = new Map<OutputFileName, Root>();
      const htmlRoots = new Map<AbsoluteFilePath, Root>();
      const entryScripts = new Map<AbsoluteFilePath, EntryName>();
      const scriptElements = new Map<Element, { root: Root, srcFile: AbsoluteFilePath; }>();
      const entryHrefs = new Map<FileProtocolUriString, { exportName: string; exportValue: string; }>();
      const linkElements = new Map<Element, { root: Root, hrefFileUri: FileProtocolUriString; }>();

      for (const [htmlOutName, htmlSrcFile] of Object.entries(this.#entries)) {
        // 键名为输出文件名，键名没有.html后缀的添加.html后缀。
        let htmlOutFileName: string;
        if (htmlOutName.endsWith('.html')) {
          htmlOutFileName = htmlOutName;
        } else {
          htmlOutFileName = htmlOutName + '.html';
        }
        // 键值为源HTML文件地址，相对地址根据context解析
        const htmlFilePath = resolve(compiler.context, htmlSrcFile);
        // 以源文件地址作为键，防止重复处理同一个HTML
        let htmlRoot = htmlRoots.get(htmlFilePath);
        if (htmlRoot) {
          outputItems.set(htmlOutFileName, htmlRoot);
          continue;
        }
        // 读取源HTML文件内容，并解析为AST
        htmlRoot = fromHtml(readFileSync(htmlFilePath));
        outputItems.set(htmlOutFileName, htmlRoot);

        // 分析 <script> 元素
        visit(htmlRoot, { type: 'element', tagName: 'script' }, (element) => {
          const srcAttr = element.properties.src;
          // src为相对路径才处理
          if (typeof srcAttr === 'string' && srcAttr.startsWith('./')) {
            const srcFile = join(dirname(htmlFilePath), srcAttr);
            this.#info(`detected <script src="${srcAttr}">, add to entry \x1b[36m${srcFile}\x1b[0`);
            // 防止将同一个文件重复作为打包入口
            if (!entryScripts.has(srcFile)) {
              const entryName = `${entryScripts.size}_${randomBytes(8).toString('hex')}`;
              entryScripts.set(srcFile, entryName);
            }
            scriptElements.set(element, {
              root: htmlRoot,
              srcFile: srcFile,
            });
          }
        });

        // 分析 <link> 元素
        visit(htmlRoot, { type: 'element', tagName: 'link' }, (element) => {
          const hrefAttr = element.properties.href;
          // href为相对路径才处理
          if (typeof hrefAttr === 'string' && !(hrefAttr.startsWith('/') || hrefAttr.startsWith('http://') || hrefAttr.startsWith('https://'))) {
            // const hrefFile = join(dirname(htmlFilePath), hrefAttr);
            // const hrefFileURL = pathToFileURL(hrefFile);
            const hrefFileURL = new URL(hrefAttr, pathToFileURL(htmlFilePath));
            if (Array.isArray(element.properties.rel)) {
              if (element.properties.rel.includes('manifest')) {
                // 特殊对待 rel="manifest"，在资源末尾添加 ?web-manifest 来使用内部 loader 进行进一步处理
                hrefFileURL.searchParams.set('web-manifest', 'true');
              } else if (element.properties.rel.includes('icon')) {
                if (!hrefFileURL.searchParams.has('asset')) {
                  hrefFileURL.searchParams.set('asset', 'auto');
                }
              }
            }
            const hrefFileUri = hrefFileURL.toString();
            this.#info(`detected <link href="${hrefAttr}">, add to import \x1b[36m${hrefFileUri}\x1b[0m`);
            // 防止将同一个资源重复导入
            if (!entryHrefs.has(hrefFileUri)) {
              const exportName = `href_${entryScripts.size}_${randomBytes(8).toString('hex')}`;
              entryHrefs.set(hrefFileUri, { exportName, exportValue: '' });
            }
            linkElements.set(element, {
              root: htmlRoot,
              hrefFileUri,
            });
          }
        });
      }

      // https://github.com/jantimon/html-webpack-plugin/blob/main/lib/child-compiler.js

      // 创建子编译器，导出内容挂载到名为 HTML_ENTRY_PLUGIN_RESULT 的变量
      const childCompiler = compilation.createChildCompiler(HtmlEntryPlugin.NAME + '_child-compiler', {
        filename: `__${HtmlEntryPlugin.NAME}_child-compiler_[name].js`,
        library: {
          type: 'var',
          name: 'HTML_ENTRY_PLUGIN_RESULT',
        },
        scriptType: 'text/javascript',
        iife: true,
      }, [
        new compiler.webpack.node.NodeTargetPlugin(),
        new compiler.webpack.node.NodeTemplatePlugin(),
        new compiler.webpack.LoaderTargetPlugin('node'),
        new compiler.webpack.library.EnableLibraryPlugin('var'),
      ]);

      childCompiler.context = compiler.context;

      // 一般的 <link> 元素引用的图片文件由用户配置的 loader 加载，
      // 但 <link rel="manifest" href="./manifest.json"> 这种要特殊对待。
      // manifest.json 内部声明的图标文件路径也可以是相对路径，要加载其指向资源，
      // 然后在 manifest.json 中替换为打包后输出的文件路径。
      childCompiler.options.module.rules.push({
        // test: /manifest\.json$/i,
        resourceQuery: /web-manifest/,
        type: 'asset/resource',
        generator: {
          // https://webpack.js.org/configuration/module/#rulegeneratorpublicpath
          // https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/start_url
          // start_url 相对 manifest.json 自身的 URL 进行解析，所以 manifest.json 不能使用外域 CDN，也不能使用 dataURI。
          publicPath: '/',
        },
        use: [ // https://webpack.js.org/configuration/module/#useentry
          require.resolve('../loaders/web-application-manifest-loader'),
        ],
      });

      // 生成子编译器要编译的代码，主要是导出 <link href="xx"> 的输出文件地址。
      const entryName = 'for-link-hrefs';
      const entryCode = 'data:text/javascript;charset=UTF-8,' + ([
        ...[...entryHrefs].map(([hrefFileUri, { exportName }]) => {
          return `export { default as ${exportName} } from "${hrefFileUri}";`;
        }),
      ].join(''));
      // console.log('entryCode:', entryCode);
      new compiler.webpack.EntryPlugin(
        childCompiler.context,
        entryCode,
        entryName,
      ).apply(childCompiler);

      this.#info(`child compiler entry name ${entryName}, entry code: ${entryCode}`);

      // const childEntrypointAssets: Record<string, string> = {
      //   [`__html-entry-plugin_child-compiler_${entryName}.js`]: '',
      // };

      const childCompilationPromise = new Promise<void>((fulfill, reject) => {
        childCompiler.hooks.thisCompilation.tap(HtmlEntryPlugin.NAME, (childCompilation) => {
          childCompilation.hooks.processAssets.tapPromise(
            {
              name: HtmlEntryPlugin.NAME,
              // https://webpack.js.org/api/compilation-hooks/#list-of-asset-processing-stages
              stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
            },
            async (assets) => {
              this.#info('child compiler assets:', Object.keys(assets));
              this.#info('child compiler entrypoints:', [...childCompilation.entrypoints.keys()]);

              const entrypoint = childCompilation.entrypoints.get(entryName);
              if (!entrypoint) {
                throw new Error(`Cannot find entrypoint "${entryName}"!`);
              }

              const files = entrypoint.getFiles();
              if (!files.length) {
                this.#warn(`no files for entrypoint "${entryName}"!`);
              }
              // console.log('child compiler run result:', files);

              const vmContext = {
                HTML_ENTRY_PLUGIN_RESULT: {} as Record<string, any>,
              };
              createContext(vmContext);
              // 运行所有由入口编译出的JS代码
              files.forEach((file) => {
                if (file.endsWith('.js')) {
                  const asset = childCompilation.getAsset(file);
                  if (!asset) {
                    this.#warn(`cannot find file "${file}" in assets!`);
                    throw file;
                  }
                  // childCompilation.deleteAsset(file);
                  const code = asset.source.source().toString('utf-8');
                  // console.log('child compiler asset:', file, code);
                  runInContext(code, vmContext);
                  // 运行完以后删除从输出目录中删除
                  childCompilation.deleteAsset(file);
                }
              });
              // 读取导出结果，更新记录表
              this.#info('HTML_ENTRY_PLUGIN_RESULT =', vmContext.HTML_ENTRY_PLUGIN_RESULT);
              entryHrefs.forEach(({ exportName }, key) => {
                const exportValue = vmContext.HTML_ENTRY_PLUGIN_RESULT[exportName];
                if (!exportValue) {
                  this.#warn(`no export value for name "${exportName}" (import path is "${key}")!`);
                }
                entryHrefs.set(key, { exportName, exportValue });
              });
              // Object.keys(hrefs).forEach((hrefFile, index) => {
              //   const exportName = `href_${index}`;
              //   hrefs[hrefFile] = vmContext.HTML_ENTRY_PLUGIN_RESULT[exportName];
              // });
              // console.log(hrefs);

              // for (const key of Object.keys(childEntrypointAssets)) {
              //   const asset = childCompilation.getAsset(key);
              //   if (!asset) {
              //     throw key;
              //   }
              //   childEntrypointAssets[key] = asset.source.source().toString('utf-8');
              //   childCompilation.deleteAsset(key);
              // }
            },
          );
        });
        childCompiler.runAsChild((error, entries, childCompilation) => {
          if (error || !entries || !childCompilation) {
            reject(error);
          } else {
            fulfill();
          }
        });
      });

      entryScripts.forEach((entryName, absFilePath) => {
        new compiler.webpack.EntryPlugin(compiler.context, absFilePath, entryName).apply(compiler);
      });
      // scriptElements.forEach(({ srcFile }, uuid) => {
      //   new compiler.webpack.EntryPlugin(compiler.context, srcFile, { name: uuid }).apply(compiler);
      // });

      compilation.hooks.processAssets.tapPromise({
        name: HtmlEntryPlugin.NAME,
        stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
      }, async () => {
        await childCompilationPromise;
        this.#info('compilation.hooks.processAssets');
        this.#info('entryHrefs:', entryHrefs);
        // this.#info('entries:', Object.fromEntries(compilation.entries));
        // this.#info('entrypoints:', Object.fromEntries(compilation.entrypoints));
        for (const [element, { root, srcFile }] of scriptElements) {
          const entryName = entryScripts.get(srcFile);
          if (!entryName) throw srcFile;
          const entrypoint = compilation.entrypoints.get(entryName);
          if (!entrypoint) {
            throw new Error(`📦 [🧩 ${HtmlEntryPlugin.NAME}] Cannot find entrypoint add "${entryName}".`);
          }
          this.#info(`files of entrypoint ${entryName}:`, entrypoint.getFiles());
          visit(root, { type: 'element', tagName: 'script' }, (node, index, parent) => {
            if (!parent) {
              throw new Error('script element has no parent!');
            }
            if (typeof index === 'undefined') {
              throw new Error('script element has no index!');
            }
            if (node === element) {
              const publicPath = compiler.options.output.publicPath ?? '/';
              const replaceWithScriptElements = entrypoint.getFiles().filter((it) => {
                return it.endsWith('.js');
              }).map((relativePathToOutDir: string): Element => {
                return {
                  type: 'element',
                  tagName: 'script',
                  properties: {
                    src: publicPath + relativePathToOutDir,
                  },
                  children: [],
                };
              });
              parent.children.splice(index, 1, ...replaceWithScriptElements);
              const addCssLinks = entrypoint.getFiles().filter((it) => it.endsWith('.css')).map((relativePathToOutDir: string): Element  => {
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
              visit(root, { type: 'element', tagName: 'head' }, (node) => {
                node.children.push(...addCssLinks);
              });
            }
          });
        }

        for (const [element, { root, hrefFileUri }] of linkElements) {
          visit(root, { type: 'element', tagName: 'link' }, (node, index, parent) => {
            if (!parent) {
              throw new Error('link element has no parent!');
            }
            if (typeof index === 'undefined') {
              throw new Error('link element has no index!');
            }
            if (node === element) {
              const item = entryHrefs.get(hrefFileUri);
              if (!item || !item.exportValue) {
                throw hrefFileUri;
              }
              element.properties.href = item.exportValue;
            }
          });
        }

        outputItems.forEach((root, outFileName) => {
          const outputHtmlCode = toHtml(root);
          this.#log(`output html ${outFileName}:`, outputHtmlCode);
          compilation.emitAsset(
            outFileName,
            new compiler.webpack.sources.RawSource(outputHtmlCode),
          );
        });

        this.#log('hook end.');
      });
    });
  }
}
