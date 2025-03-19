/******************************************************************************
 * - Chrome Devtools Protocol:
 *   - https://github.com/ChromeDevTools/devtools-protocol
 *   - https://github.com/aslushnikov/getting-started-with-cdp/blob/master/README.md
 */

import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { platform } from "node:os";
import { join } from "node:path";

const DEFAULT_EXECUTABLE_LOOKUP_PATHS_WIN32 = [
  join(process.env['ProgramFiles']!, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  join(process.env['ProgramFiles(x86)']!, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  join(process.env['LocalAppData']!, 'Google', 'Chrome', 'Application', 'chrome.exe'),
];

export async function findExecutablePath(lookupPaths?: string[]): Promise<string | undefined> {
  if (platform() !== 'win32') {
    throw new Error(`Unsupported platform ${platform()}! only supportw win32 for now.`);
  }
  
  for (const path of lookupPaths ?? DEFAULT_EXECUTABLE_LOOKUP_PATHS_WIN32) {
    if (await access(path).then(() => true).catch(() => false)) {
      return path;
    }
  }

  return undefined;
}

export function getWebSocketDebuggerUrl(remoteDebuggingPort: number): Promise<string | null> {
  const uri = `http://localhost:${remoteDebuggingPort}/json/version`;

  return fetch(uri, { method: 'GET' }).then(async (res) => {
    const json = await res.json();
    if (typeof json === 'object' && json !== null && 'webSocketDebuggerUrl' in json && typeof json.webSocketDebuggerUrl === 'string') {
      return json.webSocketDebuggerUrl;
    }
    return null;
  }).catch(() => {
    return null;
  });
}

export function launch(executablePath: string, remoteDebuggingPort: number): Promise<string> {
  const DEAULT_USER_DATA_DIR = join(process.env['LocalAppData']!, 'Google', 'Chrome', 'User Data');
  
  const userDataDir = DEAULT_USER_DATA_DIR;

  // https://chromedevtools.github.io/devtools-protocol/
  // https://github.com/aslushnikov/getting-started-with-cdp/blob/master/README.md
  // https://github.com/puppeteer/puppeteer/blob/0880d03cc15fb4c2dfc98159d60ecae85d5e2156/packages/browsers/src/launch.ts
  // chrome://about/
  // chrome://version/
  const chromeProcess = spawn(executablePath, [
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${remoteDebuggingPort}`, // https://peter.sh/experiments/chromium-command-line-switches/#remote-debugging-port
  ], {
    detached: true,
    stdio: [
      'ignore',
      'inherit',
      'pipe',
    ],
  });

  return new Promise<string>((resolve, reject) => {
    const onceClose = () => {
      reject(`启动指定 remoteDebuggingPort=${remoteDebuggingPort} 的 Chrome 进程失败，可能是因为你当前已经打开了 Chrome。`);
    };

    chromeProcess.once('close', onceClose);

    chromeProcess.stderr.once('data', (data: Buffer) => {
      const text = data.toString('utf-8');
      chromeProcess.off('close', onceClose);
      const match = text.match(/^\s*DevTools listening on (ws:\/\/.+)\s*$/);
      if (match) {
        resolve(match[1]);
      } else {
        reject(text);
      }
    });
  });
}