import { Compiler, WebpackPluginInstance } from 'webpack';

const BEGINS_PATTERN = 'vscode background task begins pattern';
const ENDS_PATTERN = 'vscode background task ends pattern';

export class VscodeTaskPlugin implements WebpackPluginInstance {
  static NAME = 'vscode-task-plugin';

  #log(message: string, ...args: unknown[]): void {
    console.log(`📦 [🧩 \x1b[32;1m${VscodeTaskPlugin.NAME}\x1b[0m] ` + message, ...args);
  }

  apply(compiler: Compiler): void {
    if (compiler.isChild()) return;

    compiler.hooks.environment.tap(VscodeTaskPlugin.NAME, () => {
      // TERM_PROGRAM: 'vscode',
      // TERM_PROGRAM_VERSION: '1.91.1',
      if (process.env.TERM_PROGRAM === 'vscode') {
        this.#log('\x1b[33mwebpack running in vs code terminal\x1b[0m');
        compiler.hooks.run.tap(VscodeTaskPlugin.NAME, () => {
          console.log(BEGINS_PATTERN);
        });
        compiler.hooks.watchRun.tap(VscodeTaskPlugin.NAME, () => {
          console.log(BEGINS_PATTERN);
        });
        compiler.hooks.done.tap(VscodeTaskPlugin.NAME, () => {
          console.log(ENDS_PATTERN);
        });
      }
    });
  }
}
