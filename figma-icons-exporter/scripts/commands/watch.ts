import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import { context } from 'esbuild';
import { resolve } from 'node:path';
import { resultLoggerPlugin } from '../esbuild/common';
import { contextsFromManifest } from '../esbuild/figma';
import { contextFromHtml } from '../esbuild/html';

const resultLogger = resultLoggerPlugin();
const outbase = resolve('src');
const outdir = resolve('build');

const serverMainContext = context({
  outbase,
  outdir,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  sourcemap: 'linked',
  bundle: true,
  minify: true,
  plugins: [
    resultLogger,
  ],
  entryPoints: [
    resolve('src/server/main.ts'),
  ],
});

const serverUiContext = contextFromHtml([resolve('src/server/ui.html')], {
  outbase,
  outdir,
  sourcemap: 'inline',
  minify: true,
  plugins: [
    vanillaExtractPlugin({}),
    resultLogger,
  ],
});

contextsFromManifest(resolve('src/plugin/manifest.json'), {
  outbase,
  outdir,
  sourcemap: 'inline',
  minify: true,
  plugins: [
    vanillaExtractPlugin({}),
    resultLogger,
  ],
}).then(async (contexts) => {
  return ([
    ...contexts,
    await serverMainContext,
    await serverUiContext,
  ].map((context) => {
    return context.watch();
  }));
}).then(() => {
  console.log('watching');
});
