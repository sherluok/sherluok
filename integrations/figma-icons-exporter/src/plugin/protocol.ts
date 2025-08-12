import type { Observable } from 'rxjs';
import { z } from 'zod';

export type MainProcessService = {
  test(): Promise<number>;
  getLanguage(): Promise<Language>;
  setLanguage(value: Language): Promise<void>;
  getPresets(): Promise<Presets>;
  createPreset(data: Preset): Promise<Presets>;
  updatePreset(data: Preset): Promise<Presets>;
  switchPreset(id: number): Promise<Presets>;
  deletePreset(id: number): Promise<Presets>;
  selectSourceNode(): Promise<SelectedNode>;
  export(options: ExportOptions): Observable<ExportLog>;
};

export type RenderProcessService = {
  test(): Promise<number>;
};

export const SelectedNode = z.object({
  id: z.string(),
  name: z.string(),
});

export type SelectedNode = z.infer<typeof SelectedNode>;

export const ExportOptions = z.object({
  createFigmaComponent: z.boolean(),
  figmaComponentNodeId: z.string(),
  figmaComponentNodeName: z.string(),
  sendToHttpServer: z.boolean(),
  httpServerEndpoint: z.string(),
  generateJsonFile: z.boolean(),
  generateJsonDeclarationFile: z.boolean(),
  generateIconDefinationsFile: z.boolean(),
  generateReactElementsFile: z.boolean(),
  generateReactComponentsFile: z.boolean(),
});

export type ExportOptions = z.infer<typeof ExportOptions>;

export type ExportLog = {
  level: 'info' | 'warn' | 'error',
  message: string;
};

export const Language = z.union([
  z.literal('en-US'),
  z.literal('zh-CN'),
]);

export type Language = z.infer<typeof Language>;

export const Preset = z.object({
  id: z.number(),
  name: z.string(),
  sourceNode: SelectedNode.optional(),
  exportOptions: ExportOptions.optional(),
});

export type Preset = z.infer<typeof Preset>;

export const Presets = z.object({
  selection: z.number(),
  options: z.array(Preset),
});

export type Presets = z.infer<typeof Presets>;
