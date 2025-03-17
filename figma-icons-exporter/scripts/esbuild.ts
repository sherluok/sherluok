import {
  vanillaExtractPlugin
} from '@vanilla-extract/esbuild-plugin';
import * as esbuild from 'esbuild';
import { createReadStream, createWriteStream } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

esbuild.context({
  entryPoints: [
    resolve('src/plugin/figma/main.ts'),
    resolve('src/plugin/figma/ui.tsx'),
    resolve('src/server/web/index.tsx'),
  ],
  outdir: 'build',
  target: 'es6',
  sourcemap: 'inline',
  format: 'iife',
  bundle: true,
  plugins: [
    vanillaExtractPlugin({
    }),
    {
      name: 'figma-ui',
      setup(build) {
        build.onEnd(async (result) => {
          console.log('[build end]', new Date().toLocaleString());
          result.errors.forEach((message) => console.error(message.text));
          result.warnings.forEach((message) => console.warn(message.text));
          const inlinStyle = await readFile(resolve('build/plugin/figma/ui.css'), 'utf-8');
          const inlineScript = await readFile(resolve('build/plugin/figma/ui.js'), 'utf-8');
          const templateHtml = await readFile(resolve('src/plugin/figma/ui.html'), 'utf-8');

          writeFile(resolve('build/plugin/figma/ui.html'), [
            '<style>',
            inlinStyle,
            '</style>',
            templateHtml,
            '<script>',
            inlineScript,
            '</script>',
          ].join('\n'));

          createReadStream(
            resolve('src/server/web/index.html'),
          ).pipe(
            createWriteStream(
              resolve('build/server/web/index.html'),
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
