import { ChromiumLaunchOptions, getChromeDevtoolsProtocolEndpoint } from './process';

export async function preChromeLaunchTask(options: ChromiumLaunchOptions) {
  const wsURL = await getChromeDevtoolsProtocolEndpoint(options);
  const wsClient = new WebSocket(wsURL);
  wsClient.addEventListener('open', () => {
    console.log('vscode background task begins pattern');
  });
  wsClient.addEventListener('close', () => {
    console.log('vscode background task ends pattern');
  });
}

if (require.main === module) {
  preChromeLaunchTask({
    remoteDebuggingPort: 9230,
  });
}
