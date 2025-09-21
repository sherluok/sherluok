import * as vscode from 'vscode';
import { ChromeTaskProvider } from './chrome-task-provider';

export function activate(ctx: vscode.ExtensionContext) {
  console.log('activate');
  vscode.window.showInformationMessage('activate');

  ctx.subscriptions.push(
    vscode.tasks.registerTaskProvider('chrome', new ChromeTaskProvider()),
  );
}
