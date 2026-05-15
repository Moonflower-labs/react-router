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
  create,
  detectRouteChunks,
  getOptimizeDepsEntries,
  getPrerenderPaths,
  hasDependency,
  loadDotenv,
  prerender,
  reactRouterVitePlugin,
  removeExports,
  validatePluginOrder,
  warnOnClientSourceMaps
} from "./chunk-RPW65RF3.js";
import {
  generate,
  parse,
  watch
} from "./chunk-45PASRDH.js";
import "./chunk-J6WV576L.js";
import {
  createConfigLoader,
  resolveRSCEntryFiles
} from "./chunk-KH3J56LY.js";
import "./chunk-ZZD5RYKL.js";
import {
  defineCompilerOptions,
  defineOptimizeDepsCompilerOptions,
  getVite,
  preloadVite
} from "./chunk-A5MD2G7J.js";
import {
  invariant
} from "./chunk-QI2ZSS2B.js";

// vite/rsc/plugin.ts
import { init as initEsModuleLexer2 } from "es-module-lexer";
import * as Path from "pathe";
import colors from "picocolors";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path2, { join } from "pathe";

// vite/rsc/virtual-route-config.ts
import path from "pathe";
var js = String.raw;
function createVirtualRouteConfig({
  appDirectory,
  routeConfig
}) {
  let routeIdByFile = /* @__PURE__ */ new Map();
  let code = js`import * as React from "react";
function frameworkRoute(lazy) {
  return async () => {
    const mod = await lazy();
    let Component;
    let Layout;
    let ErrorBoundary;
    let HydrateFallback;
    if ("default" in mod && mod.default) {
      if ("ServerComponent" in mod && mod.ServerComponent) {
        throw new Error("Module cannot have both a default export and a ServerComponent export");
      }
      Component = mod.default;
    } else if ("ServerComponent" in mod && mod.ServerComponent) {
      Component = mod.ServerComponent;
    }
    if ("Layout" in mod && mod.Layout) {
      if ("ServerLayout" in mod && mod.ServerLayout) {
        throw new Error("Module cannot have both a Layout export and a ServerLayout export");
      }
      Layout = mod.Layout;
    } else if ("ServerLayout" in mod && mod.ServerLayout) {
      Layout = mod.ServerLayout;
    }
    if ("ErrorBoundary" in mod && mod.ErrorBoundary) {
      if ("ServerErrorBoundary" in mod && mod.ServerErrorBoundary) {
        throw new Error(
          "Module cannot have both an ErrorBoundary export and a ServerErrorBoundary export",
        );
      }
      ErrorBoundary = mod.ErrorBoundary;
    } else if ("ServerErrorBoundary" in mod && mod.ServerErrorBoundary) {
      ErrorBoundary = mod.ServerErrorBoundary;
    }
    if ("HydrateFallback" in mod && mod.HydrateFallback) {
      if ("ServerHydrateFallback" in mod && mod.ServerHydrateFallback) {
        throw new Error(
          "Module cannot have both a HydrateFallback export and a ServerHydrateFallback export",
        );
      }
      HydrateFallback = mod.HydrateFallback;
    } else if ("ServerHydrateFallback" in mod && mod.ServerHydrateFallback) {
      HydrateFallback = mod.ServerHydrateFallback;
    }

    const {
      action,
      clientAction,
      clientLoader,
      clientMiddleware,
      handle,
      headers,
      links,
      loader,
      meta,
      middleware,
      shouldRevalidate,
    } = mod;

    return {
      Component,
      ErrorBoundary,
      HydrateFallback,
      Layout,
      action,
      clientAction,
      clientLoader,
      clientMiddleware,
      handle,
      headers,
      links,
      loader,
      meta,
      middleware,
      shouldRevalidate,
    };
  };
}
export default [`;
  const closeRouteSymbol = Symbol("CLOSE_ROUTE");
  let stack = [
    ...routeConfig
  ];
  while (stack.length > 0) {
    const route = stack.pop();
    if (!route) break;
    if (route === closeRouteSymbol) {
      code += "]},";
      continue;
    }
    code += "{";
    const routeFile = path.resolve(appDirectory, route.file);
    const routeId = route.id || createRouteId(route.file, appDirectory);
    routeIdByFile.set(routeFile, routeId);
    code += `lazy: frameworkRoute(() => import(${JSON.stringify(
      `${routeFile}`
    )})),`;
    code += `id: ${JSON.stringify(routeId)},`;
    if (typeof route.path === "string") {
      code += `path: ${JSON.stringify(route.path)},`;
    }
    if (route.index) {
      code += `index: true,`;
    }
    if (route.caseSensitive) {
      code += `caseSensitive: true,`;
    }
    if (route.children) {
      code += ["children:["];
      stack.push(closeRouteSymbol);
      stack.push(...[...route.children].reverse());
    } else {
      code += "},";
    }
  }
  code += "];\n";
  return { code, routeIdByFile };
}
function createRouteId(file, appDirectory) {
  return path.relative(appDirectory, file).replace(/\\+/, "/").slice(0, -path.extname(file).length);
}

