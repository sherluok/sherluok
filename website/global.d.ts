/// <reference types="react" />

/** Using webpack `asset/resource` loader, emits a separate file and exports the URL. */
declare module '*?asset=resource' {
  const fileURL: string;
  export default fileURL;
}

/** Using webpack `asset/inline` loader, exports the source code of the asset. */
declare module '*?asset=inline' {
  const base64DataURI: string;
  export default base64DataURI;
}

/** Using webpack `asset/source` loader, exports the source code of the asset. */
declare module '*?asset=source' {
  const sourceText: string;
  export default sourceText;
}

/** Using webpack `asset` loader, automatically chooses between exporting a data URI and emitting a separate file. */
declare module '*?asset=auto' {
  const fileURLOrDataURI: string;
  export default fileURLOrDataURI;
}

/** Defined by Webpack DefinePlugin. */
declare const MODE: "production" | "development";

/** Defined by Webpack DefinePlugin. */
declare const PUBLIC_PATH: string;

/** Using webpack `@mdx-js/loader` loader. */
declare module '*.mdx' {
  export const toc: RemarkMdxTocItem[];
  export const title: string;
  const MDXContent: React.FunctionComponent<{}>;
  export default MDXContent;
}

/** [remark-mdx-toc](https://github.com/DCsunset/remark-mdx-toc) */
type RemarkMdxTocItem = {
  depth: number;
  value: string;
  children: RemarkMdxTocItem[];
  attributes: Record<string, unknown>;
};

/** [rehype-mdx-toc](https://github.com/boning-w/rehype-mdx-toc) */
type RehypeMdxTocItem = {
  depth: number;
  id?: string;
  href?: string;
  value: string;
  numbering: number[];
};

