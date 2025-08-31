import { default as ReactRefreshPlugin } from '@pmmmwh/react-refresh-webpack-plugin';
import { VanillaExtractPlugin } from '@vanilla-extract/webpack-plugin';
import { Command } from 'commander';
import { default as CopyPlugin } from 'copy-webpack-plugin';
import { default as ForkTsCheckerPlugin } from 'fork-ts-checker-webpack-plugin';
import { default as HtmlWebpackPlugin } from 'html-webpack-plugin';
import { default as MiniCssExtractPlugin } from 'mini-css-extract-plugin';
import { ok } from 'node:assert';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { default as reactRefreshTypeScript } from 'react-refresh-typescript';
import { remarkMdxToc } from 'remark-mdx-toc';
import { default as TerserPlugin } from 'terser-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { Compiler, DefinePlugin, Module, Stats, webpack, WebpackPluginInstance } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { default as WebpackDevServer } from 'webpack-dev-server';
import { z } from 'zod';

export function serve(port: number) {
  const compiler = createCompiler(false, false);
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
  }, compiler);

  return devServer.start();
}

export function build(analyze: boolean) {
  const compiler = createCompiler(true, analyze);
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

function createCompiler(production: boolean, analyze: boolean) {
  const filename = production ? '[contenthash].js' : '[name].[contenthash:4].js';
  const chunkFilename = production ? '[contenthash].js' : '[name].[contenthash:4].js';
  const sourceMapFilename = production ? '[contenthash].json' : '[name].[contenthash:4].json';
  const assetModuleFilename = production ? '[contenthash][ext]' : '[name].[contenthash:4][ext]';
  const cssFilename = production ? '[contenthash].css' : '[name].[contenthash:4].css';
  const cssChunkFilename = production ? '[contenthash].css' : '[name].[contenthash:4].css';

  const root = process.cwd();
  const tsConfigFile = join(root, 'tsconfig.json');

  const styleLoader = production
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

  const compiler = webpack({
    target: 'web',
    context: root,
    mode: production ? 'production' : 'development',
    devtool: production ? false : 'source-map',
    entry: {
      'index': join(root, 'src/web/index.tsx'),
    },
    output: {
      path: join(root, '.dist'),
      clean: production,
      publicPath: '/',
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
        new TsconfigPathsPlugin({
          configFile: tsConfigFile,
        }),
      ],
      fallback: {
        fs: false,
        os: false,
        tty: false,
        util: false,
      },
    },
    module: {
      rules: [
        {
          type: 'asset/resource',
          resourceQuery: (value) => new URLSearchParams(value).get('asset') === 'resource',
        },
        {
          type: 'asset/inline',
          resourceQuery: (value) => new URLSearchParams(value).get('asset') === 'inline',
        },
        {
          type: 'asset/source',
          resourceQuery: (value) => new URLSearchParams(value).get('asset') === 'source',
        },
        {
          type: 'asset',
          resourceQuery: (value) => new URLSearchParams(value).get('asset') === 'auto',
        },
        {
          test: /\.tsx?$/i,
          use: {
            loader: require.resolve('ts-loader'),
            options: { // https://github.com/TypeStrong/ts-loader?tab=readme-ov-file#options
              configFile: tsConfigFile, // https://github.com/TypeStrong/ts-loader?tab=readme-ov-file#configfile
              transpileOnly: true, // https://github.com/TypeStrong/ts-loader?tab=readme-ov-file#transpileonly
              compilerOptions: { // https://github.com/TypeStrong/ts-loader?tab=readme-ov-file#compileroptions
                sourceMap: true,
                target: 'es2022',
              },
              getCustomTransformers: () => ({ // https://github.com/pmmmwh/react-refresh-webpack-plugin
                before: production ? [] : [reactRefreshTypeScript()],
              }),
            },
          },
        },
        { // https://vanilla-extract.style/documentation/integrations/webpack/
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
        },
        {
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
        },
        {
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
        },
        {
          resource: /\.mdx?$/,
          resourceQuery: /^$/,
          use: [
            {
              loader: require.resolve('@mdx-js/loader'),
              options: {
                remarkPlugins: [
                  remarkMdxToc,
                ],
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: join(root, 'public'),
            noErrorOnMissing: true,
          },
        ],
      }),
      new DefinePlugin({}),
      new ForkTsCheckerPlugin({
        typescript: {
          configFile: tsConfigFile,
        },
      }),
      new HtmlWebpackPlugin({
        chunks: ['index'],
        template: join(root, 'src/web/index.html'),
      }),
      new VanillaExtractPlugin(),
      new VscodeTaskPlugin(),
      ...(production ? [
        // https://webpack.js.org/plugins/mini-css-extract-plugin/
        new MiniCssExtractPlugin({
          filename: cssFilename,
          chunkFilename: cssChunkFilename,
          // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/382
          // https://article.juejin.cn/post/7451860208186998838
          ignoreOrder: true,
        })
      ] : [
        new ReactRefreshPlugin(),
      ]),
      ...(analyze ? [
        // https://webpack.js.org/guides/code-splitting/#bundle-analysis
        // https://github.com/webpack-contrib/webpack-bundle-analyzer
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: 'bundle-analyzer.html',
          generateStatsFile: true,
          statsFilename: 'bundle-analyzer.json',
        }),
      ] : []),
    ],
    optimization: {
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
  });

  ok(compiler);

  return compiler;
}