// vite/rsc/virtual-route-modules.ts
import {
  init as initEsModuleLexer,
  parse as esModuleLexer
} from "es-module-lexer";
var ENSURE_CLIENT_ROUTE_MODULE_CHUNK_FOR_HMR = `
import * as ___EnsureClientRouteModuleForHMR_REACT___ from "react";
export function EnsureClientRouteModuleForHMR___() { return ___EnsureClientRouteModuleForHMR_REACT___.createElement(___EnsureClientRouteModuleForHMR_REACT___.Fragment, null) }
`;
function virtualRouteModulesPlugin({
  enforceSplitRouteModules,
  environments: { client = ["client", "ssr"], server = ["rsc"] } = {},
  getRouteIdForFile,
  isRootRouteModule,
  transformToJs,
  shouldTransform
}) {
  let clientEnvironments = new Set(client);
  let serverEnvironments = new Set(server);
  let cache = /* @__PURE__ */ new Map();
  async function createClientRouteEntry(id, code, isRootRouteModule2, routeId) {
    let result = "";
    let routeChunks = detectRouteChunks2(cache, id, code, isRootRouteModule2);
    let { staticExports } = await parseRouteExports(code);
    validateRouteModuleExports(staticExports);
    let needsReactImport = false;
    for (let exportName of staticExports) {
      if (isServerRouteExport(exportName)) {
        continue;
      }
      if ((exportName === "clientAction" || exportName === "clientLoader") && routeChunks.hasRouteChunkByExportName[exportName]) {
        result += `export const ${exportName} = async (...args) => import("${createId(id, "client-route-module", exportName)}").then(mod => mod.${exportName}(...args));
`;
      } else if (exportName === "HydrateFallback") {
        needsReactImport = true;
        result += `export const ${exportName} = React.lazy(() => import("${createId(
          id,
          "client-route-module",
          routeChunks.hasRouteChunkByExportName[exportName] ? exportName : "shared"
        )}").then(mod => ({ default: mod.${exportName} })));
`;
      } else {
        result += `export { ${exportName} } from "${createId(
          id,
          "client-route-module",
          routeChunks.hasRouteChunkByExportName[exportName] ? exportName : "shared"
        )}";
`;
      }
    }
    if (needsReactImport) {
      result = `import * as React from "react";
${result}`;
    }
    if (enforceSplitRouteModules() && !isRootRouteModule2) {
      let { hasRouteChunkByExportName } = routeChunks;
      let hasClientAction = staticExports.includes("clientAction");
      let hasClientLoader = staticExports.includes("clientLoader");
      let hasClientMiddleware = staticExports.includes("clientMiddleware");
      let hasHydrateFallback = staticExports.includes("HydrateFallback");
      validateRouteChunks({
        id: routeId,
        valid: {
          clientAction: !hasClientAction || hasRouteChunkByExportName.clientAction,
          clientLoader: !hasClientLoader || hasRouteChunkByExportName.clientLoader,
          clientMiddleware: !hasClientMiddleware || hasRouteChunkByExportName.clientMiddleware,
          HydrateFallback: !hasHydrateFallback || hasRouteChunkByExportName.HydrateFallback
        }
      });
    }
    return {
      code: '"use client";\n' + result
    };
  }
  async function createServerRouteEntry(id, code, isRootRouteModule2, routeId) {
    let result = "";
    let routeChunks = detectRouteChunks2(cache, id, code, isRootRouteModule2);
    let { staticExports } = await parseRouteExports(code);
    validateRouteModuleExports(staticExports);
    let needsReactImport = false;
    for (let exportName of staticExports) {
      if (isClientRouteExport(exportName)) {
        result += `export { ${exportName} } from "${createId(
          id,
          "client-route-module",
          routeChunks.hasRouteChunkByExportName[exportName] ? exportName : "shared"
        )}";
`;
      } else if (isServerComponentExport(exportName)) {
        needsReactImport = true;
        result += `import { ${exportName} as ${exportName}WithoutCss } from "${createId(id, "server-route-module")}";
`;
        result += `export function ${exportName}(props) {
`;
        result += `  return React.createElement(React.Fragment, null,
`;
        result += `    import.meta.viteRsc.loadCss(),
`;
        result += `    React.createElement(EnsureClientRouteModuleForHMR___, null),
`;
        result += `    React.createElement(${exportName}WithoutCss, props),
`;
        result += `  );
`;
        result += `}
`;
      } else {
        result += `export { ${exportName} } from "${createId(id, "server-route-module")}";
`;
      }
    }
    if (needsReactImport) {
      result = `import * as React from "react";
import { EnsureClientRouteModuleForHMR___ } from "${createId(id, "client-route-module", "shared")}";

${result}`;
    }
    if (isRootRouteModule2 && !staticExports.includes("ErrorBoundary") && !staticExports.includes("ServerErrorBoundary")) {
      result += `export { ErrorBoundary } from "${createId(id, "client-route-module", "shared")}";
`;
    }
    if (enforceSplitRouteModules() && !isRootRouteModule2) {
      let { hasRouteChunkByExportName } = routeChunks;
      let hasClientAction = staticExports.includes("clientAction");
      let hasClientLoader = staticExports.includes("clientLoader");
      let hasClientMiddleware = staticExports.includes("clientMiddleware");
      let hasHydrateFallback = staticExports.includes("HydrateFallback");
      validateRouteChunks({
        id: routeId,
        valid: {
          clientAction: !hasClientAction || hasRouteChunkByExportName.clientAction,
          clientLoader: !hasClientLoader || hasRouteChunkByExportName.clientLoader,
          clientMiddleware: !hasClientMiddleware || hasRouteChunkByExportName.clientMiddleware,
          HydrateFallback: !hasHydrateFallback || hasRouteChunkByExportName.HydrateFallback
        }
      });
    }
    return {
      code: result
    };
  }
  function createServerRouteModule(code) {
    const ast = parse(code, {
      sourceType: "module"
    });
    removeExports(ast, CLIENT_ROUTE_EXPORTS);
    return generate(ast);
  }
  async function createClientRouteModuleChunk(id, code, chunk, routeId, isRootRouteModule2, isDevMode) {
    let routeChunks = detectRouteChunks2(cache, id, code, isRootRouteModule2);
    const ast = parse(code, {
      sourceType: "module"
    });
    const { staticExports } = await parseRouteExports(code);
    if (chunk === "shared") {
      removeExports(ast, [
        ...SERVER_ROUTE_EXPORTS,
        ...routeChunks.chunkedExports
      ]);
    } else {
      const toRemove = /* @__PURE__ */ new Set([...SERVER_ROUTE_EXPORTS, ...staticExports]);
      toRemove.delete(chunk);
      removeExports(ast, Array.from(toRemove));
    }
    const generated = generate(ast);
    let result = '"use client";\n' + generated.code;
    if (chunk === "shared") {
      if (isRootRouteModule2 && !staticExports.includes("ErrorBoundary") && !staticExports.includes("ServerErrorBoundary")) {
        const hasRootLayout = staticExports.includes("Layout") || staticExports.includes("ServerLayout");
        result += `
import { createElement as __rr_createElement } from "react";
`;
        result += `import { UNSAFE_RSCDefaultRootErrorBoundary } from "react-router";
`;
        result += `export function ErrorBoundary() {
`;
        result += `  return __rr_createElement(UNSAFE_RSCDefaultRootErrorBoundary, { hasRootLayout: ${hasRootLayout} });
`;
        result += `}
`;
      }
      result += ENSURE_CLIENT_ROUTE_MODULE_CHUNK_FOR_HMR;
    }
    let hasAction = staticExports.includes("action");
    let hasLoader = staticExports.includes("loader");
    let hasComponent = staticExports.includes("default") || staticExports.includes("ServerComponent");
    let hasErrorBoundary = staticExports.includes("ErrorBoundary") || staticExports.includes("ServerErrorBoundary");
    if (isDevMode) {
      result += `export function ReactRouterHMRMeta___() {return null;};
`;
      result += `Object.assign(ReactRouterHMRMeta___, {
        hasAction: ${JSON.stringify(hasAction)},
        hasComponent: ${JSON.stringify(hasComponent)},
        hasErrorBoundary: ${JSON.stringify(hasErrorBoundary)},
        hasLoader: ${JSON.stringify(hasLoader)},
        hasClientLoader: ${JSON.stringify(staticExports.includes("clientLoader"))},
      });
`;
      result += `
if (import.meta.hot) {
`;
      result += `  import.meta.hot.accept((mod) => {
          if (typeof __reactRouterDataRouter === "object") {
            __reactRouterDataRouter._updateRoutesForHMR(new Map([[${JSON.stringify(routeId)}, {
              routeModule: mod,
              ...mod.ReactRouterHMRMeta___,
            }]]));

            if (${chunk === "shared" ? "!mod.default || " : ""}mod.clientLoader || (
              mod.ReactRouterHMRMeta___.hasClientLoader || ReactRouterHMRMeta___.hasClientLoader || ReactRouterHMRMeta___.hasLoader
            )) {
              __reactRouterDataRouter.revalidate();
            }
          }
        });
      `;
      result += `}
`;
    }
    return {
      code: result
    };
  }
  return {
    name: "react-router-rsc-virtual-route-modules",
    enforce: "pre",
    async transform(_code, id) {
      const [filename, ...rest] = id.split("?");
      const routeId = getRouteIdForFile(filename);
      if (!routeId || shouldTransform && !shouldTransform?.(filename)) {
        return;
      }
      let isClientEnvironment = clientEnvironments.has(this.environment.name);
      let isServerEnvironment = serverEnvironments.has(this.environment.name);
      if (!isClientEnvironment && !isServerEnvironment) {
        return;
      }
      let code = await transformToJs(_code, filename);
      let searchParams = rest.length > 0 ? new URLSearchParams(rest.join("?")) : null;
      let clientRouteModuleType = searchParams?.get("client-route-module");
      let isServerRouteModule = searchParams?.has("server-route-module");
      if (clientRouteModuleType) {
        return await createClientRouteModuleChunk(
          id,
          code,
          clientRouteModuleType,
          routeId,
          isRootRouteModule(filename),
          this.environment.mode === "dev"
        );
      }
      if (isServerRouteModule) {
        return createServerRouteModule(code);
      }
      if (isClientEnvironment) {
        return await createClientRouteEntry(
          id,
          code,
          isRootRouteModule(filename),
          routeId
        );
      }
      return await createServerRouteEntry(
        id,
        code,
        isRootRouteModule(filename),
        routeId
      );
    }
  };
}
function createId(id, type, value) {
  let [base, ...rest] = id.split("?");
  const searchParams = new URLSearchParams(rest.join("?"));
  searchParams.delete("client-route-module");
  searchParams.delete("server-route-module");
  searchParams.set(type, value || "");
  return `${base}?${searchParams.toString()}`;
}
async function parseRouteExports(code) {
  await initEsModuleLexer;
  const [, exportSpecifiers] = esModuleLexer(code);
  const staticExports = exportSpecifiers.map(({ n: name }) => name);
  return {
    staticExports,
    hasClientExports: staticExports.some(isClientRouteExport)
  };
}
var CLIENT_NON_COMPONENT_EXPORTS = [
  "clientAction",
  "clientLoader",
  "clientMiddleware",
  "handle",
  "meta",
  "links",
  "shouldRevalidate"
];
var CLIENT_ROUTE_EXPORTS = [
  ...CLIENT_NON_COMPONENT_EXPORTS,
  "default",
  "ErrorBoundary",
  "HydrateFallback",
  "Layout"
];
var CLIENT_ROUTE_EXPORTS_SET = new Set(CLIENT_ROUTE_EXPORTS);
function isClientRouteExport(name) {
  return CLIENT_ROUTE_EXPORTS_SET.has(name);
}
var SERVER_COMPONENT_EXPORTS = [
  "ServerComponent",
  "ServerLayout",
  "ServerHydrateFallback",
  "ServerErrorBoundary"
];
var SERVER_COMPONENT_EXPORTS_SET = new Set(SERVER_COMPONENT_EXPORTS);
function isServerComponentExport(name) {
  return SERVER_COMPONENT_EXPORTS_SET.has(name);
}
var SERVER_ROUTE_EXPORTS = [
  ...SERVER_COMPONENT_EXPORTS,
  "loader",
  "action",
  "middleware",
  "headers"
];
var SERVER_ROUTE_EXPORTS_SET = new Set(SERVER_ROUTE_EXPORTS);
function isServerRouteExport(name) {
  return SERVER_ROUTE_EXPORTS_SET.has(name);
}
var CLIENT_MODULE_CHUNKS = /* @__PURE__ */ new Set([
  "clientAction",
  "clientLoader",
  "clientMiddleware",
  "HydrateFallback"
]);
var MUTUALLY_EXCLUSIVE_ROUTE_EXPORTS = /* @__PURE__ */ new Map([
  ["ErrorBoundary", "ServerErrorBoundary"],
  ["HydrateFallback", "ServerHydrateFallback"],
  ["Layout", "ServerLayout"],
  ["default", "ServerComponent"]
]);
function validateRouteModuleExports(toValidate) {
  let errors = [];
  for (let [clientExport, serverExport] of MUTUALLY_EXCLUSIVE_ROUTE_EXPORTS) {
    if (toValidate.includes(clientExport) && toValidate.includes(serverExport)) {
      errors.push([clientExport, serverExport]);
    }
  }
  if (errors.length > 0) {
    throw new Error(
      `Invalid route module exports. The following pairs of exports are mutually exclusive and cannot be exported from the same module:
` + errors.map(
        ([clientExport, serverExport]) => `- ${clientExport} and ${serverExport}`
      ).join("\n")
    );
  }
}
function detectRouteChunks2(cache, id, code, isRootRouteModule) {
  function noRouteChunks() {
    return {
      chunkedExports: [],
      hasRouteChunks: false,
      hasRouteChunkByExportName: {
        clientAction: false,
        clientLoader: false,
        clientMiddleware: false,
        HydrateFallback: false
      }
    };
  }
  if (isRootRouteModule) {
    return noRouteChunks();
  }
  if (!Array.from(CLIENT_MODULE_CHUNKS).some(
    (exportName) => code.includes(exportName)
  )) {
    return noRouteChunks();
  }
  let [filename] = id.split("?");
  return detectRouteChunks(code, cache, filename);
}
function validateRouteChunks({
  id,
  valid
}) {
  let invalidChunks = Object.entries(valid).filter(([_, isValid]) => !isValid).map(([chunkName]) => chunkName);
  if (invalidChunks.length === 0) {
    return;
  }
  let plural = invalidChunks.length > 1;
  throw new Error(
    [
      `Error splitting route module: ${id}`,
      invalidChunks.map((name) => `- ${name}`).join("\n"),
      `${plural ? "These exports" : "This export"} could not be split into ${plural ? "their own chunks" : "its own chunk"} because ${plural ? "they share" : "it shares"} code with other exports. You should extract any shared code into its own module and then import it within the route module.`
    ].join("\n\n")
  );
}

