import { default as zod } from 'zod';
import { ExportData } from './common';

const PATH_DATA = zod.tuple([
  zod.string(),
  zod.number().min(0).max(1),
  zod.union([zod.string(), zod.object({ var: zod.string() })]),
]);

const ICON_DATA = zod.tuple([
  zod.number(),
  zod.number(),
  zod.array(PATH_DATA),
]);

const EXPORT_DATA = zod.object({
  vars: zod.record(zod.string(), zod.string()),
  icons: zod.record(zod.string(), ICON_DATA),
});

export function validateExportData(data: unknown): asserts data is ExportData {
  EXPORT_DATA.parse(data) satisfies ExportData;
}
