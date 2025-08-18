import { default as ReactRefreshPlugin } from '@pmmmwh/react-refresh-webpack-plugin';
import { VanillaExtractPlugin } from '@vanilla-extract/webpack-plugin';
import { Pattern as CopyPattern, default as CopyPlugin } from 'copy-webpack-plugin';
import { default as ForkTsCheckerPlugin } from 'fork-ts-checker-webpack-plugin';
import { default as MiniCssExtractPlugin } from 'mini-css-extract-plugin';
import { ok } from 'node:assert';
import { extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { default as reactRefreshTypeScript } from 'react-refresh-typescript';
import { default as TerserPlugin } from 'terser-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { DefinePlugin, Module, ResolvePluginInstance, RuleSetRule, Stats, webpack, Configuration as WebpackConfiguration, WebpackPluginInstance } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { Configuration as DevServerConfig, default as WebpackDevServer } from 'webpack-dev-server';
import { HtmlEntryPlugin } from './plugins/html-entry-plugin';
import { VscodeTaskPlugin } from './plugins/vscode-task-plugin';

type FeaturedConfig = {
  /** Defaults to `process.cwd()`. */
  context?: string;
  /** Defaults to `false`. */
  production?: boolean;
  /** Defaults to `"build"`, reloved by {@link FeaturedConfig.context context} .*/
  outputPath?: string;
  /** Defaults to `"/"`. */
  publicPath?: string;
  /** Copy files to {@link FeaturedConfig.outputPath outputPath} by CopyWebpackPlugin.  */
  copies?: string[];
  /** Path to `tsconfig.json`, defaults to `"tsconfig.json"`, reloved by {@link FeaturedConfig.context context}. */
  tsConfigFile?: string;
  /** Config for webpack-dev-server */
  devServer?: DevServerConfig;
  /** Replace variable at compile time by DefinePlugin */
  defines?: Record<string, any>;
  /** Entrypoints */
  entries?: Record<string, string>;
  /** Original Webpack Config */
  rules?: RuleSetRule[];
  plugins?: WebpackPluginInstance[];
};

export class FeaturedWebpackConfig {
  constructor(private init: FeaturedConfig) {}

  /** 合并多个配置 */
  static merge(...items: FeaturedWebpackConfig[]): FeaturedWebpackConfig {
    return items.reduce(({ init: a }, { init: b }) => {
      return new FeaturedWebpackConfig({
        ...a,
        ...b,
        copies: [
          ...a.copies ?? [],
          ...b.copies ?? [],
        ],
        defines: {
          ...a.defines,
          ...b.defines,
        },
        entries: {
          ...a.entries,
          ...b.entries,
        },
        rules: [
          ...a.rules ?? [],
          ...b.rules ?? [],
        ],
        plugins: [
          ...a.plugins ?? [],
          ...b.plugins ?? [],
        ],
      });
    });
  }

  normalize(devServer: boolean): WebpackConfiguration {
    const context = this.init.context ?? process.cwd();
    const production = this.init.production ?? false;

    const filename = production ? '[contenthash].js' : '[name].[contenthash:4].js';
    const chunkFilename = production ? '[contenthash].js' : '[name].[contenthash:4].js';
    const sourceMapFilename = production ? '[contenthash].json' : '[name].[contenthash:4].json';
    const assetModuleFilename = production ? '[contenthash][ext]' : '[name].[contenthash:4][ext]';
    const cssFilename = production ? '[contenthash].css' : '[name].[contenthash:4].css';
    const cssChunkFilename = production ? '[contenthash].css' : '[name].[contenthash:4].css';

    const commonOptions: CommonGeneratorOptions = {
      tsConfigFile: this.init.tsConfigFile ?? join(context, 'tsconfig.json'),
      production,
      assetResourceExts: [],
      assetSourceExts: [],
      assetInlineExts: [],
      assetAutoExts: [],
      copyPatterns: this.init.copies ?? [],
      defines: this.init.defines ?? {},
      reactRefresh: production ? false : devServer,
      cssFilename: cssFilename,
      cssChunkFilename: cssChunkFilename,
      bundleAnalyzer: false,
    };

    return {
      target: 'web',
      context: context,
      mode: production ? 'production' : 'development',
      devtool: production ? false : 'source-map',
      // entry: Object.fromEntries(Object.entries(this.init.entries ?? {}).map(([name, { entryScript }]) => [name, entryScript])),
      entry: {},
      output: {
        path: this.init.outputPath ?? join(context, 'dist'),
        clean: production,
        publicPath: this.init.publicPath ?? '/',
        filename,
        chunkFilename,
        sourceMapFilename,
        assetModuleFilename,
        cssFilename,
        cssChunkFilename,
        devtoolModuleFilenameTemplate: (info: any) => pathToFileURL(info.absoluteResourcePath).toString(),
      },
      resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        mainFields: ['module', 'main'],
        plugins: [
          ...generateScriptResolvePlugins(commonOptions),
        ],
      },
      module: {
        rules: [
          ...generateAssetRules(commonOptions),
          ...generateScriptRules(commonOptions),
          ...generateStyleRules(commonOptions),
          ...this.init.rules ?? [],
        ],
      },
      plugins: [
        ...generateAssetPlugins(commonOptions),
        ...generateScriptPlugins(commonOptions),
        ...generateStylePlugins(commonOptions),
        ...generateDevtoolsPlugins(commonOptions),
        // ...Object.entries(this.init.entries ?? {}).map(([name, { htmlTemplate }]) => new HtmlPlugin({
        //   chunks: [name],
        //   template: htmlTemplate,
        //   filename: name + '.html',
        // })),
        // new HtmlEntryPlugin(Object.fromEntries(Object.entries(this.init.entries ?? {}).map(([name, { htmlTemplate }]) => [name, htmlTemplate]))),
        new HtmlEntryPlugin(this.init.entries ?? {}),
        ...this.init.plugins ?? [],
      ],
      optimization: {
        // moduleIds: 'deterministic',
        // runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          minSize: 0,
          cacheGroups: {
            vendors: {
              name: 'vendors',
              // https://github.com/webpack/webpack/blob/ffec059d0ba44a382f11687d9a790b83b3f41061/lib/optimize/SplitChunksPlugin.js#L513
              test: (module: Module) => {
                const moduleNameForCondition = module.nameForCondition();
                // console.log('split chunk name:', moduleNameForCondition);
                return !!moduleNameForCondition && -1 !== [/[\\/]node_modules[\\/]/].findIndex((item) => {
                  return item.test(moduleNameForCondition);
                });
              },
            },
            react: {
              name: 'react',
              priority: 2,
              test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
            },
          },
        },
        minimizer: [
          // 防止生成 LICENSE.txt 文件
          // https://stackoverflow.com/questions/64818489/webpack-omit-creation-of-license-txt-files
          new TerserPlugin({
            extractComments: false,
          }),
        ],
      },
    };
  }

  /** 使用 Webpack Dev Server 运行。 */
  serve(devServerConfig?: DevServerConfig): Promise<void> {
    return serve(this.normalize(true), {
      ...this.init.devServer,
      ...devServerConfig,
    });
  }

  /** 编译构建输出。 */
  build(): Promise<Stats> {
    return build(this.normalize(false));
  }
}

