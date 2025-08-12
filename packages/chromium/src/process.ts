import { type ChildProcessByStdio, spawn } from 'node:child_process';
import { accessSync, constants } from 'node:fs';
import { platform, tmpdir } from 'node:os';
import { join } from 'node:path';
import { type Readable, type Writable } from 'node:stream';
import { z } from 'zod';

export function findChromium(): string {
  switch (platform()) {
    case 'win32': {
      const paths: string[] = [];
      if (process.env['ProgramFiles']) {
        paths.push(join(process.env['ProgramFiles'], 'Google/Chrome/Application/chrome.exe'));
      }
      if (process.env['ProgramFiles(x86)']) {
        paths.push(join(process.env['ProgramFiles(x86)'], 'Google/Chrome/Application/chrome.exe'));
        paths.push(join(process.env['ProgramFiles(x86)'], 'Microsoft/Edge/Application/msedge.exe'));
      }
      if (process.env['LOCALAPPDATA']) {
        paths.push(join(process.env['LOCALAPPDATA'], 'Google/Chrome/Application/chrome.exe'));
      }
      for (const path of paths) {
        try {
          accessSync(path, constants.X_OK);
          return path;
        } catch { }
      }
      throw new Error(`Cannot find chromium!`);
    }
    default: {
      throw new Error(`Unsupported platform "${platform()}"!`);
    }
  }
}

export type ChromiumLaunchFlags = {
  [key: `--${string}`]: string | number | boolean | string[] | undefined;
  '--auto-open-devtools-for-tabs'?: boolean;
};

export function formatChromiumFlags(flags: ChromiumLaunchFlags): string[] {
  const args: string[] = [];

  for (const [key, value] of Object.entries(flags)) {
    if (typeof value === 'boolean' && value) {
      args.push(`${key}`);
    }
    if (typeof value === 'number') {
      args.push(`${key}=${value}`);
    }
    if (typeof value === 'string' && value) {
      args.push(`${key}=${value}`);
    }
    if (Array.isArray(value)) {
      const v = value.join(',');
      if (v) {
        args.push(`${key}=${v}`);
      }
    }
  }

  return args;
}

export type ChromiumLaunchOptions = {
  remoteDebuggingPort: number;
  /** File path to chromium executable, defaults to return value of {@link findChromium}. */
  executable?: string;
  userDataDir?: string;
  startingPage?: string | URL;
  additionalFlags?: ChromiumLaunchFlags;
};

export function launchChromium(options: ChromiumLaunchOptions) {
  const executable = options.executable ?? findChromium();
  const remoteDebuggingPort = options.remoteDebuggingPort;
  const userDataDir = options.userDataDir ?? join(tmpdir(), `chrome-user-data-dir-${remoteDebuggingPort}`);

  const args = formatChromiumFlags({
    ...options.additionalFlags,
    '--user-data-dir': userDataDir,
    '--remote-debugging-port': remoteDebuggingPort,
  });

  if (options.startingPage) {
    args.push(options.startingPage.toString());
  }

  return spawn(executable, args, {
    detached: true,
    stdio: ['ignore', 'ignore', 'pipe'],
  });
}

const JsonVersionApiResponse = z.object({
  webSocketDebuggerUrl: z.string(),
});

export function getChromeDevtoolsProtocolEndpointFromApi(remoteDebuggingPort: number): Promise<URL> {
  return fetch(`http://localhost:${remoteDebuggingPort}/json/version`).then(async (res) => {
    const json = await res.json();
    const data = JsonVersionApiResponse.parse(json);
    return new URL(data.webSocketDebuggerUrl);
  });
}

export function getChromeDevtoolsProtocolEndpointFromProcess(chromeProcess: ChildProcessByStdio<null | Writable, null | Readable, Readable>): Promise<URL> {
  return new Promise<URL>((fulfill, reject) => {
    const onStderr = (data: Buffer) => {
      const matchResult = data.toString().match(/DevTools listening on (ws:\/\/\S+)/);
      if (matchResult) {
        globalThis.clearTimeout(stderrTimeout);
        chromeProcess.stderr.off('data', onStderr);
        fulfill(new URL(matchResult[1]));
      }
    };

    const stderrTimeout = globalThis.setTimeout(() => {
      chromeProcess.stderr.off('data', onStderr);
      reject(new Error('Timeout waiting for stderr webSocket URL!'));
    }, 3000);

    chromeProcess.stderr.on('data', onStderr);
  }).finally(() => {
    // 关闭连接到子进程的 Stream，并取消对子进程的引用计数，否则 Node 程序将一直悬挂着不退出。
    chromeProcess.stderr.destroy();
    chromeProcess.unref();
  });
}

export function getChromeDevtoolsProtocolEndpoint(options: ChromiumLaunchOptions): Promise<URL> {
  return getChromeDevtoolsProtocolEndpointFromApi(options.remoteDebuggingPort).catch(() => {
    return getChromeDevtoolsProtocolEndpointFromProcess(launchChromium(options));
  });
}
