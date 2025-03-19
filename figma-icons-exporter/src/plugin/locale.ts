import { createContext, useContext, useMemo } from 'react';

export enum Language {
  enUS,
  zhCN,
}

export const LanguageContext = createContext<Language>(Language.zhCN);

export function useLabels() {
  const language = useContext(LanguageContext);
  return useMemo(() => {
    return new Proxy({} as Record<keyof typeof I18N_LABELS, string>, {
      get(target, p, receiver) {
        return (I18N_LABELS as any)[p][language];
      },
    });
  }, [language]);
}

const I18N_LABELS = {
  presetTemporary: {
    [Language.enUS]: 'Temporary',
    [Language.zhCN]: '临时',
  },
  presetInGroupTitle: {
    [Language.enUS]: 'Presets',
    [Language.zhCN]: '预设',
  },
  sourceNodeInGroupTitle: {
    [Language.enUS]: 'Source Node',
    [Language.zhCN]: '源节点',
  },
  exportTypeInGroupTitle: {
    [Language.enUS]: 'Export Type',
    [Language.zhCN]: '导出类型',
  },
  createFigmaComponent: {
    [Language.enUS]: 'Create Figma Component',
    [Language.zhCN]: '创建 Figma 组件',
  },
  useCurrentSelectionButton: {
    [Language.enUS]: 'Current Selection',
    [Language.zhCN]: '使用当前选中的节点',
  },
  createFigmaComponentDesc: {
    [Language.enUS]: 'Create a Figma component to use in design.',
    [Language.zhCN]: '创建 Figma 图标组件，以在设计中使用。',
  },
  sendToHttpServer: {
    [Language.enUS]: 'Send to http server',
    [Language.zhCN]: '发送到 HTTP 服务器',
  },
  sendToHttpServerDesc: {
    [Language.enUS]: 'Create a Figma component to use in design.',
    [Language.zhCN]: '创建 Figma 图标组件，以在设计中使用。',
  },
  genJson: {
    [Language.enUS]: 'Save as json',
    [Language.zhCN]: '生成 JSON 文件',
  },
  genJsonDesc: {
    [Language.enUS]: 'Save as a .json and .d.json.ts file.',
    [Language.zhCN]: '生成 .json 和 .d.json.ts 文件。',
  },
  genTypescript: {
    [Language.enUS]: 'Save as typescript',
    [Language.zhCN]: '生成 TypeScript 代码',
  },
  genTypescriptDesc: {
    [Language.enUS]: 'Save as a .ts file, which exports all icons as IconDefination object.',
    [Language.zhCN]: '生成 .ts 文件，将所有图标作为 IconDefination 对象导出。',
  },
  genReact: {
    [Language.enUS]: 'Save as react components',
    [Language.zhCN]: '生成 React 组件',
  },
  genReactDesc: {
    [Language.enUS]: 'Save as a .tsx file, which exports all icons as React component function.',
    [Language.zhCN]: '生成 .tsx 文件，将所有图标作为 React 组件函数导出。',
  },
  saveToPresetsButton: {
    [Language.enUS]: 'Save to Presets',
    [Language.zhCN]: '保存为预设',
  },
  updatePresetButton: {
    [Language.enUS]: 'Update Preset',
    [Language.zhCN]: '更新此预设',
  },
  exportButton: {
    [Language.enUS]: 'Export',
    [Language.zhCN]: '导出',
  },
  exportLoggerPlaceholder: {
    [Language.enUS]: 'Export log messages',
    [Language.zhCN]: '导出任务日志',
  },
};
