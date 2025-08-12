import { FeaturedConfiguration } from '@sherluok/webpack/configuration';
import { resolve } from 'node:path';

new FeaturedConfiguration({
  mode: 'development',
  output: {
    path: resolve('./.dist/web'),
    publicPath: '/',
  },
  entry: async () => ({
    'a': resolve('./src/web/v2.ts'),
    'b': resolve('./src/web/v2.html'),
    'c': resolve('./src/web/v2.html'),
    'd': resolve('./src/web/v3.html'),
    'e': resolve('./src/web/v3.html'),
  }),
}).build().then((stats) => {
  console.log(stats.toString({ colors: true, children: true }));
  console.log('✅️ 构建成功.');
}).catch((error) => {
  console.error(String(error));
  console.error('❌ 构建失败.');
});
