import { ExportedData } from '^/exports/zod';
import { writeFile } from 'node:fs/promises';
import { IncomingMessage } from 'node:http';

export async function receiveExportedData(req: IncomingMessage): Promise<ExportedData> {
  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.once('end', () => resolve(Buffer.concat(chunks)));
    req.once('error', (error) => reject(error));
  });

  const json = JSON.parse(buffer.toString('utf-8'));
  const data = ExportedData.parse(json);

  return data;
}

export async function saveToFiles(data: ExportedData, options: {
  filePathWithoutExtension: string;
  generateJsonFile?: boolean;
  generateJsonTypeScriptDeclarationFile?: boolean;
  generateObjectDefinationFile?: boolean;
  generateReactElementFile?: boolean;
  generateReactComponentsFile?: boolean;
}): Promise<void> {
  if (options.generateJsonFile) {
    await writeFile(options.filePathWithoutExtension + '.json', [
      '{',
      '  "vars": {',
      Object.entries(data.vars).toSorted(([a], [b]) => a < b ? -1 : 1).map(([key, value]) => `    "${key}": ${JSON.stringify(value)}`).join(',\n'),
      '  },',
      '  "icons": {',
      Object.entries(data.icons).toSorted(([a], [b]) => a < b ? -1 : 1).map(([key, value]) => `    "${key}": ${JSON.stringify(value)}`).join(',\n'),
      '  }',
      '}',
    ].join('\n'));

    if (options.generateJsonTypeScriptDeclarationFile) {
      await writeFile(options.filePathWithoutExtension + '.d.json.ts', [
        '// Please set tsconfig.json#compilerOptions#allowArbitraryExtensions to `true`...',
        '// ...to allow `{basename}.d.{extension}.ts` declaration file,...',
        '// ...see https://www.typescriptlang.org/tsconfig/#allowArbitraryExtensions.',
        '',
        `export type VarName = ${Object.keys(data.vars).map((name) => JSON.stringify(name)).join(' | ')};`,
        `export type IconName = ${Object.keys(data.icons).map((name) => JSON.stringify(name)).join(' | ')};`,
        'export type IconInit = [width: number, height: number, paths: [d: string, opacity: number, fill: { hex: string } | { var: VarName }][]];',
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

  if (options.generateObjectDefinationFile) {
    await writeFile(options.filePathWithoutExtension + '.ts', [
      `export const vars = {\n${Object.entries(data.vars).map(([name, value]) => `  '${name}': '${value}',`).join('\n')}\n};`,
      '',
      `export type VarName = keyof typeof vars;`,
      '',
      'export type IconDefination = [width: number, height: number, paths: [d: string, opacity: number, fill: { hex: string } | { var: VarName }][]];',
      '',
      ...Object.entries(data.icons).map(([name, icon]) => `export const ${toCamelCase(name)}: IconDefination = ${JSON.stringify(icon)};`),
    ].join('\n'));
  }

  if (options.generateReactElementFile) {
    await writeFile(options.filePathWithoutExtension + '.tsx', [
      ...Object.entries(data.icons).map(([name, [width, height, paths]]) => `export const ${toCamelCase(name)} = (\n  <svg viewBox="0 0 ${width} ${height}">\n${paths.map(([d, opacity, fill]) => `    <path d="${d}" fillOpacity="${opacity}" fill="${'hex' in fill ? fill.hex : `var(--${fill.var})`}" />`).join('\n')}\n  </svg>\n);`),
    ].join('\n\n'));
  }
}

function toCamelCase(target: string): string {
  // return target.replace(/[\s\-\_]+/, () => '');
  const pascalCase = target.split(/[\s\-\_]+/).filter(Boolean).map((s) => s.slice(0, 1).toUpperCase() + s.slice(1)).join('');
  return pascalCase.slice(0, 1).toLowerCase() + pascalCase.slice(1);
}
