import { BuildResult, Plugin } from 'esbuild';
import { ok } from 'node:assert/strict';
import { resolve } from 'node:path';
import { Observable, Subject, switchMap, zip } from 'rxjs';

export function resultLoggerPlugin(): Plugin {
  const builds = new Set<{
    onStart: Observable<void>;
    onEnd: Observable<BuildResult>;
  }>();

  const onSetupChange = new Subject<void>();

  let startAt = 0;
  onSetupChange.pipe(switchMap(() => zip(...[...builds].map((it) => it.onStart)))).subscribe(() => {
    startAt = performance.now();
  });
  onSetupChange.pipe(switchMap(() => zip(...[...builds].map((it) => it.onEnd)))).subscribe((results) => {
    const endAt = performance.now();
    console.log('[build end] %s %sms', new Date().toLocaleString(), (endAt - startAt).toFixed(0));
    results.forEach((result) => {
      result.warnings.forEach((message) => console.warn(message.text));
    });
    results.forEach((result) => {
      result.errors.forEach((message) => console.error(message.text));
    });
  });

  return {
    name: 'result-logger-plugin',
    setup(build) {
      const thisBuild = {
        onStart: new Subject<void>(),
        onEnd: new Subject<BuildResult>(),
      };
      builds.add(thisBuild);
      onSetupChange.next();
      build.onStart(() => {
        thisBuild.onStart.next();
      });
      build.onEnd((e) => {
        thisBuild.onEnd.next(e);
      });
      build.onDispose(() => {
        thisBuild.onStart.complete();
        thisBuild.onEnd.complete();
        builds.delete(thisBuild);
        onSetupChange.next();
      });
    },
  };
}

export function getOutputFile(result: BuildResult, outputFilePath: string) {
  ok(result.outputFiles, 'No outputFiles in result, you have to set esbuild options "write" to false!');
  const outputFile = result.outputFiles.find((file) => file.path === resolve(outputFilePath));
  ok(outputFile, `Cannot find output file "${outputFilePath}" in result.`);
  return outputFile;
}

export function collectEntryPointOutput(result: BuildResult, entryFileFile: string) {
  ok(result.metafile, 'No metafiles in result, you have to set esbuild options "metafile" to true!');

  const js: string[] = [];
  const css: string[] = [];
  const raw: string[] = [];

  for (const [outFile, { entryPoint, cssBundle }] of Object.entries(result.metafile.outputs)) {
    if (entryPoint) {
      if (resolve(entryPoint) === resolve(entryFileFile)) {
        js.push(resolve(outFile));
        if (cssBundle) {
          css.push(resolve(cssBundle));
        }
      }
    }
  }

  return {
    js,
    css,
    raw,
  };
}
