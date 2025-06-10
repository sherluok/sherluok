// https://www.w3.org/TR/appmanifest/
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest

import { LoaderContext } from 'webpack';

type LoaderOptions = {};

// https://webpack.js.org/api/loaders/
module.exports = async function (this: LoaderContext<LoaderOptions>, content: string, map: unknown, meta: unknown) {
  // https://webpack.js.org/api/loaders/#asynchronous-loaders
  const callback = this.async();
  const manifestJSON = JSON.parse(content);
  if ('icons' in manifestJSON && Array.isArray(manifestJSON.icons)) {
    for (const icon of manifestJSON.icons) {
      if (typeof icon === 'object') {
        if ('src' in icon && typeof icon.src === 'string') {
          if (!(icon.src.startsWith('/') || icon.src.startsWith('http://') || icon.src.startsWith('https://'))) {
            // console.log('\x1b[31mmanifest-json-loader importing:\x1b[0m', icon.src, 'from:', this.context);
            // https://webpack.js.org/api/loaders/#thisimportmodule
            const [path, query] = icon.src.split('?');
            const searchParams = new URLSearchParams(query);
            // Add ?asset=auto to the import path if original import path has no 'asset' search params.
            if (!searchParams.has('asset')) {
              searchParams.set('asset', 'auto');
            }
            const resource = [path, searchParams].join('?');
            // console.log('\x1b[31mmanifest-json-loader importing:\x1b[0m', resource);
            const fileURL = await this.importModule(resource);
            // console.log('\x1b[31mmanifest-json-loader imported result:\x1b[0m', fileURL);
            icon.src = fileURL;
          }
        }
      }
    }
  }
  callback(null, JSON.stringify(manifestJSON));
};
