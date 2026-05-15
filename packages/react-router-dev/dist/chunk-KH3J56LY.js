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
  configRoutesToRouteManifest,
  setAppDirectory,
  validateRouteConfig
} from "./chunk-ZZD5RYKL.js";
import {
  getVite,
  isReactRouterRepo,
  preloadVite
} from "./chunk-A5MD2G7J.js";

// config/config.ts
import fs from "fs";
import { execSync } from "child_process";
import { createRequire } from "module";

// vite/ssr-externals.ts
var ssrExternals = isReactRouterRepo() ? [
  // This is only needed within this repo because these packages
  // are linked to a directory outside of node_modules so Vite
  // treats them as internal code by default.
  "react-router",
  "react-router-dom",
  "@react-router/architect",
  "@react-router/cloudflare",
  "@react-router/dev",
  "@react-router/express",
  "@react-router/node",
  "@react-router/serve"
] : void 0;

// vite/vite-node.ts
async function createContext({
  root,
  mode,
  customLogger
}) {
  await preloadVite();
  const vite = getVite();
  const [{ ViteNodeServer }, { ViteNodeRunner }, { installSourcemapsSupport }] = await Promise.all([
    import("vite-node/server"),
    import("vite-node/client"),
    import("vite-node/source-map")
  ]);
  const devServer = await vite.createServer({
    root,
    mode,
    customLogger,
    server: {
      preTransformRequests: false,
      hmr: false,
      watch: null
    },
    ssr: {
      external: ssrExternals
    },
    optimizeDeps: {
      noDiscovery: true
    },
    css: {
      // This empty PostCSS config object prevents the PostCSS config file from
      // being loaded. We don't need it in a React Router config context, and
      // there's also an issue in Vite 5 when using a .ts PostCSS config file in
      // an ESM project: https://github.com/vitejs/vite/issues/15869. Consumers
      // can work around this in their own Vite config file, but they can't
      // configure this internal usage of vite-node.
      postcss: {}
    },
    configFile: false,
    envFile: false,
    plugins: []
  });
  await devServer.pluginContainer.buildStart({});
  const server = new ViteNodeServer(devServer);
  installSourcemapsSupport({
    getSourceMap: (source) => server.getSourceMap(source)
  });
  const runner = new ViteNodeRunner({
    root: devServer.config.root,
    base: devServer.config.base,
    fetchModule(id) {
      return server.fetchModule(id);
    },
    resolveId(id, importer) {
      return server.resolveId(id, importer);
    }
  });
  return { devServer, server, runner };
}

// config/config.ts
import Path from "pathe";
import chokidar from "chokidar";
import colors from "picocolors";
import pick from "lodash/pick.js";
import omit from "lodash/omit.js";
import cloneDeep from "lodash/cloneDeep.js";
import isEqual from "lodash/isEqual.js";

// cli/detectPackageManager.ts
var detectPackageManager = () => {
  let { npm_config_user_agent } = process.env;
  if (!npm_config_user_agent) return void 0;
  try {
    let pkgManager = npm_config_user_agent.split("/")[0];
    if (pkgManager === "npm") return "npm";
    if (pkgManager === "pnpm") return "pnpm";
    if (pkgManager === "yarn") return "yarn";
    if (pkgManager === "bun") return "bun";
    return void 0;
  } catch {
    return void 0;
  }
};

