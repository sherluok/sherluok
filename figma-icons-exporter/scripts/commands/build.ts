import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import * as esbuild from 'esbuild';
import { resolve } from 'node:path';

esbuild.build({
  entryPoints: [
    resolve('src/server/main.ts'),
  ],
  outbase: 'src',
  outdir: 'build',
  target: 'node18',
  platform: 'node',
  sourcemap: 'linked',
  format: 'cjs',
  bundle: true,
  minify: false,
  plugins: [
    vanillaExtractPlugin({}),
  ],
}).then(() => {
  console.log('done.');
});
