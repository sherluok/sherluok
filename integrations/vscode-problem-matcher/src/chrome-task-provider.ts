// https://code.visualstudio.com/api/references/contribution-points#contributes.taskDefinitions
// https://code.visualstudio.com/api/extension-guides/task-provider
// https://github.com/microsoft/vscode-extension-samples/tree/main/task-provider-sample

import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as vscode from 'vscode';
import { z } from 'zod';
import { findChromium, getChromeDevtoolsProtocolEndpointFromApi, getChromeDevtoolsProtocolEndpointFromProcess, launchChromium } from './chrome-process';

const ChromeTaskDefination = z.object({
  executable: z.string().optional(),
  userDataDir: z.string().optional(),
  remoteDebuggingPort: z.number(),
  startingPage: z.string().optional(),
});

type ChromeTaskDefination = z.infer<typeof ChromeTaskDefination>;

export class ChromeTaskProvider implements vscode.TaskProvider {
  async provideTasks(token: vscode.CancellationToken): Promise<vscode.Task[]> {
    console.log('provideTasks()');
    return [];
  }

  async resolveTask(task: vscode.Task, token: vscode.CancellationToken): Promise<vscode.Task> {
    console.log('resolveTask()', task);
    const definition = ChromeTaskDefination.parse(task.definition);
    return new vscode.Task(
      task.definition,
      task.scope ?? vscode.TaskScope.Global,
      task.name,
      task.definition.type,
      new vscode.CustomExecution(async () => {
        return new ChromeTaskTerminal(definition);
      }),
      '$common',
    );
  }
}

class ChromeTaskTerminal implements vscode.Pseudoterminal {
  #didWrite = new vscode.EventEmitter<string>();
  #didClose = new vscode.EventEmitter<number | void>();
  #didUserClose = new vscode.EventEmitter<void>();
  #defination: ChromeTaskDefination;

  onDidWrite = this.#didWrite.event;
  onDidClose = this.#didClose.event;

  constructor(defination: ChromeTaskDefination) {
    this.#defination = defination;
  }

  async open(initialDimensions: vscode.TerminalDimensions | undefined): Promise<void> {
    this.#didWrite.fire('vscode background task begin\n\r');

    const remoteDebuggingPort = this.#defination.remoteDebuggingPort;

    const wsURL = await getChromeDevtoolsProtocolEndpointFromApi(remoteDebuggingPort).then((wsURL) => {
      this.#didWrite.fire(`\n\r`);
      this.#didWrite.fire(`Chrome process already exists.\n\r`);
      this.#didWrite.fire(`\n\r`);
      this.#didWrite.fire(`remoteDebuggingPort: ${JSON.stringify(remoteDebuggingPort)}\n\r`);
      return wsURL;
    }).catch(async () => {
      const executable = this.#defination.executable || await findChromium();
      const userDataDir = this.#defination.userDataDir || join(tmpdir(), `chrome-user-data-dir-${remoteDebuggingPort}`);
      const startingPage = this.#defination.startingPage;
      this.#didWrite.fire(`\n\r`);
      this.#didWrite.fire(`Chrome process not exists, launching...\n\r`);
      this.#didWrite.fire(`\n\r`);
      this.#didWrite.fire(`executable: ${JSON.stringify(executable)}\n\r`);
      this.#didWrite.fire(`userDataDir: ${JSON.stringify(userDataDir)}\n\r`);
      this.#didWrite.fire(`remoteDebuggingPort: ${JSON.stringify(remoteDebuggingPort)}\n\r`);
      this.#didWrite.fire(`startingPage: ${JSON.stringify(startingPage)}\n\r`);
      const chromeProcess = launchChromium({
        executable: executable,
        userDataDir,
        remoteDebuggingPort,
        startingPage,
      });
      this.#didUserClose.event(() => {
        console.log(`Closed by an act of the user...`);
        chromeProcess.kill();
      });
      const wsURL = await getChromeDevtoolsProtocolEndpointFromProcess(chromeProcess);
      return wsURL;
    });

    this.#didWrite.fire(`\n\r`);
    this.#didWrite.fire(`ws endpoint: ${JSON.stringify(wsURL.toString())}\n\r`);

    const wsClient = new WebSocket(wsURL);

    wsClient.addEventListener('open', () => {
      this.#didWrite.fire(`ws open.\n\r`);
      this.#didWrite.fire(`\n\r`);
      this.#didWrite.fire('vscode background task end\n\r');
    });
    wsClient.addEventListener('close', () => {
      this.#didWrite.fire(`ws close.\n\r`);
      this.#didClose.fire(0);
    });
    wsClient.addEventListener('error', () => {
      this.#didWrite.fire(`ws error!\n\r`);
      this.#didClose.fire(1);
    });
  }

  close(): void {
    this.#didUserClose.fire();
  }
}
