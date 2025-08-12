import type { LoaderDefinitionFunction } from "webpack";

/**
 * Allow [`this.importModule()`](https://webpack.js.org/api/loaders/#thisimportmodule) to request
 * a `asset/resource`... type resource, and return the file url or data uri.
 * @see https://github.com/webpack/webpack/issues/18928
 */
const assetRequestLoader: LoaderDefinitionFunction = function () {
  // return `module.exports = require(${JSON.stringify(this.utils.contextify(this.context, this.remainingRequest))});`;
  return `module.exports = require(${JSON.stringify(this.remainingRequest)});`;
};

module.exports = assetRequestLoader;
