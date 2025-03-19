import { Observable } from 'rxjs';
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
});

const SuccessResponseMessage = ResponseMessage.extend({
  success: z.literal(true),
  value: z.unknown(),
});

const ErrorResponseMessage = ResponseMessage.extend({
  success: z.literal(false),
  error: z.unknown(),
});

const SubscribeMessage = z.object({
  id: RequestId,
  type: z.literal('subscribe'),
  method: z.string(),
  value: z.unknown(),
});

const ObserverNextMessage = z.object({
  id: RequestId,
  type: z.literal('observer.next'),
  method: z.string(),
  params: z.array(z.unknown()),
});

const ObserverCompleteMessage = z.object({
  id: RequestId,
  type: z.literal('observer.complete'),
  method: z.string(),
});

const ObserverErrorMessage = z.object({
  id: RequestId,
  type: z.literal('observer.error'),
  method: z.string(),
  error: z.unknown(),
});

const SelectSourceNodeResponseBody = z.object({
  nodeId: z.string(),
  nodeName: z.string(),
});

const SelectOutputNodeResponseBody = z.object({
  nodeId: z.string(),
  nodeName: z.string(),
});

const ExportOptions = z.object({
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
  SubscribeMessage.extend({
    method: z.literal('export'),
    params: z.tuple([ExportOptions]),
  }),
  RequestMessage.extend({
    method: z.literal('select-source-node'),
    params: z.tuple([]),
  }),
  RequestMessage.extend({
    method: z.literal('select-output-node'),
    params: z.tuple([]),
  }),
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
  ObserverNextMessage.extend({
    method: z.literal('export'),
    value: z.object({
      message: z.string(),
    }),
  }),
  ObserverCompleteMessage.extend({
    method: z.literal('export'),
  }),
  ObserverErrorMessage.extend({
    method: z.literal('export'),
    error: z.string(),
  }),
  SuccessResponseMessage.extend({
    method: z.literal('select-source-node'),
    value: SelectSourceNodeResponseBody,
  }),
  ErrorResponseMessage.extend({
    method: z.literal('select-source-node'),
    error: z.string(),
  }),
  SuccessResponseMessage.extend({
    method: z.literal('select-output-node'),
    value: SelectOutputNodeResponseBody,
  }),
  ErrorResponseMessage.extend({
    method: z.literal('select-output-node'),
    error: z.string(),
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

let autoIncreamentId = 1;

export function requestSelectSourceNode() {
  return new Promise<z.infer<typeof SelectSourceNodeResponseBody>>((resolve, reject) => {
    let requestId = autoIncreamentId++;
    sendMessageToMain({
      id: requestId,
      type: 'request',
      method: 'select-source-node',
      params: [],
    });
    watchMessageToUI().subscribe((message) => {
      if (message.type === 'response' && message.id === requestId && message.method === 'select-source-node') {
        if (message.success) {
          resolve(message.value);
        } else {
          reject(message.error);
        }
      }
    });
  });
}
