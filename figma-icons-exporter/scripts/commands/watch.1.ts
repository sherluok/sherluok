// import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
// import esbuild from 'esbuild';
// import { Element, Root } from 'hast';
// import { fromHtml } from 'hast-util-from-html';
// import { toHtml } from 'hast-util-to-html';
// import { createReadStream, createWriteStream } from 'node:fs';
// import { mkdir, readFile, writeFile } from 'node:fs/promises';
// import { dirname, extname, relative, resolve } from 'node:path';
// import { visit } from 'unist-util-visit';
// import { z } from 'zod';

// const FigmaPluginManifestSchema = z.object({
//   main: z.string(),
//   ui: z.string(),
// }).passthrough();

// const manifestFilePath = resolve('src/plugin/manifest.json');

// readFile(manifestFilePath, 'utf-8').then((text) => FigmaPluginManifestSchema.parse(JSON.parse(text))).then(async (manifest) => {
//   console.log(manifest);

//   const mainFilePath = resolve(dirname(manifestFilePath), manifest.main);
//   const uiFilePath = resolve(dirname(manifestFilePath), manifest.ui);

//   const mainEntryPoints = [mainFilePath];

//   const uiEntryPoints = new Map<string, { element: Element, parent: Element | Root }>();
//   const uiHtmlRoot = await readFile(uiFilePath).then(fromHtml);
//   visit(uiHtmlRoot, { type: 'element', tagName: 'script' }, (element, index, parent) => {
//     if (!parent) {
//       throw { element, index, parent };
//     }
//     const src = element.properties.src;
//     if (typeof src === 'string' && src.startsWith('.')) {
//       const entryPoint = resolve(dirname(uiFilePath), src);
//       uiEntryPoints.set(entryPoint, { element, parent });
//     }
//   });

//   console.log({
//     mainEntryPoints,
//     uiEntryPoints: uiEntryPoints.values(),
//   });

//   const outBase = resolve('src');
//   const outDir = resolve('build');

//   esbuild.context({
//     entryPoints: [
//       ...mainEntryPoints,
//       ...uiEntryPoints.keys(),
//     ],
//     outbase: outBase,
//     outdir: outDir,
//     target: 'es6',
//     format: 'iife',
//     platform: 'browser',
//     // sourcemap: 'inline',
//     sourcemap: false,
//     bundle: true,
//     // minify: true,
//     minify: false,
//     write: false,
//     metafile: true,
//     plugins: [
//       vanillaExtractPlugin({}),
//       {
//         name: 'figma-manifest',
//         setup(build) {
//           let startAt = 0;
//           build.onStart(() => {
//             startAt = performance.now();
//           });
//           build.onEnd(async (result) => {
//             const endAt = performance.now();
//             console.log('[build end] %s %sms', new Date().toLocaleString(), (endAt - startAt).toFixed(0));
//             result.errors.forEach((message) => console.error(message.text));
//             result.warnings.forEach((message) => console.warn(message.text));
//             result.outputFiles?.forEach((file) => console.log(file.path));
//             // console.log(result.metafile?.outputs);

//             Object.entries(result.metafile?.outputs ?? {}).forEach(([outFile, { entryPoint, cssBundle }]) => {
//               console.warn({ outFile, entryPoint, cssBundle });
//               if (entryPoint) {
//                 const script = uiEntryPoints.get(resolve(entryPoint));
//                 if (script) {
//                   const index = script.parent.children.findIndex((child) => child === script.element);
//                   if (index === -1) {
//                     console.warn({ outFile, entryPoint, cssBundle, script, index });
//                     throw script;
//                   }

//                   const outFileContent = result.outputFiles?.find((file) => file.path === resolve(outFile))?.contents;
//                   if (!outFileContent) {
//                     throw 'Cannot find outfile!';
//                   }

//                   if (cssBundle) {
//                     const outFileContent = result.outputFiles?.find((file) => file.path === resolve(cssBundle))?.contents;
//                     if (!outFileContent) {
//                       throw 'Cannot find outfile!';
//                     }
//                     visit(uiHtmlRoot, { type: 'element', tagName: 'head' }, (element) => {
//                       element.children.push({
//                         type: 'element',
//                         tagName: 'style',
//                         properties: {},
//                         children: [{
//                           type: 'text',
//                           value: new TextDecoder().decode(outFileContent),
//                         }],
//                       });
//                     });
//                   }

//                   script.parent.children.splice(index, 1, {
//                     type: 'element',
//                     tagName: 'script',
//                     properties: {},
//                     children: [{
//                       type: 'text',
//                       value: new TextDecoder().decode(outFileContent),
//                     }],
//                   });
//                 }
//               }
//             });

//             const uiOutFilePath = resolve(outDir, relative(outBase, uiFilePath));

//             console.log({ uiOutFilePath });


//             const inlinStyle = result.outputFiles?.filter((file) => extname(file.path) === '.css').map((file) => `<style></style>`);
//             const inlineScript = result.outputFiles?.filter((file) => extname(file.path) === '.js').map((file) => `<script></script>`);

//             uiEntryPoints.forEach(() => {

//             });

//             // const inlinStyle = await readFile(resolve('build/plugin/ui.css'), 'utf-8');
//             // const inlineScript = await readFile(resolve('build/plugin/ui.js'), 'utf-8');
//             // const templateHtml = await readFile(resolve('src/plugin/ui.html'), 'utf-8');

//             // writeFile(uiOutFilePath, [
//             //   '<style>',
//             //   inlinStyle,
//             //   '</style>',
//             //   templateHtml,
//             //   '<script>',
//             //   inlineScript,
//             //   '</script>',
//             // ].join('\n'));
//             await mkdir(dirname(uiOutFilePath), { recursive: true });
//             await writeFile(uiOutFilePath, toHtml(uiHtmlRoot));

//             if (1 === 1) {
//               process.exit();
//             }

//             createReadStream(
//               resolve('src/server/ui.html'),
//             ).pipe(
//               createWriteStream(
//                 resolve('build/server/ui.html'),
//               ),
//             );
//           });
//         },
//       },
//     ],
//   }).then((context) => {
//     return context.watch();
//   }).then(() => {
//     console.log('watching');
//   });
// });