/** 格式化配置文件为终端字符串，以方便打印到 console。 */
export function stringify(webpackConfig: WebpackConfiguration): string {
  return JSON.stringify(webpackConfig, null, 2);
}

/** 使用 Webpack Dev Server 运行。 */
export function serve(webpackConfig: WebpackConfiguration, devServerConfig?: DevServerConfig): Promise<void> {
  const compiler = webpack(webpackConfig);
  ok(compiler);
  const port = devServerConfig?.port ?? 3000;
  const devServer = new WebpackDevServer({
    port,
    hot: true,
    liveReload: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    client: {
      // https://webpack.js.org/configuration/dev-server/#overlay
      overlay: false,
      webSocketURL: `ws://localhost:${port}/ws`,
    },
    historyApiFallback: { // https://webpack.js.org/configuration/dev-server/#devserverhistoryapifallback
      rewrites: [
        { from: /./, to: '/index.html' },
      ],
    },
    ...devServerConfig,
  }, compiler);

  return devServer.start();
}

/** 编译构建输出。 */
export function build(webpackConfig: WebpackConfiguration): Promise<Stats> {
  const compiler = webpack(webpackConfig);
  ok(compiler);
  return new Promise<Stats>((fulfill, reject) => {
    compiler.run((error, stats) => {
      if (error || !stats) {
        reject(error);
      } else {
        fulfill(stats);
      }
    });
  });
}

type CommonGeneratorOptions = {
  production: boolean;
  tsConfigFile: string;
  assetResourceExts: string[];
  assetInlineExts: string[];
  assetSourceExts: string[];
  assetAutoExts: string[];
  copyPatterns: CopyPattern[];
  defines: Record<string, string>;
  reactRefresh: boolean;
  cssFilename: string;
  cssChunkFilename: string;
  bundleAnalyzer: boolean;
};

function* generateScriptResolvePlugins(options: CommonGeneratorOptions): Generator<ResolvePluginInstance> {
  yield new TsconfigPathsPlugin({
    configFile: options.tsConfigFile,
  });
}

