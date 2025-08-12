import { default as ReactRefreshPlugin } from '@pmmmwh/react-refresh-webpack-plugin';
import { VanillaExtractPlugin } from '@vanilla-extract/webpack-plugin';
import { Pattern as CopyPattern, default as CopyPlugin } from 'copy-webpack-plugin';
import { default as ForkTsCheckerPlugin } from 'fork-ts-checker-webpack-plugin';
import { default as MiniCssExtractPlugin } from 'mini-css-extract-plugin';
import { extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { default as reactRefreshTypeScript } from 'react-refresh-typescript';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { DefinePlugin, ResolvePluginInstance, RuleSetRule, Stats, webpack, Configuration as WebpackConfiguration, WebpackPluginInstance } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { VscodeTaskPlugin } from './plugins/vscode-task-plugin';

type ConfigurationInit = WebpackConfiguration & {
  // /** Defaults to `process.cwd()`. */
  // context?: string;
  // /** Defaults to `false`. */
  // production?: boolean;
  // /** Defaults to `"build"`, reloved by {@link FeaturedConfig.context context} .*/
  // outputPath?: string;
  // /** Defaults to `"/"`. */
  // publicPath?: string;
  // /** Copy files to {@link FeaturedConfig.outputPath outputPath} by CopyWebpackPlugin.  */
  // copies?: string[];
  // /** Path to `tsconfig.json`, defaults to `"tsconfig.json"`, reloved by {@link FeaturedConfig.context context}. */
  // tsConfigFile?: string;
  // /** Config for webpack-dev-server */
  // devServer?: DevServerConfig;
  // /** Replace variable at compile time by DefinePlugin */
  // defines?: Record<string, any>;
  // /** Entrypoints */
  // entries?: Record<string, string>;
  // /** Original Webpack Config */
  // rules?: RuleSetRule[];
  // plugins?: WebpackPluginInstance[];
  // entry?: EntryObject;
};

function mergeConfigurationInits(...inits: ConfigurationInit[]): ConfigurationInit {
  return inits.reduce((a, b) => {
    return {
      ...a,
      ...b,
      output: {
        ...a.output,
        ...b.output,
      },
      module: {
        ...a.module,
        ...b.module,
        rules: [
          ...a.module?.rules ?? [],
          ...b.module?.rules ?? [],
        ],
      },
      plugins: [
        ...a.plugins ?? [],
        ...b.plugins ?? [],
      ],
    };
  });
}

export class FeaturedConfiguration {
  constructor(private init: ConfigurationInit) { }

  normalize(): WebpackConfiguration {
    const context = this.init.context ?? process.cwd();
    const production = this.init.mode === 'production';

    const filename = production ? '[contenthash].js' : '[name].[contenthash:4].js';
    const chunkFilename = production ? '[contenthash].js' : '[name].[contenthash:4].js';
    const sourceMapFilename = production ? '[contenthash].json' : '[name].[contenthash:4].json';
    const assetModuleFilename = production ? '[contenthash][ext]' : '[name].[contenthash:4][ext]';
    const cssFilename = production ? '[contenthash].css' : '[name].[contenthash:4].css';
    const cssChunkFilename = production ? '[contenthash].css' : '[name].[contenthash:4].css';

    const commonOptions: CommonGeneratorOptions = {
      tsConfigFile: join(context, 'tsconfig.json'),
      production,
      assetResourceExts: [],
      assetSourceExts: [],
      assetInlineExts: [],
      assetAutoExts: [],
      copyPatterns: [],
      defines: {},
      reactRefresh: production ? false : true,
      cssFilename: cssFilename,
      cssChunkFilename: cssChunkFilename,
      bundleAnalyzer: false,
    };

    return mergeConfigurationInits({
      output: {
        clean: true,
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
          ...generateEntryRules(commonOptions),
        ],
      },
      plugins: [
        ...generateAssetPlugins(commonOptions),
        ...generateScriptPlugins(commonOptions),
        ...generateStylePlugins(commonOptions),
        ...generateDevtoolsPlugins(commonOptions),
      ],
    }, this.init);
  }

  build(): Promise<Stats> {
    return new Promise((fulfill, reject) => {
      try {
        webpack(this.normalize()).run((error, stats) => {
          if (error || !stats) {
            reject(error);
          } else {
            fulfill(stats);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
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
    type: 'asset/resource',
    resourceQuery: (value) => new URLSearchParams(value).get('asset') === 'resource',
  };

  yield {
    type: 'asset/inline',
    resourceQuery: (value) => new URLSearchParams(value).get('asset') === 'inline',
  };

  yield {
    type: 'asset/source',
    resourceQuery: (value) => new URLSearchParams(value).get('asset') === 'source',
  };

  yield {
    type: 'asset',
    resourceQuery: (value) => new URLSearchParams(value).get('asset') === 'auto',
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

function* generateEntryRules(options: CommonGeneratorOptions): Generator<RuleSetRule> {
  yield {
    test: /\.html$/i,
    type: 'asset/resource',
    use: [
      require.resolve('./loaders/html-entry-loader'),
    ],
    generator: {
      filename: '[name].html',
    },
    issuer(value) {
      console.log('issuer: [type] %s, [value] %s', typeof value, JSON.stringify(value));
      return !value;
    },
  };
  // yield {
  //   test: /\.js$/i,
  //   type: 'javascript/auto',
  //   issuer(value) {
  //     console.log('issuer: [type] %s, [value] %s', typeof value, JSON.stringify(value));
  //     return value.endsWith('.html');
  //   },
  // };
}
