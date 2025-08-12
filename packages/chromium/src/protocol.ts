export type { Protocol } from './types/protocol';
export type { ProtocolSession } from './types/protocol-session.d.ts';

import { Subject } from 'rxjs';
import type { ProtocolSession } from './types/protocol-session.d.ts';

export const TargetType = Object.freeze({
  Tab: 'tab',
  Page: 'page',
  Frame: 'iframe',
  DedicatedWorker: 'worker',
  SharedWorker: 'shared_worker',
  ServiceWorker: 'service_worker',
  Worklet: 'worklet',
  SharedStorageWorklet: 'shared_storage_worklet',
  Browser: 'browser',
  Guest: 'webview',
  Other: 'other',
  AuctionWorklet: 'auction_worklet',
  AssistiveTechnology: 'assistive_technology',
});

export type TargetType = (typeof TargetType)[keyof (typeof TargetType)];

const TARGET_TYPES = Object.values(TargetType);

export function validateTargetType(value: string): value is TargetType {
  for (const it of TARGET_TYPES) {
    if (it === value) {
      return true;
    }
  }
  return false;
}

interface Event { }

/** https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent */
interface CloseEvent extends Event {
  code: number;
  reason: string;
  wasClean: boolean;
}

/** https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent */
interface MessageEvent extends Event {
  data: unknown;
}

/** https://developer.mozilla.org/en-US/docs/Web/API/WebSocket */
type WebSocketClientLike = {
  readyState: number;
  send(data: string): void;
  close(): void;
  addEventListener(event: 'open', listener: (event: Event) => any): void;
  addEventListener(event: 'close', listener: (event: CloseEvent) => any): void;
  addEventListener(event: 'error', listener: (event: Event) => any): void;
  addEventListener(event: 'message', listener: (event: MessageEvent) => any): void;
  removeEventListener(event: string, listener: (...args: any[]) => any): void;
};

export class ProtocolSessionManager {
  public readonly didWebSocketOpen = new Subject<unknown>();
  public readonly didWebSocketClose = new Subject<unknown>();
  public readonly didWebSocketError = new Subject<unknown>();

  readonly #webSocketClient: WebSocketClientLike;
  readonly #noProtocolEventHandlerWarning: boolean;
  readonly #sessions = new Map<string | undefined, ProtocolSession>();
  readonly #promiseResolvers = new Map<number, PromiseWithResolvers<unknown>>();
  readonly #sessionsListeners = new Map<string | undefined, Record<string, Subject<unknown>>>();
  readonly #openPromise = Promise.withResolvers<void>();

  #idPool = 0;

  constructor(
    webSocketClient: WebSocketClientLike,
    noProtocolEventHandlerWarning = false,
  ) {
    this.#webSocketClient = webSocketClient;
    this.#noProtocolEventHandlerWarning = noProtocolEventHandlerWarning;

    if (this.#webSocketClient.readyState === 1) {
      this.#openPromise.resolve();
    }

    this.onWebSocketOpen = this.onWebSocketOpen.bind(this);
    this.onWebSocketClose = this.onWebSocketClose.bind(this);
    this.onWebSocketError = this.onWebSocketError.bind(this);
    this.onWebSocketMessage = this.onWebSocketMessage.bind(this);

    this.#webSocketClient.addEventListener('open', this.onWebSocketOpen);
    this.#webSocketClient.addEventListener('close', this.onWebSocketClose);
    this.#webSocketClient.addEventListener('error', this.onWebSocketError);
    this.#webSocketClient.addEventListener('message', this.onWebSocketMessage);
  }

  public dispose() {
    this.#webSocketClient.removeEventListener('open', this.onWebSocketOpen);
    this.#webSocketClient.removeEventListener('close', this.onWebSocketClose);
    this.#webSocketClient.removeEventListener('error', this.onWebSocketError);
    this.#webSocketClient.removeEventListener('message', this.onWebSocketMessage);
  }

  public untilOpen(): Promise<void> {
    return this.#openPromise.promise;
  }

  private onWebSocketOpen(openEvent: Event) {
    // console.log('\x1b[32m[websocket open]\x1b[0m');
    this.didWebSocketOpen.next(openEvent);
    this.#openPromise.resolve();
  }

  private onWebSocketClose(closeEvent: CloseEvent) {
    // console.log('\x1b[33m[websocket close]\x1b[0m');
    this.didWebSocketClose.next(closeEvent);
  }

