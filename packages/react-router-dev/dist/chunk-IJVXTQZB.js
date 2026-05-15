/**
 * @react-router/dev v7.15.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
import {
  getVite,
  preloadVite
} from "./chunk-A5MD2G7J.js";

// vite/has-rsc-plugin.ts
async function hasReactRouterRscPlugin({
  root,
  viteBuildOptions: { config, logLevel, mode }
}) {
  await preloadVite();
  const vite = getVite();
  const viteConfig = await vite.resolveConfig(
    {
      configFile: config,
      logLevel,
      mode: mode ?? "production",
      root
    },
    "build",
    // command
    "production",
    // default mode
    "production"
    // default NODE_ENV
  );
  return viteConfig.plugins.some(
    (plugin) => plugin?.name === "react-router/rsc"
  );
}

export {
  hasReactRouterRscPlugin
};
