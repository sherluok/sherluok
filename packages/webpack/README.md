### `function defineConfig(config: WebpackConfiguration): WebpackConfiguration;`

定义 webpack 配置。

### `function mergeConfigs(...configs: WebpackConfiguration[]): WebpackConfiguration;`

合并多个 webpack 配置。

### `function stringifyConfig(config: WebpackConfiguration): string;`

格式化配置文件为终端字符串，以方便打印到 console。

### `function serve(config: WebpackConfiguration): Promise<void>;`

使用 Webpack Dev Server 运行。

### `function build(config: WebpackConfiguration): Promise<Stats>;`

编译构建输出。

### HTML Entry

通过 `htmlEntries` 选项定义 HTML 入口模板文件路径和输出的 HTML 文件名称。例如配置为：

```ts
{
  htmlEntries: {
    index: './home/index.html',
    studio: './studio/html.tsx',
  },
}
```

第一条，读取 *./home/index.html* 文件，分析其中的 `<script>` 和 `<link>` 元素，如果其资源路径为相对路径，例如 `<script src="./index.ts" />` 和 `<link rel="icon" href="./logo.png" />`。`<script>` 元素对应的脚本会被添加到 webpack 打包入口，并在生成 HTML 文件时时被替换为对应的一个或多个 chunk 的路径。`<link>` 元素对应的资源会被 webpack loader 加载（例如`assets/resource`），并在生成 HTML 文件时时被替换为加载结果，根据 loader 的设置，可能是文件路径、dataURI、文件原始内容等，所以最好配置 loader 的 resourceQuery 并在使用时在路径末尾添加形如 `./logo.png?resource` 的格式来显式指定导入结果。

第二条，*.ts* 或 *.js* 文件会首先被 webpack child compiler 编译，然后再 node vm 中运行并拿到其通过 export default 导出的函数，最后传入参数运行该函数拿到 HTML 字符串。接下来就与第一条的处理流程一样，分析 `<script>` 和 `<link>` 元素等等。

处理过后生成的 HTML 字符串，会输出到输出文件夹，文件名为 `htmlEntries` 中的键名加上后缀 `.html`，例如上面的配置会生成 `index.html` 和 `studio.html`。
