import { writeFile } from 'node:fs/promises';
import { IncomingMessage } from 'node:http';
import { ExportData } from '../exports/common';
import { validateExportData } from '../exports/zod';

export async function handleExportRequest(req: IncomingMessage): Promise<ExportData> {
  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.once('end', () => resolve(Buffer.concat(chunks)));
    req.once('error', (error) => reject(error));
  });

  const data = JSON.parse(buffer.toString('utf-8'));
  validateExportData(data);
  return data;
}

export async function saveToFiles(data: ExportData, filePathWithoutExtension: string, generateTypeDefination = false): Promise<void> {
  await writeFile(filePathWithoutExtension + '.json', [
    '{',
    '  "vars": {',
    Object.entries(data.vars).toSorted(([a], [b]) => a < b ? -1 : 1).map(([key, value]) => `    "${key}": ${JSON.stringify(value)}`).join(',\n'),
    '  },',
    '  "icons": {',
    Object.entries(data.icons).toSorted(([a], [b]) => a < b ? -1 : 1).map(([key, value]) => `    "${key}": ${JSON.stringify(value)}`).join(',\n'),
    '  }',
    '}',
  ].join('\n'));

  if (generateTypeDefination) {
    await writeFile(filePathWithoutExtension + '.d.json.ts', [
      '// Please set tsconfig.json#compilerOptions#allowArbitraryExtensions to `true`...',
      '// ...to allow `{basename}.d.{extension}.ts` declaration file,...',
      '// ...see https://www.typescriptlang.org/tsconfig/#allowArbitraryExtensions.',
      '',
      `export type VarName = ${Object.keys(data.vars).map((name) => JSON.stringify(name)).join(' | ')};`,
      `export type IconName = ${Object.keys(data.icons).map((name) => JSON.stringify(name)).join(' | ')};`,
      'export type IconInit = [width: number, height: number, paths: [d: string, opacity: number, fill: string | { var: VarName }][]];',
      '',
      'const icons: {',
      '  vars: Record<VarName, string>;',
      '  icons: Record<IconName, IconInit>;',
      '};',
      '',
      'export default icons;',
    ].join('\n'));
  }
}
