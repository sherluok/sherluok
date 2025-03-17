import { z } from 'zod';

export const PluginMessageFromUI = z.object({
  type: z.literal('export'),
  data: z.object({
    createComponent: z.object({
      nodeName: z.string(),
    }).optional(),
    sendToServer: z.object({
      httpEndpointAddress: z.string(),
    }).optional(),
    saveJson: z.object({
      typesciptDelcaration: z.boolean(),
    }).optional(),
  }),
});

export const PluginMessageToUI = z.object({
  type: z.literal('export-result'),
  data: z.union([
    z.object({
      state: z.literal('pending'),
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
});

export type PluginMessageFromUI = z.infer<typeof PluginMessageFromUI>;

export type PluginMessageToUI = z.infer<typeof PluginMessageToUI>;

export function sendMessageToBackground(pluginMessage: PluginMessageFromUI) {
  window.parent.postMessage({ pluginMessage }, '*');
}

export function sendMessageToUI(pluginMessage: PluginMessageToUI) {
  figma.ui.postMessage(pluginMessage);
}

export function sendPendingMessageToUI(message: string) {
  sendMessageToUI({
    type: 'export-result',
    data: {
      state: 'pending',
      message,
    },
  });
}
