import { z } from 'zod';

export const Path = z.tuple([
  z.string().describe('The d attribute, defines a path to be drawn.'),
  z.number().min(0).max(1).describe('The fill-opacity attribute, defines the transparency of the path element.'),
  z.union([
    z.object({ hex: z.string().regex(/^#/) }).describe('Hex format color value.'),
    z.object({ var: z.string() }).describe('Color variable name.'),
  ]).describe('The fill attribute, defines color used to paint the path element.'),
]);

export const Icon = z.tuple([
  z.number().gte(0).describe('svg element viewBox width.'),
  z.number().gte(0).describe('svg element viewBox height.'),
  z.array(Path).describe('svg element child path elements.'),
]);

export const Vars = z.record(
  z.string().describe('color variable name.'),
  z.string().describe('fallback hex color value of this color variable.'),
);

export const Icons = z.record(
  z.string().describe('icon name.'),
  Icon,
);

export const ExportedData = z.object({
  vars: Vars,
  icons: Icons,
});

export type Path = z.infer<typeof Path>;
export type Icon = z.infer<typeof Icon>;
export type Vars = z.infer<typeof Vars>;
export type Icons = z.infer<typeof Icons>;
export type ExportedData = z.infer<typeof ExportedData>;
