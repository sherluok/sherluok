// import { ok } from 'node:assert';
// import { mkdirSync, statSync } from 'node:fs';
// import { symlink } from 'node:fs/promises';
// import { basename, join, resolve } from 'node:path';

// console.log('????')
// const from = process.cwd();
// console.log(from);

// const [workspace] = process.argv.slice(2);
// ok(workspace, '请指定软链接目标!');
// const workspaceAbs = resolve(workspace);
// const stats = statSync(workspaceAbs);
// ok(stats.isDirectory());
// const workspaceExtensionsDir = join(workspaceAbs, '.vscode', 'extensions');
// mkdirSync(workspaceExtensionsDir, { recursive: true });
// const extensionDirName = basename(from);
// const to = join(workspaceExtensionsDir, extensionDirName);
// console.log('即将软链接到 "%s"', to);

// // const path = "C:/Users/sherluok/github.com/sherluok/peatip/.vscode/extensions/vscode-problem-matcher-extension";
// // https://nodejs.org/api/fs.html#fspromisessymlinktarget-path-type
// // https://github.com/npm/npm/issues/10926
// symlink(from, to, 'junction').catch((error) => {
//   console.error('创建软链失败，请尝试使用管理员身份重新执行本命令!');
//   console.error(error);
// });

import { mkdirSync } from 'node:fs';
import { symlink } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';

const fromDir = resolve(__dirname, '..');
const workspaceExtensionsDir = join(process.cwd(), '.vscode/extensions');

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(`将创建文件夹 ${workspaceExtensionsDir}，确定吗（Y/N）？`).then((answer) => {
  if (answer !== 'Y') {
    console.log('已取消');
    process.exit(0);
  }

  mkdirSync(workspaceExtensionsDir, { recursive: true });
  const extensionDirName = basename(fromDir);
  const toDir = join(workspaceExtensionsDir, extensionDirName);
  console.log('即将软链接到 "%s"', toDir);
  symlink(fromDir, toDir, 'junction').then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('创建软链失败，请尝试使用管理员身份重新执行本命令!');
    console.error(error);
    process.exit(1);
  });
});