function* generateAssetRules(options: CommonGeneratorOptions): Generator<RuleSetRule> {
  yield {
    // resourceQuery: /(^\?|\&)resource(\&|$)/,
    type: 'asset/resource',
    resourceQuery(value) {
      return new URLSearchParams(value).get('asset') === 'resource';
    },
  };

  yield {
    // resourceQuery: /(^\?|\&)inline(\&|$)/,
    type: 'asset/inline',
    resourceQuery(value) {
      return new URLSearchParams(value).get('asset') === 'inline';
    },
  };

  yield {
    // resourceQuery: /(^\?|\&)source(\&|$)/,
    type: 'asset/source',
    resourceQuery(value) {
      return new URLSearchParams(value).get('asset') === 'source';
    },
  };

  yield {
    // resourceQuery: /(^\?|\&)auto(\&|$)/,
    type: 'asset',
    resourceQuery(value) {
      return new URLSearchParams(value).get('asset') === 'auto';
    },
  };

  if (options.assetResourceExts.length) {
    yield {
      type: 'asset/resource',
      test: (value) => options.assetResourceExts.includes(extname(value)),
    };
  }

  if (options.assetInlineExts.length) {
    yield {
      type: 'asset/inline',
      test: (value) => options.assetInlineExts.includes(extname(value)),
    };
  }

  if (options.assetSourceExts.length) {
    yield {
      type: 'asset/source',
      test: (value) => options.assetSourceExts.includes(extname(value)),
    };
  }

  if (options.assetAutoExts.length) {
    yield {
      type: 'asset',
      test: (value) => options.assetAutoExts.includes(extname(value)),
    };
  }
}

function* generateAssetPlugins(options: CommonGeneratorOptions): Generator<WebpackPluginInstance> {
  if (options.copyPatterns.length) {
    yield new CopyPlugin({
      patterns: options.copyPatterns.map((pattern) => {
        if (typeof pattern === 'string') {
          return {
            noErrorOnMissing: true,
            from: pattern,
          };
        } else {
          return {
            noErrorOnMissing: true,
            ...pattern,
          };
        }
      }),
    });
  }
}

function* generateScriptRules(options: CommonGeneratorOptions): Generator<RuleSetRule> {
  yield {
    test: /\.tsx?$/i,
    use: {
      loader: require.resolve('ts-loader'),
      options: { // https://github.com/TypeStrong/ts-loader?tab=readme-ov-file#options
        configFile: options.tsConfigFile, // https://github.com/TypeStrong/ts-loader?tab=readme-ov-file#configfile
        transpileOnly: true, // https://github.com/TypeStrong/ts-loader?tab=readme-ov-file#transpileonly
        compilerOptions: { // https://github.com/TypeStrong/ts-loader?tab=readme-ov-file#compileroptions
          sourceMap: true,
          target: 'es2022',
        },
        getCustomTransformers: () => ({ // https://github.com/pmmmwh/react-refresh-webpack-plugin
          before: options.reactRefresh ? [reactRefreshTypeScript()] : [],
        }),
      },
    },
  };
}

function* generateScriptPlugins(options: CommonGeneratorOptions): Generator<WebpackPluginInstance> {
  if (Object.keys(options.defines).length) {
    // yield new DefinePlugin(Object.fromEntries(Object.entries(this.#init.replaceVariables).map(([k, v]) => [k, JSON.stringify(v)])));
    yield new DefinePlugin(options.defines);
  }

  yield new ForkTsCheckerPlugin({
    typescript: {
      configFile: options.tsConfigFile,
    },
  });

  if (options.reactRefresh) {
    yield new ReactRefreshPlugin();
  }
}

function* generateStyleRules(options: CommonGeneratorOptions): Generator<RuleSetRule> {
  const styleLoader = options.production
    ? MiniCssExtractPlugin.loader
    : require.resolve('style-loader');

  const postcssLoader = {
    // https://github.com/webpack-contrib/postcss-loader
    loader: require.resolve('postcss-loader'),
    options: {
      postcssOptions: {
        plugins: [
          // https://github.com/postcss/autoprefixer
          require.resolve('autoprefixer'),
        ],
      },
    },
  };

  yield { // https://vanilla-extract.style/documentation/integrations/webpack/
    test: /\.vanilla\.css$/i,
    use: [
      styleLoader,
      {
        loader: require.resolve('css-loader'),
        options: {
          url: false,
        },
      },
      postcssLoader,
    ],
  };

  yield {
    test: /\.modules\.css$/i,
    use: [
      styleLoader,
      {
        loader: require.resolve('css-loader'),
        options: {
          module: true,
        },
      },
      postcssLoader,
    ],
  };

  yield {
    test: /\.css$/i,
    exclude: [
      /\.vanilla\.css$/i,
      /\.modules\.css$/i,
    ],
    use: [
      styleLoader,
      require.resolve('css-loader'),
      postcssLoader,
    ],
  };
}

function* generateStylePlugins(options: CommonGeneratorOptions): Generator<WebpackPluginInstance> {
  yield new VanillaExtractPlugin();

  if (options.production) {
    // https://webpack.js.org/plugins/mini-css-extract-plugin/
    yield new MiniCssExtractPlugin({
      filename: options.cssFilename,
      chunkFilename: options.cssChunkFilename,
      // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/382
      // https://article.juejin.cn/post/7451860208186998838
      ignoreOrder: true,
    });
  }
}

function* generateDevtoolsPlugins(options: CommonGeneratorOptions): Generator<WebpackPluginInstance> {
  yield new VscodeTaskPlugin();

  if (options.bundleAnalyzer) {
    // https://webpack.js.org/guides/code-splitting/#bundle-analysis
    // https://github.com/webpack-contrib/webpack-bundle-analyzer
    yield new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-analyzer.html',
      generateStatsFile: true,
      statsFilename: 'bundle-analyzer.json',
    });
  }
}