  private onWebSocketError(errorEvent: Event) {
    // console.log('\x1b[31m[websocket error]\x1b[0m');
    this.didWebSocketError.next(errorEvent);
  }

  private onWebSocketMessage(messageEvent: MessageEvent) {
    try {
      if (typeof messageEvent.data !== 'string') {
        throw new Error('Expect message data to be string!');
      }

      const data: unknown = JSON.parse(messageEvent.data);

      if (!(typeof data === 'object' && data !== null)) {
        console.error('Cannot handle non object type message data:', data);
        return;
      }

      if ('id' in data) {
        if (typeof data.id !== 'number') {
          console.error('Expect message data id to be number:', data.id);
          return;
        }
        const promiseResolver = this.#promiseResolvers.get(data.id);
        if (!promiseResolver) {
          console.error('Cannot find promise resolver of message id "%s"!', data.id);
          return;
        }
        this.#promiseResolvers.delete(data.id);
        if ('result' in data) {
          promiseResolver.resolve(data.result);
        } else {
          if (!(
            ('error' in data && typeof data.error === 'object' && data.error !== null) &&
            ('code' in data.error && typeof data.error.code === 'number') &&
            ('message' in data.error && typeof data.error.message === 'string')
          )) {
            console.error('Expect error response message:', data);
            return;
          }
          promiseResolver.reject(new ProtocolError(data.error.code, data.error.message));
        }
      } else {
        // message without "id" parameter is protocol event.
        if (!('method' in data && typeof data.method === 'string' && 'params' in data)) {
          console.error('Expect protocol event message:', data);
          return;
        }

        let sessionId: string | undefined = undefined;
        if ('sessionId' in data && typeof data.sessionId === 'string') {
          sessionId = data.sessionId;
        }

        let handledByTargetSession = false;
        if (sessionId !== undefined) {
          const subject = this.#sessionsListeners.get(sessionId)?.[data.method];
          if (subject) {
            handledByTargetSession = true;
            subject.next(data.params);
          }
        }

        let handledByGlobalSession = false;
        { // always try to handle by global session (sessionId==undefined)
          const subject = this.#sessionsListeners.get(undefined)?.[data.method];
          if (subject) {
            handledByGlobalSession = true;
            subject.next(data.params);
          }
        }

        if (this.#noProtocolEventHandlerWarning) {
          if (!handledByTargetSession && !handledByGlobalSession) {
            console.warn('\x1b[33mNo protocol event handler for method "%s":\x1b[0m', data.method, data);
          }
        }
      }
    } catch (error) {
      console.error('\x1b[31mError parsing ws message:\x1b[0m', messageEvent.data);
    }
  }

  public createSession(sessionId: string | undefined): ProtocolSession {
    let session = this.#sessions.get(sessionId);
    if (!session) {
      session = this.#crreateSession(sessionId);
      this.#sessions.set(sessionId, session);
    }
    return session;
  }

  #crreateSession(sessionId: string | undefined): ProtocolSession {
    const listeners: Record<string, Subject<unknown>> = {};
    this.#sessionsListeners.set(sessionId, listeners);

    return new Proxy({} as any, {
      get: (target, domainName: string) => {
        return new Proxy({} as any, {
          get: (target, methodName: string) => {
            const method = `${domainName}.${methodName}`;
            return new Proxy((() => ({})) as any, {
              apply: (target, thisArg, [params]) => {
                const promiseResolver = Promise.withResolvers<unknown>();
                const id = ++this.#idPool;
                this.#promiseResolvers.set(id, promiseResolver);
                this.#webSocketClient.send(JSON.stringify({
                  id,
                  sessionId,
                  method,
                  params,
                }));
                return promiseResolver.promise;
              },
              get(target, p: string, receiver) {
                const observable = listeners[method] ??= new Subject();
                if (p === 'pipe') {
                  return (...args: any[]) => Reflect.apply(observable.pipe, observable, args);
                }
                if (p === 'subscribe') {
                  return (...args: any[]) => Reflect.apply(observable.subscribe, observable, args);
                }
                console.warn(`\x1b[31mAccess unallowed proxy property "${p}"!\x1b[0m`);
                return Reflect.get(observable, p, observable);
              },
            });
          },
        });
      },
    });
  }
}

class ProtocolError extends Error {
  public code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}
