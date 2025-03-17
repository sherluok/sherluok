export type ExportData = {
  vars: ExportData.Vars;
  icons: ExportData.Icons;
};

export namespace ExportData {
  export type Vars = Record<string, string>;

  export type Icons<K extends string = string> = Record<K, ExportData.Icon>;

  export type Path = [
    d: string,
    opacity: number,
    fill: string | { var: string },
  ];

  export type Icon = [
    width: number,
    height: number,
    paths: Path[],
  ];
}
