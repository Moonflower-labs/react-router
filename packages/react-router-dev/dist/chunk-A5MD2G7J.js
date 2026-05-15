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
  invariant
} from "./chunk-QI2ZSS2B.js";

// vite/vite.ts
import { createRequire as createRequire2 } from "module";
import path2 from "pathe";

// config/is-react-router-repo.ts
import { createRequire } from "module";
import path from "pathe";
var nodeRequire = createRequire(import.meta.url);
function isReactRouterRepo() {
  let serverRuntimePath = path.dirname(
    nodeRequire.resolve("@react-router/node/package.json")
  );
  let serverRuntimeParentDir = path.basename(
    path.resolve(serverRuntimePath, "..")
  );
  return serverRuntimeParentDir === "packages";
}

// vite/vite.ts
var nodeRequire2 = createRequire2(import.meta.url);
var vite;
var viteImportSpecifier = isReactRouterRepo() ? (
  // Support testing against different versions of Vite by ensuring that Vite
  // is resolved from the current working directory when running within this
  // repo. If we don't do this, Vite will always be imported relative to this
  // file, which means that it will always resolve to Vite 6.
  `file:///${path2.normalize(
    nodeRequire2.resolve("vite/package.json", { paths: [process.cwd()] })
  ).replace("package.json", "dist/node/index.js")}`
) : "vite";
async function preloadVite() {
  vite = await import(viteImportSpecifier);
}
function getVite() {
  invariant(vite, "getVite() called before preloadVite()");
  return vite;
}
function defineCompilerOptions(options) {
  let vite2 = getVite();
  return parseInt(vite2.version.split(".")[0], 10) >= 8 ? { oxc: options.oxc } : { esbuild: options.esbuild };
}
function defineOptimizeDepsCompilerOptions(options) {
  let vite2 = getVite();
  return parseInt(vite2.version.split(".")[0], 10) >= 8 ? { rolldownOptions: options.rolldown } : { esbuildOptions: options.esbuild };
}

export {
  isReactRouterRepo,
  preloadVite,
  getVite,
  defineCompilerOptions,
  defineOptimizeDepsCompilerOptions
};
