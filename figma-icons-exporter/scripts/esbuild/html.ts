import { BuildOptions, context } from 'esbuild';
import { Element, Parent, Root } from 'hast';
import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import { ok } from 'node:assert';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { visit } from 'unist-util-visit';
import { collectEntryPointOutput, getOutputFile } from './common';

export async function contextFromHtml(htmlSrcFilePaths: string[], preferredOptions: BuildOptions) {
  const htmlEntries = new Map<string, { root: Root }>();
  const scriptEntries = new Map<string, { element: Element, parent: Parent, root: Root }>();

  await Promise.all(htmlSrcFilePaths.map(async (it) => {
    const htmlSrcFilePath = resolve(it);
    const root = await readFile(htmlSrcFilePath).then(fromHtml);
    htmlEntries.set(htmlSrcFilePath, { root });
  }));

  htmlEntries.forEach(({ root }, htmlSrcFilePath) => {
    visit(root, { type: 'element', tagName: 'script' }, (element, index, parent) => {
      if (!parent) {
        throw { htmlSrcFilePath, element, index, parent };
      }
      const srcAttribute = element.properties.src;
      if (typeof srcAttribute === 'string' && srcAttribute.startsWith('.')) {
        const scriptSrcFilePath = resolve(dirname(htmlSrcFilePath), srcAttribute);
        scriptEntries.set(scriptSrcFilePath, { element, parent, root });
      }
    });
  });

  ok(preferredOptions.outbase, 'esbuild option "outbase" is required!');
  const srcDir = resolve(preferredOptions.outbase);

  ok(preferredOptions.outdir, 'esbuild option "outdir" is required!');
  const outDir = resolve(preferredOptions.outdir);

  const defaultOptions: BuildOptions = {
    target: 'es6',
    format: 'iife',
    platform: 'browser',
    sourcemap: 'inline',
    bundle: true,
    minify: true,
  };

  const overrideOptions: BuildOptions = {
    write: false, // Dont write .css and .js files to file system, instead inline them into a single .html file.
    metafile: true, // Figure out what files each entryPoint generates.
  };

  return context({
    ...defaultOptions,
    ...preferredOptions,
    ...overrideOptions,
    entryPoints: [
      ...scriptEntries.keys(),
    ],
    plugins: [
      ...preferredOptions.plugins ?? [],
      {
        name: 'html-entry-plugin',
        setup(build) {
          build.onEnd(async (result) => {
            for (const [entryFile, { element, parent, root }] of scriptEntries) {
              const output = collectEntryPointOutput(result, entryFile);

              output.css.map((path) => getOutputFile(result, path)).forEach((file) => {
                visit(root, { type: 'element', tagName: 'head' }, (element) => {
                  element.children.push({
                    type: 'element',
                    tagName: 'style',
                    properties: {},
                    children: [{
                      type: 'text',
                      value: new TextDecoder().decode(file.contents),
                    }],
                  });
                });
              });

              const index = parent.children.findIndex((child) => child === element);
              ok(index !== -1, new Error('Cannot find this script element!'));
              const replaceWithElements = output.js.map((path) => getOutputFile(result, path)).map((file): Element => ({
                type: 'element',
                tagName: 'script',
                properties: {},
                children: [{
                  type: 'text',
                  value: new TextDecoder().decode(file.contents),
                }],
              }));
              parent.children.splice(index, 1, ...replaceWithElements);
            }

            for (const [htmlSrcFilePath, { root }] of htmlEntries) {
              const htmlOutFilePath = resolve(outDir, relative(srcDir, htmlSrcFilePath));
              await mkdir(dirname(htmlOutFilePath), { recursive: true });
              await writeFile(htmlOutFilePath, toHtml(root));
            }
          });
        },
      },
    ],
  });
}
