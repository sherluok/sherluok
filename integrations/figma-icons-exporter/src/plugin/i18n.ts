import { Language } from './protocol';

export function createLabelsGetter(language: Language) {
  return new Proxy({} as Record<keyof typeof I18N_LABELS, string>, {
    get(target, p, receiver) {
      return (I18N_LABELS as any)[p][language];
    },
  });
}

const I18N_LABELS = {
  presetTemporary: {
    'en-US': 'Temporary',
    'zh-CN': '临时',
  },
  presetInGroupTitle: {
    'en-US': 'Presets',
    'zh-CN': '预设',
  },
  sourceNodeInGroupTitle: {
    'en-US': 'Source Node',
    'zh-CN': '源节点',
  },
  exportTypeInGroupTitle: {
    'en-US': 'Export Type',
    'zh-CN': '导出类型',
  },
  createFigmaComponent: {
    'en-US': 'Create Figma Component',
    'zh-CN': '创建 Figma 组件',
  },
  useCurrentSelectionButton: {
    'en-US': 'Current Selection',
    'zh-CN': '使用当前选中的节点',
  },
  createFigmaComponentDesc: {
    'en-US': 'Create a Figma component to use in design.',
    'zh-CN': '创建 Figma 图标组件，以在设计中使用。',
  },
  sendToHttpServer: {
    'en-US': 'Send to http server',
    'zh-CN': '发送到 HTTP 服务器',
  },
  sendToHttpServerDesc: {
    'en-US': 'Create a Figma component to use in design.',
    'zh-CN': '创建 Figma 图标组件，以在设计中使用。',
  },
  genJson: {
    'en-US': 'Save as json',
    'zh-CN': '生成 JSON 文件',
  },
  genJsonDesc: {
    'en-US': 'Generates a .json file.',
    'zh-CN': '生成 .json 文件。',
  },
  genJsonDeclaration: {
    'en-US': 'JSON TypeScript Declaration',
    'zh-CN': '为 JSON 生成 TypeScript 声明',
  },
  genJsonDeclarationDesc: {
    'en-US': 'Generates a .d.json.ts file.',
    'zh-CN': '生成 .d.json.ts 文件。',
  },
  genTypescript: {
    'en-US': 'Save as typescript',
    'zh-CN': '生成 TypeScript 代码',
  },
  genTypescriptDesc: {
    'en-US': 'Save as a .ts file, which exports all icons as IconDefination object.',
    'zh-CN': '生成 .ts 文件，将所有图标作为 IconDefination 对象导出。',
  },
  genReactElement: {
    'en-US': 'Save as react elements',
    'zh-CN': '生成 React 元素',
  },
  genReactElementDesc: {
    'en-US': 'Save as a .tsx file, which exports all icons as React component function.',
    'zh-CN': '生成 .tsx 文件，将所有图标作为 React 元素函数导出。',
  },
  genReactComponent: {
    'en-US': 'Save as react components',
    'zh-CN': '生成 React 组件',
  },
  genReactComponentDesc: {
    'en-US': 'Save as a .tsx file, which exports all icons as React component function.',
    'zh-CN': '生成 .tsx 文件，将所有图标作为 React 组件函数导出。',
  },
  saveToPresetsButton: {
    'en-US': 'Save to Presets',
    'zh-CN': '保存为预设',
  },
  updatePresetButton: {
    'en-US': 'Update Preset',
    'zh-CN': '更新此预设',
  },
  exportButton: {
    'en-US': 'Export',
    'zh-CN': '导出',
  },
  exportLoggerPlaceholder: {
    'en-US': 'Export log messages',
    'zh-CN': '导出任务日志',
  },
};
