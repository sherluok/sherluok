import { Compilation, Entrypoint } from 'webpack';

export function compileEntrypoint(compilation: Compilation, entryFilename: string): Promise<Entrypoint> {
  return new Promise((fulfill, reject) => {
    const childCompiler = compilation.createChildCompiler('html-loader_child-compiler', {}, [
      new compilation.compiler.webpack.node.NodeTargetPlugin(),
      new compilation.compiler.webpack.node.NodeTemplatePlugin(),
      new compilation.compiler.webpack.LoaderTargetPlugin('node'),
      new compilation.compiler.webpack.library.EnableLibraryPlugin('var'),
    ]);

    childCompiler.context = compilation.compiler.context;

    console.log('childCompiler.context:', childCompiler.context);
    console.log('childCompiler.loaders:', childCompiler.options.module.rules?.length);
    console.log('childCompiler.plugins:', childCompiler.options.plugins?.length);

    const entryId = 'default';

    new childCompiler.webpack.EntryPlugin(childCompiler.context, entryFilename, entryId).apply(childCompiler);

    childCompiler.runAsChild((error, entries, childCompilation) => {
      if (error || !entries || !childCompilation) {
        reject(error);
      } else {
        const entrypoint = childCompilation.entrypoints.get(entryId);
        fulfill(entrypoint!);
      }
    });
  });
}
