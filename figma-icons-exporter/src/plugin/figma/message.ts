import { Observable } from 'rxjs';
import { z } from 'zod';

const RequestId = z.number().int().gte(1);
const RequestType = z.literal('request');
const ResponseType = z.literal('response');
const SubscribeType = z.literal('subscribe');
const ObserverNextType = z.literal('observer.next');
const ObserverCompleteType = z.literal('observer.complete');
const ObserverErrorType = z.literal('observer.error');

const RequestMessage = z.object({
  id: RequestId,
  type: ResponseType,
  method: z.never(),
  params: z.never(),
  value: z.never(),
});

const SuccessResponseMessage = z.object({
  id: RequestId,
  type: ResponseType,
  method: z.literal('select-source-node'),
  success: z.literal(true),
  value: z.never(),
});

const ErrorResponseMessage = z.object({
  id: RequestId,
  type: ResponseType,
  method: z.literal('select-source-node'),
  success: z.literal(false),
  error: z.never(),
});

const ErrorResponseBody = z.object({
  message: z.string(),
});

const SelectSourceNodeRequest = z.object({
  type: RequestType,
  method: z.literal('select-source-node'),
  params: z.tuple([]),
});

const SelectSourceNodeResponseBody = z.object({
  nodeId: z.string(),
  nodeName: z.string(),
});

const SelectOutputNodeRequest = z.object({
  type: RequestType,
  method: z.literal('select-output-node'),
  params: z.tuple([]),
});

const SelectOutputNodeResponseBody = z.object({
  nodeId: z.string(),
  nodeName: z.string(),
});

const ExportRequestBody = z.object({
  createComponent: z.object({
    nodeName: z.string(),
  }).optional(),
  sendToServer: z.object({
    httpEndpoint: z.string(),
  }).optional(),
  saveJson: z.object({
    typesciptDelcaration: z.boolean(),
  }).optional(),
});

export const PluginMessageFromUI = z.union([
  z.object({
    type: z.literal('export'),
    data: z.object({
      createComponent: z.object({
        nodeName: z.string(),
      }).optional(),
      sendToServer: z.object({
        httpEndpoint: z.string(),
      }).optional(),
      saveJson: z.object({
        typesciptDelcaration: z.boolean(),
      }).optional(),
    }),
  }),
  z.object({
    id: RequestId,
    type: SubscribeType,
    method: z.literal('export'),
    params: z.tuple([ExportRequestBody]),
  }),
  SelectSourceNodeRequest,
  SelectOutputNodeRequest,
]);

export const PluginMessageToUI = z.union([
  z.object({
    type: z.literal('export-result'),
    data: z.union([
      z.object({
        state: z.literal('pending'),
        // level: z.union([z.literal('log'), z.literal('warn'), z.literal('error')]),
        message: z.string(),
      }),
      z.object({
        state: z.literal('fulfilled'),
        message: z.string(),
      }),
      z.object({
        state: z.literal('rejected'),
        message: z.string(),
      }),
    ]),
  }),
  z.object({
    id: RequestId,
    type: ObserverNextType,
    method: z.literal('export'),
    value: z.object({
      message: z.string(),
    }),
  }),
  z.object({
    id: RequestId,
    type: ObserverCompleteType,
    method: z.literal('export'),
  }),
  z.object({
    id: RequestId,
    type: ObserverErrorType,
    method: z.literal('export'),
    error: z.object({
      message: z.string(),
    }),
  }),
  z.object({
    type: ResponseType,
    method: z.literal('select-source-node'),
    success: z.literal(false),
    body: ErrorResponseBody,
  }),
  z.object({
    type: ResponseType,
    method: z.literal('select-source-node'),
    success: z.literal(true),
    body: SelectSourceNodeResponseBody,
  }),
  z.object({
    type: ResponseType,
    method: z.literal('select-output-node'),
    success: z.literal(false),
    body: ErrorResponseBody,
  }),
  z.object({
    type: ResponseType,
    method: z.literal('select-output-node'),
    success: z.literal(true),
    body: SelectOutputNodeResponseBody,
  }),
]);

export type PluginMessageFromUI = z.infer<typeof PluginMessageFromUI>;

export type PluginMessageToUI = z.infer<typeof PluginMessageToUI>;

export function sendMessageToMain(pluginMessage: PluginMessageFromUI) {
  window.parent.postMessage({ pluginMessage }, '*');
}

export function sendMessageToUI(pluginMessage: PluginMessageToUI) {
  figma.ui.postMessage(pluginMessage);
}

export function sendPendingMessageToUI(
  // level: 'log' | 'warn' | 'error',
  message: string,
) {
  sendMessageToUI({
    type: 'export-result',
    data: {
      state: 'pending',
      // level,
      message,
    },
  });
}

export function watchMessageToUI() {
  return new Observable<PluginMessageToUI>((observer) => {
    const ab = new AbortController();
    window.addEventListener('message', (event) => {
      const parseResult = PluginMessageToUI.safeParse(event.data.pluginMessage);
      if (parseResult.error) {
        console.error(parseResult.error);
        return;
      }
      observer.next(parseResult.data);
    }, {
      signal: ab.signal,
    });
    return () => {
      ab.abort();
    };
  });
}

export function requestSelectSourceNode() {
  return new Promise<z.infer<typeof SelectSourceNodeResponseBody>>((resolve, reject) => {
    sendMessageToMain({
      type: 'request',
      method: 'select-source-node',
      params: [],
    });
    watchMessageToUI().subscribe((message) => {
      if (message.type === 'response' && message.method === 'select-source-node') {
        if (message.success) {
          resolve(message.body);
        } else {
          reject(message.body.message);
        }
      }
    });
  });
}
