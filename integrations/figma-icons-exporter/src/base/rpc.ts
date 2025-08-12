import { Observable, Observer, Subject, Subscription } from 'rxjs';
import { z } from 'zod';

const RequestId = z.number().int().gte(1);

const RequestMessage = z.object({
  id: RequestId,
  type: z.literal('request'),
  method: z.string(),
  params: z.array(z.unknown()),
});

const ResponseMessage = z.object({
  id: RequestId,
  type: z.literal('response'),
  method: z.string(),
  success: z.boolean(),
  body: z.unknown(),
});

const SubscribeMessage = z.object({
  id: RequestId,
  type: z.literal('subscribe'),
  method: z.string(),
  params: z.array(z.unknown()),
});

const UnsubscribeMessage = z.object({
  id: RequestId,
  type: z.literal('unsubscribe'),
  method: z.string(),
});

const ObserverNextMessage = z.object({
  id: RequestId,
  type: z.literal('observer.next'),
  method: z.string(),
  body: z.unknown(),
});

const ObserverErrorMessage = z.object({
  id: RequestId,
  type: z.literal('observer.error'),
  method: z.string(),
  body: z.unknown(),
});

const ObserverCompleteMessage = z.object({
  id: RequestId,
  type: z.literal('observer.complete'),
  method: z.string(),
});

const ProtocolMessage = z.union([
  RequestMessage,
  ResponseMessage,
  SubscribeMessage,
  UnsubscribeMessage,
  ObserverNextMessage,
  ObserverErrorMessage,
  ObserverCompleteMessage,
]);

export type ProtocolMessage = z.infer<typeof ProtocolMessage>;

export type ProtocolTunnel<Encoded> = {
  encode(message: ProtocolMessage): Encoded;
  decode(encoded: Encoded): ProtocolMessage;
  listen(): Observable<Encoded>;
  send(encoded: Encoded): void;
};