const BEGINS_PATTERN = 'vscode background task begins pattern';
const ENDS_PATTERN = 'vscode background task ends pattern';

class VscodeTaskPlugin implements WebpackPluginInstance {
  static NAME = 'vscode-task-plugin';

  #log(message: string, ...args: unknown[]): void {
    console.log(`📦 [🧩 \x1b[32;1m${VscodeTaskPlugin.NAME}\x1b[0m] ` + message, ...args);
  }

  apply(compiler: Compiler): void {
    if (compiler.isChild()) return;

    compiler.hooks.environment.tap(VscodeTaskPlugin.NAME, () => {
      // TERM_PROGRAM: 'vscode',
      // TERM_PROGRAM_VERSION: '1.91.1',
      if (process.env.TERM_PROGRAM === 'vscode') {
        this.#log('\x1b[33mwebpack running in vs code terminal\x1b[0m');
        compiler.hooks.run.tap(VscodeTaskPlugin.NAME, () => {
          console.log(BEGINS_PATTERN);
        });
        compiler.hooks.watchRun.tap(VscodeTaskPlugin.NAME, () => {
          console.log(BEGINS_PATTERN);
        });
        compiler.hooks.done.tap(VscodeTaskPlugin.NAME, () => {
          console.log(ENDS_PATTERN);
        });
      }
    });
  }
}

// https://github.com/tj/commander.js

if (require.main === module) {
  const program = new Command();

  program
    .name('webpack utils')
    .description('CLI to bundle or serve react website');

  program.command('dev')
    .description('Local development using webpack dev server')
    .option('-p, --port <port>', 'server port', '3000')
    .action((options) => {
      const { port } = z.object({
        port: z.string(),
      }).parse(options);
      serve(parseInt(port)).then(() => {
        console.log('✅️ 启动成功.');
      }).catch((error) => {
        console.error(error);
        console.error('❌ 启动失败.');
      });
    });

  program.command('build')
    .description('Bundle for production')
    .option('--analyze', 'generate bundle size report', false)
    .action((options) => {
      const { analyze } = z.object({
        analyze: z.boolean(),
      }).parse(options);
      build(analyze).then((stats) => {
        console.log(stats.toString({
          preset: 'errors-warnings',
          colors: true,
        }));
        console.log('✅️ 构建成功.');
      }).catch((error) => {
        console.error(error);
        console.error('❌ 构建失败.');
      });
    });

  program.parse();
}
