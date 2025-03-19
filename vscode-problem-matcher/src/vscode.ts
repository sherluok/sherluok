import { join } from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext): void {
  console.log('activate()', context);
  vscode.window.showInformationMessage('active!');
  context.subscriptions.push(vscode.tasks.registerTaskProvider('open-browser-page', new OpenBrowserPageTaskProvider()));
}

interface OpenBrowserPageTaskDefinition extends vscode.TaskDefinition {
  remoteDebuggingPort: number;
  makesureOpenPageUrl: string;
}

function isOpenBrowserPageTaskDefinition(value: vscode.TaskDefinition): value is OpenBrowserPageTaskDefinition {
  if (!(value.type === 'open-browser-page')) return false;
  if (!('remoteDebuggingPort' in value && typeof value.remoteDebuggingPort === 'number')) return false;
  if ('makesureOpenPageUrl' in value && typeof value.makesureOpenPageUrl !== 'string') return false;
  return true;
}

class OpenBrowserPageTaskProvider implements vscode.TaskProvider {
  resolveTask(task: vscode.Task, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Task> {
    console.log('resolveTask()', task, token);
    if (!isOpenBrowserPageTaskDefinition(task.definition)) {
      vscode.window.showErrorMessage('配置不规范！');
      return null;
    }
    return this.createTask(task.definition);
  }

  provideTasks(token: vscode.CancellationToken): vscode.ProviderResult<vscode.Task[]> {
    console.log('provideTasks()', token);
    return [
      this.createTask({
        type: 'open-browser-page',
        remoteDebuggingPort: 9230,
        makesureOpenPageUrl: 'http://localhost:8080',
      }),
    ];
  }

  createTask(definition: OpenBrowserPageTaskDefinition): vscode.Task {
    // 1. 测试远程调试端口是否已经启动，如果尚未启动，则跳转至第2步；如果已经启动，则跳转至第4步。
    // 2. 找到电脑上的 Chrome.exe 或 Edge.exe，如果没有找到，则报错并退出。
    // 3. 启动指定的远程调试端口，如果没有启动成功，则报错并退出。
    // 4. 测试指定的网页地址是否已经打开，如果尚未打开，跳转至第5步；否则跳转至第6步。
    // 5. 在新的 Tab 打开指定的网页地址。
    // 6. 将浏览器置前。
    // 7. 退出。
    const task = new vscode.Task(
      definition,
      vscode.TaskScope.Workspace,
      'debug-9230-open-3000',
      'vscode-problem-matcher',
      new vscode.ShellExecution(`node ${join(__dirname, 'execution.js')} ${definition.remoteDebuggingPort} ${definition.makesureOpenPageUrl}`),
      '$common',
    );
    task.isBackground = true;
    return task;
  }
}
