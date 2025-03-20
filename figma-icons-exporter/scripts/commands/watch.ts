import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import * as esbuild from 'esbuild';
import { createReadStream, createWriteStream } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

esbuild.context({
  entryPoints: [
    resolve('src/plugin/main.ts'),
    resolve('src/plugin/ui.tsx'),
    resolve('src/server/ui.tsx'),
  ],
  outdir: 'build',
  target: 'es6',
  sourcemap: 'inline',
  format: 'iife',
  bundle: true,
  minify: true,
  plugins: [
    vanillaExtractPlugin({}),
    {
      name: 'figma-ui',
      setup(build) {
        let startAt = 0;
        build.onStart(() => {
          startAt = performance.now();
        });
        build.onEnd(async (result) => {
          const endAt = performance.now();
          console.log('[build end] %s %sms', new Date().toLocaleString(), (endAt - startAt).toFixed(0));
          result.errors.forEach((message) => console.error(message.text));
          result.warnings.forEach((message) => console.warn(message.text));
          const inlinStyle = await readFile(resolve('build/plugin/ui.css'), 'utf-8');
          const inlineScript = await readFile(resolve('build/plugin/ui.js'), 'utf-8');
          const templateHtml = await readFile(resolve('src/plugin/ui.html'), 'utf-8');

          writeFile(resolve('build/plugin/ui.html'), [
            '<style>',
            inlinStyle,
            '</style>',
            templateHtml,
            '<script>',
            inlineScript,
            '</script>',
          ].join('\n'));

          createReadStream(
            resolve('src/server/ui.html'),
          ).pipe(
            createWriteStream(
              resolve('build/server/ui.html'),
            ),
          );
        });
      },
    },
  ],
}).then((context) => {
  return context.watch();
}).then(() => {
  console.log('watching');
});