export function openTunnel<T>(options: ProtocolTunnel<T>) {
  const input = {
    requestMessage: new Subject<z.infer<typeof RequestMessage>>,
    responseMessage: new Subject<z.infer<typeof ResponseMessage>>,
    subscribeMessage: new Subject<z.infer<typeof SubscribeMessage>>,
    unsubscribeMessage: new Subject<z.infer<typeof UnsubscribeMessage>>,
    observerNextMessage: new Subject<z.infer<typeof ObserverNextMessage>>,
    observerErrorMessage: new Subject<z.infer<typeof ObserverErrorMessage>>,
    observerCompleteMessage: new Subject<z.infer<typeof ObserverCompleteMessage>>,
  };

  const output = {
    requestMessage: new Subject<z.infer<typeof RequestMessage>>,
    responseMessage: new Subject<z.infer<typeof ResponseMessage>>,
    subscribeMessage: new Subject<z.infer<typeof SubscribeMessage>>,
    unsubscribeMessage: new Subject<z.infer<typeof UnsubscribeMessage>>,
    observerNextMessage: new Subject<z.infer<typeof ObserverNextMessage>>,
    observerErrorMessage: new Subject<z.infer<typeof ObserverErrorMessage>>,
    observerCompleteMessage: new Subject<z.infer<typeof ObserverCompleteMessage>>,
  };

  const requestPromiseResolvers = new Map<number, PromiseWithResolvers<unknown>>();
  const subscribeSubscriptions = new Map<number, Subscription>();
  const observers = new Map<number, Observer<unknown>>();

  const subscriptions = [
    // Receive message from remote
    options.listen().subscribe((encodedData) => {
      const decodedData = options.decode(encodedData);
      const parseResult = ProtocolMessage.safeParse(decodedData);
      if (parseResult.error) {
        console.error(parseResult.error);
      } else if (parseResult.data.type === 'request') {
        input.requestMessage.next(parseResult.data);
      } else if (parseResult.data.type === 'response') {
        input.responseMessage.next(parseResult.data);
      } else if (parseResult.data.type === 'subscribe') {
        input.subscribeMessage.next(parseResult.data);
      } else if (parseResult.data.type === 'unsubscribe') {
        input.unsubscribeMessage.next(parseResult.data);
      } else if (parseResult.data.type === 'observer.next') {
        input.observerNextMessage.next(parseResult.data);
      } else if (parseResult.data.type === 'observer.error') {
        input.observerErrorMessage.next(parseResult.data);
      } else if (parseResult.data.type === 'observer.complete') {
        input.observerCompleteMessage.next(parseResult.data);
      }
    }),
    // Send message to remote
    output.requestMessage.subscribe((message) => options.send(options.encode(message))),
    output.responseMessage.subscribe((message) => options.send(options.encode(message))),
    output.subscribeMessage.subscribe((message) => options.send(options.encode(message))),
    output.unsubscribeMessage.subscribe((message) => options.send(options.encode(message))),
    output.observerNextMessage.subscribe((message) => options.send(options.encode(message))),
    output.observerErrorMessage.subscribe((message) => options.send(options.encode(message))),
    output.observerCompleteMessage.subscribe((message) => options.send(options.encode(message))),
    // Handle response from remote
    input.responseMessage.subscribe((message) => {
      const resolvers = requestPromiseResolvers.get(message.id);
      if (!resolvers) throw message;
      if (message.success) {
        resolvers.resolve(message.body);
      } else {
        resolvers.reject(message.body);
      }
      requestPromiseResolvers.delete(message.id);
    }),
    input.unsubscribeMessage.subscribe((message) => {
      const subscription = subscribeSubscriptions.get(message.id);
      if (!subscription) throw message;
      subscription.unsubscribe();
      subscribeSubscriptions.delete(message.id);
    }),
    input.observerNextMessage.subscribe((message) => {
      const observer = observers.get(message.id);
      if (!observer) throw message;
      observer.next(message.body);
    }),
    input.observerErrorMessage.subscribe((message) => {
      const observer = observers.get(message.id);
      if (!observer) throw message;
      observer.error(message.body);
    }),
    input.observerCompleteMessage.subscribe((message) => {
      const observer = observers.get(message.id);
      if (!observer) throw message;
      observer.complete();
    }),
  ];

  let autoIncreamentRequestId = 0;

  return {
    close(): void {
      subscriptions.forEach((it) => it.unsubscribe());
    },
    serve<T extends object = object>(service: T): void {
      // Handle request from remote
      subscriptions.push(
        input.requestMessage.subscribe((message) => {
          const method = Reflect.get(service, message.method);
          if (typeof method !== 'function') throw method;
          const returnValue = Reflect.apply(method, service, message.params);
          if (!(returnValue instanceof Promise)) throw returnValue;
          returnValue.then((value) => {
            output.responseMessage.next({
              id: message.id,
              type: 'response',
              method: message.method,
              success: true,
              body: value,
            });
          }).catch((error) => {
            output.responseMessage.next({
              id: message.id,
              type: 'response',
              method: message.method,
              success: true,
              body: error,
            });
          });
        }),
        input.subscribeMessage.subscribe((message) => {
          const method = Reflect.get(service, message.method);
          if (typeof method !== 'function') throw method;
          const returnValue = Reflect.apply(method, service, message.params);
          if (!(returnValue instanceof Observable)) throw returnValue;
          const subscription = returnValue.subscribe({
            next(value) {
              options.send(options.encode({
                id: message.id,
                type: 'observer.next',
                method: message.method,
                body: value,
              }));
            },
            error(error) {
              options.send(options.encode({
                id: message.id,
                type: 'observer.error',
                method: message.method,
                body: error,
              }));
            },
            complete() {
              options.send(options.encode({
                id: message.id,
                type: 'observer.complete',
                method: message.method,
              }));
            },
          });
          subscribeSubscriptions.set(message.id, subscription);
        }),
      );
    },
    proxy<T>(): T {
      return new Proxy({} as any, {
        get(target, p: string, receiver) {
          if (typeof p !== 'string') {
            throw p;
          }
          return (...args: unknown[]) => {
            return new class extends Observable<unknown> implements Promise<unknown> {
              constructor() {
                super((observer) => {
                  const requestId = ++autoIncreamentRequestId;
                  observers.set(requestId, observer);
                  output.subscribeMessage.next({
                    id: requestId,
                    type: 'subscribe',
                    method: p,
                    params: args,
                  });
                  return () => {
                    observers.delete(requestId);
                    output.unsubscribeMessage.next({
                      id: requestId,
                      type: 'unsubscribe',
                      method: p,
                    });
                  };
                });
              }

              get [Symbol.toStringTag]() {
                return 'Observable+Promise';
              }

              #resolvers?: PromiseWithResolvers<unknown>;

              get #promise() {
                if (!this.#resolvers) {
                  const requestId = ++autoIncreamentRequestId;
                  this.#resolvers = Promise.withResolvers();
                  requestPromiseResolvers.set(requestId, this.#resolvers);
                  console.log('[RPC Promise Request] %d %s()', requestId, p, args);
                  options.send(options.encode({
                    id: requestId,
                    type: 'request',
                    method: p,
                    params: args,
                  }));
                }
                return this.#resolvers.promise;
              }

              then(onfulfilled?: ((value: unknown) => unknown | PromiseLike<unknown>) | null | undefined, onrejected?: ((reason: any) => never | PromiseLike<never>) | null | undefined): Promise<any> {
                return this.#promise.then(onfulfilled, onrejected);
              }

              catch(onrejected?: ((reason: any) => unknown | PromiseLike<unknown>) | null | undefined): Promise<unknown> {
                return this.#promise.catch(onrejected);
              }

              finally(onfinally?: (() => void) | null | undefined): Promise<unknown> {
                return this.#promise.finally(onfinally);
              }
            };
          };
        },
      });
    },
  };
}
