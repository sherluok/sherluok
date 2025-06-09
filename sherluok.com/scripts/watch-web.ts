import { FeaturedWebpackConfig } from '@sherluok/webpack';
import { resolve } from 'node:path';

const shared = new FeaturedWebpackConfig({
  devServer: {
    port: 3001,
    historyApiFallback: { // https://webpack.js.org/configuration/dev-server/#devserverhistoryapifallback
      rewrites: [
        { from: /^\/studio\/[^\/]+\//, to: '/studio.html' },
        { from: /./, to: '/index.html' },
      ],
    },
  },
});

export default shared;

export const local = new FeaturedWebpackConfig({
  production: false,
  outputPath: resolve('./.dist/web'),
  publicPath: '/',
});

export const production = new FeaturedWebpackConfig({
  production: true,
  outputPath: resolve('./.dist/web'),
  publicPath: 'https://static.peatip.com/',
});

export const home = new FeaturedWebpackConfig({
  entries: {
    'index': resolve('./src/web/index.html'),
  },
});

if (require.main === module) {
  FeaturedWebpackConfig.merge(shared, home, local).serve().then(() => {
    console.log('✅️ 构建成功.');
  }).catch((error) => {
    console.error(error);
    console.error('❌ 构建失败.');
  });
  // if (process.argv.includes('--watch')) {
  //   FeaturedWebpackConfig.merge(shared, home, studio, preview).serve().then((stats) => {
  //     console.log('✅️ 构建成功.');
  //   }).catch((error) => {
  //     console.error(error);
  //     console.error('❌ 构建失败.');
  //   });
  // } else {
  //   FeaturedWebpackConfig.merge(shared, home, studio, preview).build().then((stats) => {
  //     console.log(stats.toString({ colors: true }));
  //     console.log('✅️ 构建成功.');
  //   }).catch((error) => {
  //     console.error(error);
  //     console.error('❌ 构建失败.');
  //   });
  // }
}
