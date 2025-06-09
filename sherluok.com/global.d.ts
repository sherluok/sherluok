/** Webpack Asset Modules Auto Generate Begin */

/** Using webpack `asset/resource` loader, emits a separate file and exports the URL. */
declare module '*?resource' {
  const fileURL: string;
  export default fileURL;
}

// /** Using webpack `asset/resource` loader, emits a separate file and exports the URL. */
// declare module '*.webp' {
//   const fileURL: string;
//   export default fileURL;
// }

// /** Using webpack `asset/resource` loader, emits a separate file and exports the URL. */
// declare module '*.png' {
//   const fileURL: string;
//   export default fileURL;
// }

// /** Using webpack `asset/resource` loader, emits a separate file and exports the URL. */
// declare module '*.jpg' {
//   const fileURL: string;
//   export default fileURL;
// }

// /** Using webpack `asset/resource` loader, emits a separate file and exports the URL. */
// declare module '*.jpeg' {
//   const fileURL: string;
//   export default fileURL;
// }

// /** Using webpack `asset/resource` loader, emits a separate file and exports the URL. */
// declare module '*.gif' {
//   const fileURL: string;
//   export default fileURL;
// }

// /** Using webpack `asset/resource` loader, emits a separate file and exports the URL. */
// declare module '*.ttf' {
//   const fileURL: string;
//   export default fileURL;
// }

// /** Using webpack `asset/resource` loader, emits a separate file and exports the URL. */
// declare module '*.woff' {
//   const fileURL: string;
//   export default fileURL;
// }

// /** Using webpack `asset/resource` loader, emits a separate file and exports the URL. */
// declare module '*.woff2' {
//   const fileURL: string;
//   export default fileURL;
// }

// /** Using webpack `asset/source` loader, exports a data URI of the asset. */
// declare module '*?inline' {
//   const dataURI: string;
//   export default dataURI;
// }

// /** Using webpack `asset/source` loader, exports a data URI of the asset. */
// declare module '*.svg' {
//   const dataURI: string;
//   export default dataURI;
// }

/** Using webpack `asset/inline` loader, exports the source code of the asset. */
declare module '*?source' {
  const sourceText: string;
  export default sourceText;
}

// /** Using webpack `asset/inline` loader, exports the source code of the asset. */
// declare module '*.txt' {
//   const sourceText: string;
//   export default sourceText;
// }

/** Using webpack `asset` loader, automatically chooses between exporting a data URI and emitting a separate file. */
declare module '*?auto' {
  const fileURLOrDataURI: string;
  export default fileURLOrDataURI;
}

/** Webpack Asset Modules Auto Generate End */

/** Webpack Define Plugin Auto Generate Begin */

/** Defined by Webpack DefinePlugin. */
declare const MODE: "production" | "development";

/** Defined by Webpack DefinePlugin. */
declare const PUBLIC_PATH: string;

/** Defined by Webpack DefinePlugin. */
declare const CESIUM_STATIC_BASENAME: string;

/** Defined by Webpack DefinePlugin. */
declare const CESIUM_ION_ACCESS_TOKEN: string;

/** Webpack Define Plugin Auto Generate End */

/** Webpack Hot Module Replacement Auto Generate Begin */

type HotModuleReplacement = {
  /**
   * Accept updates for the given dependencies and fire a callback to react to those updates.\
   * https://webpack.js.org/api/hot-module-replacement/#accept
   */
  accept(
    dependencies: string | string[],
    callback: () => void,
    errorHandler?: (error: unknown, info: { moduleId: string, dependencyId: string }) => void,
  ): void
};

interface NodeModule {
  /** Webpack [Hot Module Replacement API](https://webpack.js.org/api/hot-module-replacement/) */
  hot?: HotModuleReplacement;
}

interface ImportMeta {
  /** Webpack [Hot Module Replacement API](https://webpack.js.org/api/hot-module-replacement/) */
  webpackHot?: HotModuleReplacement;
}

/** Webpack Hot Module Replacement Auto Generate End */

interface Window {
  /** https://developer.mozilla.org/zh-CN/docs/Web/API/Window/queryLocalFonts */
  queryLocalFonts(options?: { postscriptNames?: string[] }): Promise<FontData[]>;
}

interface FontData {
  readonly family: string;
  readonly fullName: string;
  readonly postscriptName: string;
  readonly style: string;
  blob(): Promise<Blob>;
}
