import { default as commonjs } from '@rollup/plugin-commonjs';
import { default as nodeResolve } from '@rollup/plugin-node-resolve';
import { default as typescript } from '@rollup/plugin-typescript';
import { SharedVscodeTaskPluginFactory } from '@sherluok/vscode-problem-matcher/rollup';
import { cp, rm, writeFile } from 'node:fs/promises';
import { basename, join, relative, resolve, sep } from 'node:path';
import { cwd } from 'node:process';
import { rollup as rollupBuild, RollupOptions, watch as rollupWatch, type OutputOptions, type Plugin, type RollupBuild } from 'rollup';
import { dts } from 'rollup-plugin-dts';
import { default as packageJSON } from '../package.json' with { type: 'json' };

const workspaceRoot = resolve('..', '..');
const packageRoot = resolve();

const srcDir = resolve('src');
const outDir = resolve('out');

// https://rollupjs.org/javascript-api/
// https://github.com/rollup/plugins/tree/master/packages/typescript

const inputEntries = [
  join(srcDir, 'process.ts'),
  join(srcDir, 'protocol.ts'),
];

const inputPlugins: Plugin[] = [
  commonjs(),
  nodeResolve(),
  typescript({
    compilerOptions: {
      target: 'es2022',
    },
  }),
];

const vscodeTask = new SharedVscodeTaskPluginFactory({
  buildStart() {
    console.log(new Date().toLocaleString());
  },
  writeBundle(bundles) {
    bundles.map((bundle) => Object.entries(bundle)).flat(1).toSorted(([a], [b]) => a < b ? -1 : +1).forEach(([filename, info]) => {
      let bytes: number;
      if (info.type === 'asset') {
        bytes = Buffer.from(info.source).byteLength;
      } else {
        bytes = Buffer.from(info.code).byteLength;
      }
      const kb = bytes / 1024;
      const color = kb > 100 ? '\x1b[31m' : '\x1b[32m';
      const baseDir = relative(cwd(), outDir);
      console.log('%s%s \x1b[0;2mkb\x1b[0;2m %s%s\x1b[0;36m%s\x1b[0m', color, kb.toFixed(1).padStart(6, ' '), baseDir, sep, filename);
    });
    console.log(new Date().toLocaleString());
  },
});

const targets: RollupOptions[] = [
  {
    external: /node_modules/,
    input: inputEntries,
    plugins: [
      ...inputPlugins,
      vscodeTask.buildPlugin(),
    ],
    output: [
      {
        dir: outDir,
        format: 'cjs',
        entryFileNames: '[name].cjs',
        sourcemap: true,
        plugins: [vscodeTask.outputPlugin()],
      },
      {
        dir: outDir,
        format: 'esm',
        entryFileNames: '[name].mjs',
        sourcemap: true,
        plugins: [vscodeTask.outputPlugin()],
      },
    ],
  },
  {
    external: /node_modules/,
    input: inputEntries,
    plugins: [
      ...inputPlugins,
      vscodeTask.buildPlugin(),
      dts(),
    ],
    output: [
      {
        dir: outDir,
        format: 'esm',
        entryFileNames: '[name].d.ts',
        sourcemap: true,
        plugins: [vscodeTask.outputPlugin()],
      },
    ],
  },
];

async function cleanOutputs() {
  await rm(outDir, {
    recursive: true,
    force: true,
  });
}

async function writeBundle(bundle: RollupBuild, outputOptionsList: undefined | OutputOptions | OutputOptions[]) {
  if (!outputOptionsList) {
    return;
  }
  for (const outputOptions of [outputOptionsList].flat(1)) {
    await bundle.write(outputOptions);
  }
}

async function copyTemplates() {
  await cp(join(workspaceRoot, 'LICENSE'), join(outDir, 'LICENSE'));
  await cp(join(packageRoot, 'README.md'), join(outDir, 'README.md'));

  const npmPackageJSON = Object.assign({}, packageJSON, {
    devDependencies: undefined,
    scripts: undefined,
    exports: Object.fromEntries(inputEntries.map((file) => {
      const name = basename(file, '.ts');
      return [name, {
        types: `./${name}.d.ts`,
        import: `./${name}.mjs`,
        require: `./${name}.cjs`,
      }];
    })),
  });

  await writeFile(join(outDir, 'package.json'), JSON.stringify(npmPackageJSON, null, 2));
}

async function watch() {
  await cleanOutputs();
  await copyTemplates();
  const watcher = await rollupWatch(targets);
  watcher.on('event', (e) => {
    if (e.code === 'BUNDLE_END') {
      e.result.close();
    } else if (e.code === 'ERROR') {
      console.error('\x1b[31m%s\x1b[0m', e.error.message);
      console.error(e.error.frame);
    }
  });
}

async function build() {
  await cleanOutputs();
  await copyTemplates();
  await Promise.all(targets.map(async (target) => {
    const bundle = await rollupBuild(target);
    await writeBundle(bundle, target.output);
    await bundle.close();
  }));
}

if (require.main === module) {
  if (process.argv.includes('--watch')) {
    watch();
  } else {
    build();
  }
}
