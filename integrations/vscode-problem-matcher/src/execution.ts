import { ok } from 'node:assert/strict';
import { findExecutablePath, getWebSocketDebuggerUrl, launch } from './chrome';
import type { ProtocolProxyApi } from 'devtools-protocol/types/protocol-proxy-api.d.ts';

// 1. 测试远程调试端口是否已经启动，如果尚未启动，则跳转至第2步；如果已经启动，则跳转至第4步。
// 2. 找到电脑上的 Chrome.exe 或 Edge.exe，如果没有找到，则报错并退出。
// 3. 启动指定的远程调试端口，如果没有启动成功，则报错并退出。
// 4. 测试指定的网页地址是否已经打开，如果尚未打开，跳转至第5步；否则跳转至第6步。
// 5. 在新的 Tab 打开指定的网页地址。
// 6. 将浏览器置前。
// 7. 退出。

const remoteDebuggingPort = (() => {
  const argv = process.argv[2];
  ok(/^\d+$/.test(argv));
  return parseInt(argv);
})();

const makesureOpenPageUrl = (() => {
  const argv = process.argv[3];
  ok(typeof argv === 'string');
  return argv;
})();

async function main() {
  let webSocketDebuggerUrl = await getWebSocketDebuggerUrl(9230);
  if (!webSocketDebuggerUrl) {
    const executablePath = await findExecutablePath();
    if (!executablePath) {
      throw new Error('Cannot find chrome.exe on your computer!');
    }
    webSocketDebuggerUrl = await launch(executablePath, remoteDebuggingPort);
  }
  console.log('Chrome 已经成功打开，远程调试地址：', webSocketDebuggerUrl);

  const ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
  console.log('已连接到远程调试地址.');

  const [cdp, createSession] = createProtocolProxyApi(ws);
  await cdp.Target.getTargets({ filter: [{ type: 'page' }] }).then(async ({ targetInfos }) => {
    let targetId: string;
    const targetInfo = targetInfos.find((it) => it.url.startsWith(makesureOpenPageUrl));
    if (!targetInfo) {
      console.log('页面尚未打开，正在打开...');
      const res = await cdp.Target.createTarget({ url: makesureOpenPageUrl });
      targetId = res.targetId;
    } else {
      console.log('页面已经打开了。');
      targetId = targetInfo.targetId;
    }
    console.log('正在将网页置前...');
    await cdp.Target.activateTarget({ targetId });
    console.log('已完成.');
  });
}

main().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

export function createProtocolProxyApi(ws: WebSocket): [
  root: ProtocolProxyApi.ProtocolApi,
  createSession: (sessionId: string) => ProtocolProxyApi.ProtocolApi,
] {
  let idGenerator = 0;
  type Listener = (params: unknown) => void;
  const sessionMethodListeners = new Map<string | undefined, Map<string, Listener[]>>();
  const getListenerList = (sessionId: string | undefined, method: string): Listener[] => {
    let methodListeners = sessionMethodListeners.get(sessionId);
    if (!methodListeners) {
      methodListeners = new Map();
      sessionMethodListeners.set(sessionId, methodListeners);
    }
    let listeners = methodListeners.get(method);
    if (!listeners) {
      listeners = [];
      methodListeners.set(method, listeners);
    }
    return listeners;
  };

  ws.addEventListener('message', (e) => {
    const res = JSON.parse(e.data);
    if (res.id) {
      return;
    }
    const listeners = getListenerList(res.sessionId, res.method);
    if (listeners.length === 0) {
      console.warn('\x1b[31mUnhandled event message: \x1b[32m=>\x1b[0m', res);
      return;
    }
    listeners.forEach((listener) => {
      listener(res.params);
    });
  });

  const root = new Proxy({} as any, {
    get(target, domainName, receiver) {
      ok(typeof domainName === 'string');
      return new Proxy({} as any, {
        get(target, methodName, receiver) {
          ok(typeof methodName === 'string');
          if (methodName === 'on') {
            return (eventType: string, listener: (params: unknown) => void) => {
              const method = `${domainName}.${eventType}`;
              console.log('正在监听事件"%s"...', method);
              const list = getListenerList(undefined, method);
              list.push(listener);
            };
          }
          return (params: unknown) => {
            const id = ++idGenerator;
            const method = `${domainName}.${methodName}`;
            return new Promise((resolve) => {
              ws.send(JSON.stringify({ id, method, params }));
              ws.addEventListener('message', (e) => {
                const res = JSON.parse(e.data);
                if (res.id === id) {
                  resolve(res.result);
                }
              });
            });
          };
        },
      });
    },
  });

  function createSession(sessionId: string): ProtocolProxyApi.ProtocolApi {
    return new Proxy({} as any, {
      get(target, domainName, receiver) {
        ok(typeof domainName === 'string');
        return new Proxy({} as any, {
          get(target, methodName, receiver) {
            ok(typeof methodName === 'string');
            if (methodName === 'on') {
              return (eventType: string, listener: (params: unknown) => void) => {
                const method = `${domainName}.${eventType}`;
                sessionId
                console.log('正在监听事件"%s"...', method);
                const list = getListenerList(sessionId, method);
                list.push(listener);
              };
            }
            return (params: unknown) => {
              const id = ++idGenerator;
              const method = `${domainName}.${methodName}`;
              return new Promise((resolve) => {
                ws.send(JSON.stringify({ sessionId, id, method, params }));
                ws.addEventListener('message', (e) => {
                  const res = JSON.parse(e.data);
                  if (res.id === id) {
                    resolve(res.result);
                  }
                });
              });
            };
          },
        });
      },
    });
  }

  return [
    root,
    createSession,
  ];
}