// config/config.ts
var nodeRequire = createRequire(import.meta.url);
var excludedConfigPresetKeys = ["presets"];
var branchRouteProperties = [
  "id",
  "path",
  "file",
  "index"
];
var configRouteToBranchRoute = (configRoute) => pick(configRoute, branchRouteProperties);
var mergeReactRouterConfig = (...configs) => {
  let reducer = (configA, configB) => {
    let mergeRequired = (key) => configA[key] !== void 0 && configB[key] !== void 0;
    return {
      ...configA,
      ...configB,
      ...mergeRequired("buildEnd") ? {
        buildEnd: async (...args) => {
          await Promise.all([
            configA.buildEnd?.(...args),
            configB.buildEnd?.(...args)
          ]);
        }
      } : {},
      ...mergeRequired("future") ? {
        future: {
          ...configA.future,
          ...configB.future
        }
      } : {},
      ...mergeRequired("presets") ? {
        presets: [...configA.presets ?? [], ...configB.presets ?? []]
      } : {}
    };
  };
  return configs.reduce(reducer, {});
};
var deepFreeze = (o) => {
  Object.freeze(o);
  let oIsFunction = typeof o === "function";
  let hasOwnProp = Object.prototype.hasOwnProperty;
  Object.getOwnPropertyNames(o).forEach(function(prop) {
    if (hasOwnProp.call(o, prop) && (oIsFunction ? prop !== "caller" && prop !== "callee" && prop !== "arguments" : true) && o[prop] !== null && (typeof o[prop] === "object" || typeof o[prop] === "function") && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop]);
    }
  });
  return o;
};
function ok(value) {
  return { ok: true, value };
}
function err(error) {
  return { ok: false, error };
}
async function resolveConfig({
  root,
  viteNodeContext,
  reactRouterConfigFile,
  skipRoutes,
  validateConfig
}) {
  let reactRouterUserConfig = {};
  if (reactRouterConfigFile) {
    try {
      if (!fs.existsSync(reactRouterConfigFile)) {
        return err(`${reactRouterConfigFile} no longer exists`);
      }
      let configModule = await viteNodeContext.runner.executeFile(
        reactRouterConfigFile
      );
      if (configModule.default === void 0) {
        return err(`${reactRouterConfigFile} must provide a default export`);
      }
      if (typeof configModule.default !== "object") {
        return err(`${reactRouterConfigFile} must export a config`);
      }
      reactRouterUserConfig = configModule.default;
      if (validateConfig) {
        const error = validateConfig(reactRouterUserConfig);
        if (error) {
          return err(error);
        }
      }
    } catch (error) {
      return err(`Error loading ${reactRouterConfigFile}: ${error}`);
    }
  }
  reactRouterUserConfig = deepFreeze(cloneDeep(reactRouterUserConfig));
  let presets = (await Promise.all(
    (reactRouterUserConfig.presets ?? []).map(async (preset) => {
      if (!preset.name) {
        throw new Error(
          "React Router presets must have a `name` property defined."
        );
      }
      if (!preset.reactRouterConfig) {
        return null;
      }
      let configPreset = omit(
        await preset.reactRouterConfig({ reactRouterUserConfig }),
        excludedConfigPresetKeys
      );
      return configPreset;
    })
  )).filter(function isNotNull(value) {
    return value !== null;
  });
  let defaults = {
    basename: "/",
    buildDirectory: "build",
    serverBuildFile: "index.js",
    serverModuleFormat: "esm",
    ssr: true
  };
  let userAndPresetConfigs = mergeReactRouterConfig(
    ...presets,
    reactRouterUserConfig
  );
  let {
    appDirectory: userAppDirectory,
    basename,
    buildDirectory: userBuildDirectory,
    buildEnd,
    prerender,
    routeDiscovery: userRouteDiscovery,
    serverBuildFile,
    serverBundles,
    serverModuleFormat,
    ssr
  } = {
    ...defaults,
    // Default values should be completely overridden by user/preset config, not merged
    ...userAndPresetConfigs
  };
  if (!ssr && serverBundles) {
    serverBundles = void 0;
  }
  if (prerender) {
    let isValidPrerenderPathsConfig = (p) => typeof p === "boolean" || typeof p === "function" || Array.isArray(p);
    let isValidPrerenderConfig = isValidPrerenderPathsConfig(prerender) || typeof prerender === "object" && "paths" in prerender && isValidPrerenderPathsConfig(prerender.paths);
    if (!isValidPrerenderConfig) {
      return err(
        "The `prerender`/`prerender.paths` config must be a boolean, an array of string paths, or a function returning a boolean or array of string paths."
      );
    }
    if (typeof prerender === "object" && "unstable_concurrency" in prerender) {
      return err(
        "The `prerender.unstable_concurrency` config field has been stabilized as `prerender.concurrency`"
      );
    }
    let isValidConcurrencyConfig = typeof prerender != "object" || !("concurrency" in prerender) || typeof prerender.concurrency === "number" && Number.isInteger(prerender.concurrency) && prerender.concurrency > 0;
    if (!isValidConcurrencyConfig) {
      return err(
        "The `prerender.concurrency` config must be a positive integer if specified."
      );
    }
  }
  let routeDiscovery;
  if (userRouteDiscovery == null) {
    if (ssr) {
      routeDiscovery = {
        mode: "lazy",
        manifestPath: "/__manifest"
      };
    } else {
      routeDiscovery = { mode: "initial" };
    }
  } else if (userRouteDiscovery.mode === "initial") {
    routeDiscovery = userRouteDiscovery;
  } else if (userRouteDiscovery.mode === "lazy") {
    if (!ssr) {
      return err(
        'The `routeDiscovery.mode` config cannot be set to "lazy" when setting `ssr:false`'
      );
    }
    let { manifestPath } = userRouteDiscovery;
    if (manifestPath != null && !manifestPath.startsWith("/")) {
      return err(
        'The `routeDiscovery.manifestPath` config must be a root-relative pathname beginning with a slash (i.e., "/__manifest")'
      );
    }
    routeDiscovery = userRouteDiscovery;
  }
  let appDirectory = Path.resolve(root, userAppDirectory || "app");
  let buildDirectory = Path.resolve(root, userBuildDirectory);
  let rootRouteFile = findEntry(appDirectory, "root", { absolute: true });
  if (!rootRouteFile) {
    let rootRouteDisplayPath = Path.relative(
      root,
      Path.join(appDirectory, "root.tsx")
    );
    return err(
      `Could not find a root route module in the app directory as "${rootRouteDisplayPath}"`
    );
  }
  let routes;
  let routeConfig = [];
  if (skipRoutes) {
    routes = {};
  } else {
    let routeConfigFile = findEntry(appDirectory, "routes");
    try {
      if (!routeConfigFile) {
        let routeConfigDisplayPath = Path.relative(
          root,
          Path.join(appDirectory, "routes.ts")
        );
        return err(
          `Route config file not found at "${routeConfigDisplayPath}".`
        );
      }
      setAppDirectory(appDirectory);
      let routeConfigExport = (await viteNodeContext.runner.executeFile(
        Path.join(appDirectory, routeConfigFile)
      )).default;
      let result = validateRouteConfig({
        routeConfigFile,
        routeConfig: await routeConfigExport
      });
      if (!result.valid) {
        return err(result.message);
      }
      routeConfig = [
        {
          id: "root",
          path: "",
          file: Path.relative(appDirectory, rootRouteFile),
          children: result.routeConfig
        }
      ];
      routes = configRoutesToRouteManifest(appDirectory, routeConfig);
    } catch (error) {
      return err(
        [
          colors.red(`Route config in "${routeConfigFile}" is invalid.`),
          "",
          error.loc?.file && error.loc?.column && error.frame ? [
            Path.relative(appDirectory, error.loc.file) + ":" + error.loc.line + ":" + error.loc.column,
            error.frame.trim?.()
          ] : error.stack
        ].flat().join("\n")
      );
    }
  }
  let futureConfig = userAndPresetConfigs.future;
  if (futureConfig) {
    if ("unstable_splitRouteModules" in futureConfig) {
      return err(
        "The `future.unstable_splitRouteModules` flag has been stabilized as `future.v8_splitRouteModules`"
      );
    }
    if ("unstable_viteEnvironmentApi" in futureConfig) {
      return err(
        "The `future.unstable_viteEnvironmentApi` flag has been stabilized as `future.v8_viteEnvironmentApi`"
      );
    }
    if ("unstable_passThroughRequests" in futureConfig) {
      return err(
        "The `future.unstable_passThroughRequests` flag has been stabilized as `future.v8_passThroughRequests`"
      );
    }
    if ("unstable_subResourceIntegrity" in futureConfig) {
      return err(
        "The `future.unstable_subResourceIntegrity` flag has been stabilized and moved to a top-level `config.subResourceIntegrity` field"
      );
    }
  }
  let future = {
    unstable_optimizeDeps: userAndPresetConfigs.future?.unstable_optimizeDeps ?? false,
    v8_passThroughRequests: userAndPresetConfigs.future?.v8_passThroughRequests ?? false,
    unstable_trailingSlashAwareDataRequests: userAndPresetConfigs.future?.unstable_trailingSlashAwareDataRequests ?? false,
    unstable_previewServerPrerendering: userAndPresetConfigs.future?.unstable_previewServerPrerendering ?? false,
    v8_middleware: userAndPresetConfigs.future?.v8_middleware ?? false,
    v8_splitRouteModules: userAndPresetConfigs.future?.v8_splitRouteModules ?? false,
    v8_viteEnvironmentApi: (userAndPresetConfigs.future?.v8_viteEnvironmentApi || userAndPresetConfigs.future?.unstable_previewServerPrerendering) ?? false
  };
  let allowedActionOrigins = userAndPresetConfigs.allowedActionOrigins ?? false;
  let subResourceIntegrity = userAndPresetConfigs.subResourceIntegrity ?? false;
  let reactRouterConfig = deepFreeze({
    appDirectory,
    basename,
    buildDirectory,
    buildEnd,
    future,
    prerender,
    routes,
    routeDiscovery,
    serverBuildFile,
    serverBundles,
    serverModuleFormat,
    ssr,
    subResourceIntegrity,
    allowedActionOrigins,
    unstable_routeConfig: routeConfig
  });
  for (let preset of reactRouterUserConfig.presets ?? []) {
    await preset.reactRouterConfigResolved?.({ reactRouterConfig });
  }
  logFutureFlagWarnings(userAndPresetConfigs.future || {});
  return ok(reactRouterConfig);
}
function logFutureFlagWarning(flag, message) {
  console.log(
    colors.yellow(
      `  \u26A0\uFE0F  Future Flag Warning: ${message}
     You can use the \`future.${flag}\` flag to opt in early.
     -> https://reactrouter.com/upgrading/future-flags#${flag}`
    )
  );
}
function logFutureFlagWarnings(future) {
  if (future.v8_middleware === void 0) {
    logFutureFlagWarning(
      "v8_middleware",
      "Route middleware support is changing in React Router v8."
    );
  }
  if (future.v8_splitRouteModules === void 0) {
    logFutureFlagWarning(
      "v8_splitRouteModules",
      "Route module splitting behavior is changing in React Router v8."
    );
  }
  if (future.v8_viteEnvironmentApi === void 0) {
    logFutureFlagWarning(
      "v8_viteEnvironmentApi",
      "Vite Environment API usage is changing in React Router v8."
    );
  }
  if (future.v8_passThroughRequests === void 0) {
    logFutureFlagWarning(
      "v8_passThroughRequests",
      "Request handling behavior is changing in React Router v8."
    );
  }
}
async function createConfigLoader({
  rootDirectory: root,
  watch,
  mode,
  skipRoutes,
  validateConfig
}) {
  root = Path.normalize(root ?? process.env.REACT_ROUTER_ROOT ?? process.cwd());
  let vite = await import("vite");
  let viteNodeContext = await createContext({
    root,
    mode,
    // Filter out any info level logs from vite-node
    customLogger: vite.createLogger("warn", {
      prefix: "[react-router]"
    })
  });
  let reactRouterConfigFile;
  let updateReactRouterConfigFile = () => {
    reactRouterConfigFile = findEntry(root, "react-router.config", {
      absolute: true
    });
  };
  updateReactRouterConfigFile();
  let getConfig = () => resolveConfig({
    root,
    viteNodeContext,
    reactRouterConfigFile,
    skipRoutes,
    validateConfig
  });
  let appDirectory;
  let initialConfigResult = await getConfig();
  if (!initialConfigResult.ok) {
    throw new Error(initialConfigResult.error);
  }
  appDirectory = Path.normalize(initialConfigResult.value.appDirectory);
  let currentConfig = initialConfigResult.value;
  let fsWatcher;
  let changeHandlers = [];
  return {
    getConfig,
    onChange: (handler) => {
      if (!watch) {
        throw new Error(
          "onChange is not supported when watch mode is disabled"
        );
      }
      changeHandlers.push(handler);
      if (!fsWatcher) {
        fsWatcher = chokidar.watch([root, appDirectory], {
          ignoreInitial: true,
          ignored: (path) => isIgnoredByWatcher(path, { root, appDirectory })
        });
        fsWatcher.on("error", (error) => {
          let message = error instanceof Error ? error.message : String(error);
          console.warn(colors.yellow(`File watcher error: ${message}`));
        });
        fsWatcher.on("all", async (...args) => {
          let [event, rawFilepath] = args;
          let filepath = Path.normalize(rawFilepath);
          let fileAddedOrRemoved = event === "add" || event === "unlink";
          let appFileAddedOrRemoved = fileAddedOrRemoved && filepath.startsWith(Path.normalize(appDirectory));
          let rootRelativeFilepath = Path.relative(root, filepath);
          let configFileAddedOrRemoved = fileAddedOrRemoved && isEntryFile("react-router.config", rootRelativeFilepath);
          if (configFileAddedOrRemoved) {
            updateReactRouterConfigFile();
          }
          let moduleGraphChanged = configFileAddedOrRemoved || Boolean(
            viteNodeContext.devServer?.moduleGraph.getModuleById(filepath)
          );
          if (!moduleGraphChanged && !appFileAddedOrRemoved) {
            return;
          }
          viteNodeContext.devServer?.moduleGraph.invalidateAll();
          viteNodeContext.runner?.moduleCache.clear();
          let result = await getConfig();
          let prevAppDirectory = appDirectory;
          appDirectory = Path.normalize(
            (result.value ?? currentConfig).appDirectory
          );
          if (appDirectory !== prevAppDirectory) {
            fsWatcher.unwatch(prevAppDirectory);
            fsWatcher.add(appDirectory);
          }
          let configCodeChanged = configFileAddedOrRemoved || reactRouterConfigFile !== void 0 && isEntryFileDependency(
            viteNodeContext.devServer.moduleGraph,
            reactRouterConfigFile,
            filepath
          );
          let routeConfigFile = !skipRoutes ? findEntry(appDirectory, "routes", {
            absolute: true
          }) : void 0;
          let routeConfigCodeChanged = routeConfigFile !== void 0 && isEntryFileDependency(
            viteNodeContext.devServer.moduleGraph,
            routeConfigFile,
            filepath
          );
          let configChanged = result.ok && !isEqual(omitRoutes(currentConfig), omitRoutes(result.value));
          let routeConfigChanged = result.ok && !isEqual(currentConfig?.routes, result.value.routes);
          for (let handler2 of changeHandlers) {
            handler2({
              result,
              configCodeChanged,
              routeConfigCodeChanged,
              configChanged,
              routeConfigChanged,
              path: filepath,
              event
            });
          }
          if (result.ok) {
            currentConfig = result.value;
          }
        });
      }
      return () => {
        changeHandlers = changeHandlers.filter(
          (changeHandler) => changeHandler !== handler
        );
      };
    },
    close: async () => {
      changeHandlers = [];
      await viteNodeContext.devServer.close();
      await fsWatcher?.close();
    }
  };
}
async function loadConfig({
  rootDirectory,
  mode,
  skipRoutes
}) {
  let configLoader = await createConfigLoader({
    rootDirectory,
    mode,
    skipRoutes,
    watch: false
  });
  let config = await configLoader.getConfig();
  await configLoader.close();
  return config;
}
async function resolveEntryFiles({
  rootDirectory,
  reactRouterConfig
}) {
  let { appDirectory } = reactRouterConfig;
  let defaultsDirectory = Path.resolve(
    Path.dirname(nodeRequire.resolve("@react-router/dev/package.json")),
    "dist",
    "config",
    "defaults"
  );
  let userEntryClientFile = findEntry(appDirectory, "entry.client");
  let userEntryServerFile = findEntry(appDirectory, "entry.server");
  let entryServerFile;
  let entryClientFile = userEntryClientFile || "entry.client.tsx";
  if (userEntryServerFile) {
    entryServerFile = userEntryServerFile;
  } else {
    let packageJsonPath = findEntry(rootDirectory, "package", {
      extensions: [".json"],
      absolute: true,
      walkParents: true
    });
    if (!packageJsonPath) {
      throw new Error(
        `Could not find package.json in ${rootDirectory} or any of its parent directories. Please add a package.json, or provide a custom entry.server.tsx/jsx file in your app directory.`
      );
    }
    let { readPackageJSON, sortPackage, updatePackage } = await import("pkg-types");
    let packageJsonDirectory = Path.dirname(packageJsonPath);
    let pkgJson = await readPackageJSON(packageJsonDirectory);
    let deps = pkgJson.dependencies ?? {};
    if (!deps["@react-router/node"]) {
      throw new Error(
        `Could not determine server runtime. Please install @react-router/node, or provide a custom entry.server.tsx/jsx file in your app directory.`
      );
    }
    if (!deps["isbot"]) {
      console.log(
        "adding `isbot@5` to your package.json, you should commit this change"
      );
      await updatePackage(packageJsonPath, (pkg) => {
        pkg.dependencies ??= {};
        pkg.dependencies.isbot = "^5";
        sortPackage(pkg);
      });
      let packageManager = detectPackageManager() ?? "npm";
      execSync(`${packageManager} install`, {
        cwd: packageJsonDirectory,
        stdio: "inherit"
      });
    }
    entryServerFile = `entry.server.node.tsx`;
  }
  let entryClientFilePath = userEntryClientFile ? Path.resolve(reactRouterConfig.appDirectory, userEntryClientFile) : Path.resolve(defaultsDirectory, entryClientFile);
  let entryServerFilePath = userEntryServerFile ? Path.resolve(reactRouterConfig.appDirectory, userEntryServerFile) : Path.resolve(defaultsDirectory, entryServerFile);
  return { entryClientFilePath, entryServerFilePath };
}
async function resolveRSCEntryFiles({
  reactRouterConfig
}) {
  let { appDirectory } = reactRouterConfig;
  let defaultsDirectory = Path.resolve(
    Path.dirname(nodeRequire.resolve("@react-router/dev/package.json")),
    "dist",
    "config",
    "default-rsc-entries"
  );
  let userEntryClientFile = findEntry(appDirectory, "entry.client", {
    absolute: true
  });
  let userEntryRSCFile = findEntry(appDirectory, "entry.rsc", {
    absolute: true
  });
  let userEntrySSRFile = findEntry(appDirectory, "entry.ssr", {
    absolute: true
  });
  let client = userEntryClientFile ?? Path.join(defaultsDirectory, "entry.client.tsx");
  let rsc = userEntryRSCFile ?? Path.join(defaultsDirectory, "entry.rsc.tsx");
  let ssr = userEntrySSRFile ?? Path.join(defaultsDirectory, "entry.ssr.tsx");
  return { client, rsc, ssr };
}
function omitRoutes(config) {
  return {
    ...config,
    routes: {}
  };
}
var entryExts = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".mts"];
function isEntryFile(entryBasename, filename) {
  return entryExts.some((ext) => filename === `${entryBasename}${ext}`);
}
function findEntry(dir, basename, options) {
  let currentDir = Path.resolve(dir);
  let { root } = Path.parse(currentDir);
  while (true) {
    for (let ext of options?.extensions ?? entryExts) {
      let file = Path.resolve(currentDir, basename + ext);
      if (fs.existsSync(file)) {
        return options?.absolute ?? false ? file : Path.relative(dir, file);
      }
    }
    if (!options?.walkParents) {
      return void 0;
    }
    let parentDir = Path.dirname(currentDir);
    if (currentDir === root || parentDir === currentDir) {
      return void 0;
    }
    currentDir = parentDir;
  }
}
function isEntryFileDependency(moduleGraph, entryFilepath, filepath, visited = /* @__PURE__ */ new Set()) {
  entryFilepath = Path.normalize(entryFilepath);
  filepath = Path.normalize(filepath);
  if (visited.has(filepath)) {
    return false;
  }
  visited.add(filepath);
  if (filepath === entryFilepath) {
    return true;
  }
  let mod = moduleGraph.getModuleById(filepath);
  if (!mod) {
    return false;
  }
  for (let importer of mod.importers) {
    if (!importer.id) {
      continue;
    }
    if (importer.id === entryFilepath || isEntryFileDependency(moduleGraph, entryFilepath, importer.id, visited)) {
      return true;
    }
  }
  return false;
}
function isIgnoredByWatcher(path, { root, appDirectory }) {
  let dirname = Path.dirname(path);
  let ignoredByPath = !dirname.startsWith(appDirectory) && // Ensure we're only watching files outside of the app directory
  // that are at the root level, not nested in subdirectories
  path !== root && // Watch the root directory itself
  dirname !== root;
  if (ignoredByPath) {
    return true;
  }
  try {
    let stat = fs.statSync(path, { throwIfNoEntry: false });
    if (stat && !stat.isFile() && !stat.isDirectory()) {
      return true;
    }
  } catch {
    return true;
  }
  return false;
}

export {
  ssrExternals,
  configRouteToBranchRoute,
  createConfigLoader,
  loadConfig,
  resolveEntryFiles,
  resolveRSCEntryFiles
};
