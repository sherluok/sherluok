import { BuildOptions, context } from 'esbuild';
import { equal, ok } from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, posix, relative, resolve, win32 } from 'node:path';
import { z } from 'zod';
import { collectEntryPointOutput } from './common';
import { contextFromHtml } from './html';

const FigmaPluginManifestSchema = z.object({
  main: z.string(),
  ui: z.string(),
}).passthrough();

export async function contextsFromManifest(manifestSrcFilePath: string, preferredOptions: BuildOptions) {
  const manifest = await readFile(manifestSrcFilePath).then((buffer) => FigmaPluginManifestSchema.parse(JSON.parse(buffer.toString('utf-8'))));

  const mainSrcFilePath = resolve(dirname(manifestSrcFilePath), manifest.main);
  const uiSrcFilePath = resolve(dirname(manifestSrcFilePath), manifest.ui);

  ok(preferredOptions.outbase, 'esbuild option "outbase" is required!');
  const srcDir = resolve(preferredOptions.outbase);

  ok(preferredOptions.outdir, 'esbuild option "outdir" is required!');
  const outDir = resolve(preferredOptions.outdir);

  const manifestOutFilePath = resolve(outDir, relative(srcDir, manifestSrcFilePath));
  const uiOutFilePath = resolve(outDir, relative(srcDir, uiSrcFilePath));

  const mainContext = context({
    target: 'es6',
    format: 'iife',
    platform: 'neutral',
    sourcemap: 'inline',
    bundle: true,
    minify: true,
    ...preferredOptions,
    write: true,
    metafile: true,
    entryPoints: [
      mainSrcFilePath,
    ],
    plugins: [
      ...preferredOptions.plugins ?? [],
      {
        name: 'figma-manifest-plugin',
        setup(build) {
          build.onEnd(async (result) => {
            const output = collectEntryPointOutput(result, mainSrcFilePath);
            equal(output.js.length, 1, 'Figma main script should generate exactly 1 js file.');
            equal(output.css.length, 0, 'Figma main script should not generate css files.');
            equal(output.raw.length, 0, 'Figma main script should not generate static resource files.');
            const mainOutFilePath = resolve(output.js[0]);
            manifest.main = relative(dirname(manifestOutFilePath), mainOutFilePath).replaceAll(win32.sep, posix.sep);
            manifest.ui = relative(dirname(manifestOutFilePath), uiOutFilePath).replaceAll(win32.sep, posix.sep);
            await mkdir(dirname(manifestOutFilePath), { recursive: true });
            await writeFile(manifestOutFilePath, JSON.stringify(manifest, null, 2));
          });
        },
      },
    ],
  });

  const uiContext = contextFromHtml([uiSrcFilePath], {
    target: 'es6',
    format: 'iife',
    platform: 'browser',
    sourcemap: 'inline',
    bundle: true,
    minify: true,
    ...preferredOptions,
  });

  return Promise.all([
    mainContext,
    uiContext,
  ]);
}