// vite/rsc/plugin.ts
var redirectStatusCodes = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
var configLoaderPromise;
var typegenWatcherPromise;
function reactRouterRSCVitePlugin() {
  let runningWithinTheReactRouterMonoRepo = Boolean(
    arguments && arguments.length === 1 && typeof arguments[0] === "object" && arguments[0] && "__runningWithinTheReactRouterMonoRepo" in arguments[0] && arguments[0].__runningWithinTheReactRouterMonoRepo === true
  );
  let configLoader;
  let viteCommand;
  let resolvedViteConfig;
  let routeIdByFile;
  let logger;
  let entries;
  let config;
  let rootRouteFile;
  function updateConfig(newConfig) {
    config = newConfig;
    rootRouteFile = Path.resolve(
      newConfig.appDirectory,
      newConfig.routes.root.file
    );
  }
  function isRootRouteModule(id) {
    return path2.normalize(id) === path2.normalize(rootRouteFile);
  }
  function getRouteIdForFile(file) {
    let normalizedFile = path2.normalize(file);
    let directMatch = routeIdByFile?.get(normalizedFile);
    if (directMatch) {
      return directMatch;
    }
    return Array.from(routeIdByFile ?? []).find(
      ([routeFile]) => path2.normalize(routeFile).endsWith(normalizedFile)
    )?.[1];
  }
  function getTransformLanguage(filename) {
    let extension = path2.extname(filename).toLowerCase();
    switch (extension) {
      case ".ts":
      case ".cts":
      case ".mts":
        return "ts";
      case ".tsx":
        return "tsx";
      case ".js":
      case ".cjs":
      case ".mjs":
      case ".jsx":
      case ".md":
      case ".mdx":
        return "jsx";
      default:
        return void 0;
    }
  }
  async function transformToJs(code, filename) {
    await preloadVite();
    let vite = getVite();
    let lang = getTransformLanguage(filename);
    return ("transformWithOxc" in vite && typeof vite.transformWithOxc === "function" ? await vite.transformWithOxc(code, filename, {
      lang,
      jsx: {
        runtime: "automatic",
        development: viteCommand !== "build",
        target: "esnext"
      }
    }) : await vite.transformWithEsbuild(code, filename, {
      loader: lang,
      target: "esnext",
      format: "esm",
      jsx: "automatic",
      jsxDev: viteCommand !== "build"
    })).code;
  }
  return [
    {
      name: "react-router/rsc",
      async config(viteUserConfig, { command, mode }) {
        await initEsModuleLexer2;
        await preloadVite();
        viteCommand = command;
        const rootDirectory = getRootDirectory(viteUserConfig);
        const watch2 = command === "serve" && process.env.IS_RR_BUILD_REQUEST !== "yes";
        await loadDotenv({
          rootDirectory,
          viteUserConfig,
          mode
        });
        configLoaderPromise ??= createConfigLoader({
          rootDirectory,
          mode,
          watch: watch2,
          validateConfig: (userConfig) => {
            let errors = [];
            if (userConfig.buildEnd) errors.push("buildEnd");
            if (userConfig.presets?.length) errors.push("presets");
            if (userConfig.serverBundles) errors.push("serverBundles");
            if (userConfig.future?.v8_middleware === false)
              errors.push("future.v8_middleware: false");
            if (userConfig.future?.v8_viteEnvironmentApi === false)
              errors.push("future.v8_viteEnvironmentApi: false");
            if (userConfig.subResourceIntegrity)
              errors.push("subResourceIntegrity");
            if (errors.length) {
              return `RSC Framework Mode does not currently support the following React Router config:
${errors.map((x) => ` - ${x}`).join("\n")}
`;
            }
          }
        });
        configLoader = await configLoaderPromise;
        const configResult = await configLoader.getConfig();
        if (!configResult.ok) throw new Error(configResult.error);
        updateConfig(configResult.value);
        if (viteUserConfig.base && config.basename !== "/" && viteCommand === "serve" && !viteUserConfig.server?.middlewareMode && !config.basename.startsWith(viteUserConfig.base)) {
          throw new Error(
            "When using the React Router `basename` and the Vite `base` config, the `basename` config must begin with `base` for the default Vite dev server."
          );
        }
        const vite = await import("vite");
        logger = vite.createLogger(viteUserConfig.logLevel, {
          prefix: "[react-router]"
        });
        entries = await resolveRSCEntryFiles({
          reactRouterConfig: config
        });
        let viteNormalizePath = (await import("vite")).normalizePath;
        return {
          resolve: {
            dedupe: [
              // https://react.dev/warnings/invalid-hook-call-warning#duplicate-react
              "react",
              "react/jsx-runtime",
              "react/jsx-dev-runtime",
              "react-dom",
              "react-dom/client",
              // Avoid router duplicates since mismatching routers cause `Error:
              // You must render this element inside a <Remix> element`.
              "react-router",
              "react-router/dom",
              "react-router/internal/react-server-client",
              ...hasDependency({ name: "react-router-dom", rootDirectory }) ? ["react-router-dom"] : [],
              ...hasDependency({
                name: "react-server-dom-webpack",
                rootDirectory
              }) ? ["react-server-dom-webpack"] : []
            ]
          },
          optimizeDeps: {
            entries: getOptimizeDepsEntries({
              entryClientFilePath: entries.client,
              reactRouterConfig: config
            }),
            ...defineOptimizeDepsCompilerOptions({
              rolldown: {
                transform: {
                  jsx: "react-jsx"
                }
              },
              esbuild: {
                jsx: "automatic"
              }
            }),
            include: [
              // Pre-bundle React dependencies to avoid React duplicates,
              // even if React dependencies are not direct dependencies.
              // https://react.dev/warnings/invalid-hook-call-warning#duplicate-react
              "react",
              "react/jsx-runtime",
              "react/jsx-dev-runtime",
              "react-dom",
              ...hasDependency({
                name: "react-server-dom-webpack",
                rootDirectory
              }) ? ["react-server-dom-webpack"] : [],
              ...runningWithinTheReactRouterMonoRepo ? [] : [
                "react-router",
                "react-router/dom",
                "react-router/internal/react-server-client"
              ],
              "react-router > cookie",
              "react-router > set-cookie-parser"
            ]
          },
          ...defineCompilerOptions({
            oxc: {
              jsx: {
                runtime: "automatic",
                development: viteCommand !== "build"
              }
            },
            esbuild: {
              jsx: "automatic",
              jsxDev: viteCommand !== "build"
            }
          }),
          environments: {
            client: {
              build: {
                rollupOptions: {
                  input: {
                    index: entries.client
                  },
                  output: {
                    manualChunks(id) {
                      const normalized = viteNormalizePath(id);
                      if (normalized.includes("node_modules/react/") || normalized.includes("node_modules/react-dom/") || normalized.includes(
                        "node_modules/react-server-dom-webpack/"
                      ) || normalized.includes("node_modules/@vitejs/plugin-rsc/")) {
                        return "react";
                      }
                      if (normalized.includes("node_modules/react-router/")) {
                        return "router";
                      }
                    }
                  }
                },
                outDir: join(config.buildDirectory, "client")
              }
            },
            rsc: {
              build: {
                rollupOptions: {
                  input: {
                    index: entries.rsc
                  },
                  output: {
                    entryFileNames: config.serverBuildFile,
                    format: config.serverModuleFormat
                  }
                },
                outDir: join(config.buildDirectory, "server")
              },
              resolve: {
                noExternal: [
                  "@react-router/dev/config/default-rsc-entries/entry.ssr"
                ]
              }
            },
            ssr: {
              build: {
                rollupOptions: {
                  input: {
                    index: entries.ssr
                  },
                  output: {
                    // Note: We don't set `entryFileNames` here because it's
                    // considered private to the RSC environment build, and
                    // @vitejs/plugin-rsc currently breaks if it's set to
                    // something other than `index.js`.
                    format: config.serverModuleFormat
                  }
                },
                outDir: join(config.buildDirectory, "server/__ssr_build")
              },
              resolve: {
                noExternal: [
                  "@react-router/dev/config/default-rsc-entries/entry.rsc"
                ]
              }
            }
          }
        };
      },
      configResolved(viteConfig) {
        resolvedViteConfig = viteConfig;
      },
      async configureServer(viteDevServer) {
        configLoader.onChange(
          async ({
            result,
            configCodeChanged,
            routeConfigCodeChanged,
            configChanged,
            routeConfigChanged
          }) => {
            if (!result.ok) {
              invalidateVirtualModules(viteDevServer);
              logger.error(result.error, {
                clear: true,
                timestamp: true
              });
              return;
            }
            let message = configChanged ? "Config changed." : routeConfigChanged ? "Route config changed." : configCodeChanged ? "Config saved." : routeConfigCodeChanged ? " Route config saved." : "Config saved";
            logger.info(colors.green(message), {
              clear: true,
              timestamp: true
            });
            updateConfig(result.value);
            if (configChanged || routeConfigChanged) {
              invalidateVirtualModules(viteDevServer);
            }
          }
        );
      },
      configurePreviewServer(previewServer) {
        const clientBuildDirectory = getClientBuildDirectory(config);
        if ((config.prerender || config.ssr === false) && process.env.IS_RR_BUILD_REQUEST !== "yes") {
          previewServer.middlewares.use(async (req, res, next) => {
            try {
              const htmlFileBase = ((req.url || "/") + (req.url?.endsWith("/") ? "" : "/") + "index.html").slice(1);
              const htmlFilePath = path2.join(
                clientBuildDirectory,
                htmlFileBase
              );
              if (existsSync(htmlFilePath)) {
                res.setHeader("Content-Type", "text/html");
                res.end(await readFile(htmlFilePath, "utf-8"));
                return;
              }
              next();
            } catch (error) {
              next(error);
            }
          });
          return () => {
            if (config.ssr === false) {
              previewServer.middlewares.use(async (req, res, next) => {
                try {
                  res.statusCode = 404;
                  const url = new URL(req.url || "/", `http://localhost`);
                  const htmlFilePath = path2.join(
                    clientBuildDirectory,
                    url.pathname.endsWith(".rsc") ? "__spa-fallback.rsc" : "__spa-fallback.html"
                  );
                  if (existsSync(htmlFilePath)) {
                    res.setHeader("Content-Type", "text/html");
                    res.end(await readFile(htmlFilePath, "utf-8"));
                    return;
                  }
                  res.end();
                } catch (error) {
                  next(error);
                }
              });
            }
          };
        }
      },
      async buildEnd() {
        await configLoader.close();
      }
    },
    /* @__PURE__ */ (() => {
      let logged = false;
      function logExperimentalNotice() {
        if (logged) return;
        logged = true;
        logger.info(
          colors.yellow(
            `${viteCommand === "serve" ? "  " : ""}\u{1F9EA} Using React Router's RSC Framework Mode (experimental)`
          )
        );
      }
      return {
        name: "react-router/rsc/log-experimental-notice",
        sharedDuringBuild: true,
        buildStart: logExperimentalNotice,
        configureServer: logExperimentalNotice
      };
    })(),
    process.env.IS_RR_BUILD_REQUEST !== "yes" ? {
      name: "react-router/rsc/typegen",
      async config(viteUserConfig, { command, mode }) {
        if (command === "serve") {
          const vite = await import("vite");
          typegenWatcherPromise ??= watch(
            getRootDirectory(viteUserConfig),
            {
              mode,
              rsc: true,
              // ignore `info` logs from typegen since they are
              // redundant when Vite plugin logs are active
              logger: vite.createLogger("warn", {
                prefix: "[react-router]"
              })
            }
          );
        }
      },
      async buildEnd() {
        (await typegenWatcherPromise)?.close();
      }
    } : null,
    {
      name: "react-router/rsc/virtual-route-config",
      resolveId(id) {
        if (id === virtual.routeConfig.id) {
          return virtual.routeConfig.resolvedId;
        }
      },
      load(id) {
        if (id === virtual.routeConfig.resolvedId) {
          const result = createVirtualRouteConfig({
            appDirectory: config.appDirectory,
            routeConfig: config.unstable_routeConfig
          });
          routeIdByFile = result.routeIdByFile;
          return result.code;
        }
      }
    },
    virtualRouteModulesPlugin({
      environments: {
        client: ["client", "ssr"],
        server: ["rsc"]
      },
      getRouteIdForFile,
      isRootRouteModule,
      transformToJs,
      enforceSplitRouteModules: () => config.future.v8_splitRouteModules === "enforce"
    }),
    {
      name: "react-router/rsc/virtual-basename",
      resolveId(id) {
        if (id === virtual.basename.id) {
          return virtual.basename.resolvedId;
        }
      },
      load(id) {
        if (id === virtual.basename.resolvedId) {
          return `export default ${JSON.stringify(config.basename)};`;
        }
      }
    },
    {
      name: "react-router/rsc/virtual-route-discovery",
      resolveId(id) {
        if (id === virtual.routeDiscovery.id) {
          return virtual.routeDiscovery.resolvedId;
        }
      },
      load(id) {
        if (id === virtual.routeDiscovery.resolvedId) {
          return `export default ${JSON.stringify(
            config.ssr === false ? {
              mode: "initial"
            } : config.routeDiscovery ?? { mode: "lazy" }
          )};`;
        }
      }
    },
    {
      name: "react-router/rsc/hmr/inject-runtime",
      enforce: "pre",
      resolveId(id) {
        if (id === virtual.injectHmrRuntime.id) {
          return virtual.injectHmrRuntime.resolvedId;
        }
      },
      async load(id) {
        if (id !== virtual.injectHmrRuntime.resolvedId) return;
        return viteCommand === "serve" ? [
          `if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.on('rsc:update', () => {
    // Defer revalidation to the next animation frame so React Fast Refresh
    // can apply pending client component updates first. Without this delay,
    // the RSC payload (showing updated text) can arrive and be reconciled
    // against a DOM that still has the old text, causing a hydration mismatch.
    requestAnimationFrame(() => {
      __reactRouterDataRouter.revalidate()
    });
  })
}`
        ].join("\n") : "";
      }
    },
    {
      name: "react-router/rsc/virtual-react-router-serve-config",
      resolveId(id) {
        if (id === virtual.reactRouterServeConfig.id) {
          return virtual.reactRouterServeConfig.resolvedId;
        }
      },
      load(id) {
        if (id === virtual.reactRouterServeConfig.resolvedId) {
          const rscOutDir = resolvedViteConfig.environments.rsc?.build?.outDir;
          invariant(rscOutDir, "RSC build directory config not found");
          const clientOutDir = resolvedViteConfig.environments.client?.build?.outDir;
          invariant(clientOutDir, "Client build directory config not found");
          const assetsBuildDirectory = Path.relative(rscOutDir, clientOutDir);
          const publicPath = resolvedViteConfig.base;
          return `export default ${JSON.stringify({
            assetsBuildDirectory,
            publicPath
          })};`;
        }
      }
    },
    validatePluginOrder(),
    warnOnClientSourceMaps(),
    prerender({
      config() {
        return {
          buildDirectory: getClientBuildDirectory(config),
          concurrency: getPrerenderConcurrencyConfig(config)
        };
      },
      logFile: (path3) => logger.info(`Prerendered ${colors.bold(path3)}`),
      async requests() {
        const prerenderPaths = new Set(
          await getPrerenderPaths(
            config.prerender,
            config.ssr,
            config.routes,
            true
          )
        );
        let basename = !config.basename || config.basename === "/" ? "/" : config.basename.endsWith("/") ? config.basename : config.basename + "/";
        if (config.ssr === false) {
          prerenderPaths.add("/__spa-fallback.html");
        }
        return Array.from(prerenderPaths).map(
          (prerenderPath) => `http://localhost${basename}${prerenderPath.slice(1)}`
        );
      },
      async postProcess(request, response, metadata) {
        let url = new URL(request.url);
        let isRedirect = redirectStatusCodes.has(response.status);
        if (!isRedirect && response.status !== 200 && response.status !== 202 && !(url.pathname === "/__spa-fallback.html" && response.status === 404)) {
          throw new Error(
            `Prerender (data): Received a ${response.status} status code from \`entry.server.tsx\` while prerendering the \`${url.pathname}\` path.
${url.pathname}`,
            { cause: response }
          );
        }
        if (metadata?.manifest) {
          return [
            {
              path: url.pathname,
              contents: await response.text()
            }
          ];
        }
        let isHtml = response.headers.get("content-type")?.includes("text/html");
        let htmlResponse = isHtml ? isRedirect ? response : response.clone() : null;
        let location = response.headers.get("Location");
        let delay = response.status === 302 ? 2 : 0;
        let redirectBody = isRedirect ? `<!doctype html>
<head>
<title>Redirecting to: ${location}</title>
<meta http-equiv="refresh" content="${delay};url=${location}">
<meta name="robots" content="noindex">
</head>
<body>
	<a href="${location}">
  Redirecting from <code>${url.pathname}</code> to <code>${location}</code>
</a>
</body>
</html>` : "";
        let files = [
          {
            path: isHtml || redirectBody ? url.pathname === "/__spa-fallback.html" ? "__spa-fallback.html" : (url.pathname.endsWith("/") ? url.pathname : url.pathname + "/") + "index.html" : url.pathname,
            contents: redirectBody || (isHtml ? await response.text() : new Uint8Array(await response.arrayBuffer()))
          }
        ];
        if (htmlResponse) {
          let body = await htmlResponse.text();
          let matches = Array.from(
            body.matchAll(
              /<script>\(self\.__FLIGHT_DATA\|\|=\[\]\)\.push\(("(?:[^"\\]|\\.)*")\)<\/script>/gim
            )
          );
          if (matches.length) {
            let rscData = "";
            for (const match of matches) {
              rscData += JSON.parse(match[1]);
            }
            files.push({
              path: url.pathname === "/" ? "_.rsc" : (url.pathname === "/__spa-fallback.html" ? "__spa-fallback" : url.pathname) + ".rsc",
              contents: rscData
            });
          }
        } else if (!url.pathname.endsWith(".rsc")) {
          let dataUrl = new URL(url);
          dataUrl.pathname += ".rsc";
          return {
            files,
            requests: [dataUrl.href]
          };
        }
        return files;
      }
    })
  ];
}
var virtual = {
  routeConfig: create("unstable_rsc/routes"),
  routeDiscovery: create("unstable_rsc/route-discovery"),
  injectHmrRuntime: create("unstable_rsc/inject-hmr-runtime"),
  basename: create("unstable_rsc/basename"),
  reactRouterServeConfig: create("unstable_rsc/react-router-serve-config")
};
function invalidateVirtualModules(viteDevServer) {
  for (const vmod of Object.values(virtual)) {
    for (const env of Object.values(viteDevServer.environments)) {
      const mod = env.moduleGraph.getModuleById(vmod.resolvedId);
      if (mod) {
        env.moduleGraph.invalidateModule(mod);
      }
    }
  }
}
function getRootDirectory(viteUserConfig) {
  return viteUserConfig.root ?? process.env.REACT_ROUTER_ROOT ?? process.cwd();
}
var getClientBuildDirectory = (reactRouterConfig) => path2.join(reactRouterConfig.buildDirectory, "client");
function getPrerenderConcurrencyConfig(reactRouterConfig) {
  let concurrency = 1;
  let { prerender: prerender2 } = reactRouterConfig;
  if (typeof prerender2 === "object" && "concurrency" in prerender2) {
    concurrency = prerender2.concurrency ?? 1;
  }
  return concurrency;
}
export {
  reactRouterVitePlugin as reactRouter,
  reactRouterRSCVitePlugin as unstable_reactRouterRSC
};
