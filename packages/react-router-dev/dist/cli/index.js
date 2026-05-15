#!/usr/bin/env node
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
  hasReactRouterRscPlugin
} from "../chunk-IJVXTQZB.js";
import {
  run,
  watch
} from "../chunk-45PASRDH.js";
import {
  loadConfig
} from "../chunk-KH3J56LY.js";
import "../chunk-ZZD5RYKL.js";
import {
  start,
  stop
} from "../chunk-5TY6XQ2H.js";
import {
  getVite,
  preloadVite
} from "../chunk-A5MD2G7J.js";
import "../chunk-QI2ZSS2B.js";

// cli/run.ts
import arg from "arg";
import semver from "semver";
import colors2 from "picocolors";

// cli/commands.ts
import { existsSync } from "fs";
import { readFile, writeFile, copyFile } from "fs/promises";
import { createRequire } from "module";
import * as path from "path";
import exitHook from "exit-hook";
import colors from "picocolors";
import "react-router";

// config/format.ts
function formatRoutes(routeManifest, format) {
  switch (format) {
    case "json":
      return formatRoutesAsJson(routeManifest);
    case "jsx":
      return formatRoutesAsJsx(routeManifest);
  }
}
function formatRoutesAsJson(routeManifest) {
  function handleRoutesRecursive(parentId) {
    let routes2 = Object.values(routeManifest).filter(
      (route) => route.parentId === parentId
    );
    let children = [];
    for (let route of routes2) {
      children.push({
        id: route.id,
        index: route.index,
        path: route.path,
        caseSensitive: route.caseSensitive,
        file: route.file,
        children: handleRoutesRecursive(route.id)
      });
    }
    if (children.length > 0) {
      return children;
    }
    return void 0;
  }
  return JSON.stringify(handleRoutesRecursive() || null, null, 2);
}
function formatRoutesAsJsx(routeManifest) {
  let output = "<Routes>";
  function handleRoutesRecursive(parentId, level = 1) {
    let routes2 = Object.values(routeManifest).filter(
      (route) => route.parentId === parentId
    );
    let indent = Array(level * 2).fill(" ").join("");
    for (let route of routes2) {
      output += "\n" + indent;
      output += `<Route${route.path ? ` path=${JSON.stringify(route.path)}` : ""}${route.index ? " index" : ""}${route.file ? ` file=${JSON.stringify(route.file)}` : ""}>`;
      if (handleRoutesRecursive(route.id, level + 1)) {
        output += "\n" + indent;
        output += "</Route>";
      } else {
        output = output.slice(0, -1) + " />";
      }
    }
    return routes2.length > 0;
  }
  handleRoutesRecursive();
  output += "\n</Routes>";
  return output;
}

// cli/useJavascript.ts
import * as babel from "@babel/core";
import babelPluginSyntaxJSX from "@babel/plugin-syntax-jsx";
import babelPresetTypeScript from "@babel/preset-typescript";
import prettier from "prettier";
async function transpile(tsx, options = {}) {
  let mjs = babel.transformSync(tsx, {
    compact: false,
    cwd: options.cwd,
    filename: options.filename,
    plugins: [babelPluginSyntaxJSX],
    presets: [[babelPresetTypeScript, { jsx: "preserve" }]],
    retainLines: true
  });
  if (!mjs || !mjs.code) throw new Error("Could not parse TypeScript");
  return await prettier.format(mjs.code, { parser: "babel" });
}

// cli/commands.ts
var nodeRequire = createRequire(import.meta.url);
async function routes(rootDirectory, flags = {}) {
  rootDirectory = resolveRootDirectory(rootDirectory, flags);
  let configResult = await loadConfig({
    rootDirectory,
    mode: flags.mode ?? "production"
  });
  if (!configResult.ok) {
    console.error(colors.red(configResult.error));
    process.exit(1);
  }
  let format = flags.json ? "json" : "jsx";
  console.log(formatRoutes(configResult.value.routes, format));
}
async function build(root, options = {}) {
  root = resolveRootDirectory(root, options);
  let { build: build2 } = await import("../build-TMDMOLDG.js");
  if (options.profile) {
    await start();
  }
  try {
    await build2(root, options);
  } finally {
    await stop(console.info);
  }
}
async function dev(root, options = {}) {
  let { dev: dev2 } = await import("../dev-CLBDIMUE.js");
  if (options.profile) {
    await start();
  }
  exitHook(() => stop(console.info));
  root = resolveRootDirectory(root, options);
  await dev2(root, options);
  await new Promise(() => {
  });
}
var clientEntries = ["entry.client.tsx", "entry.client.js", "entry.client.jsx"];
var serverEntries = ["entry.server.tsx", "entry.server.js", "entry.server.jsx"];
var entries = ["entry.client", "entry.server"];
var rscEntries = ["entry.client", "entry.rsc", "entry.ssr"];
var conjunctionListFormat = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction"
});
async function generateEntry(entry, rootDirectory, flags = {}) {
  rootDirectory = resolveRootDirectory(rootDirectory, flags);
  let configDir = "defaults";
  let entriesToUse = entries;
  let isRsc = false;
  if (await hasReactRouterRscPlugin({
    root: rootDirectory,
    viteBuildOptions: {
      config: flags.config,
      mode: flags.mode
    }
  })) {
    if (!entry) {
      await generateEntry("entry.client", rootDirectory, flags);
      await generateEntry("entry.rsc", rootDirectory, flags);
      await generateEntry("entry.ssr", rootDirectory, flags);
      return;
    }
    configDir = "default-rsc-entries";
    entriesToUse = rscEntries;
    isRsc = true;
  }
  if (!entry) {
    await generateEntry("entry.client", rootDirectory, flags);
    await generateEntry("entry.server", rootDirectory, flags);
    return;
  }
  let configResult = await loadConfig({
    rootDirectory,
    mode: flags.mode ?? "production"
  });
  if (!configResult.ok) {
    console.error(colors.red(configResult.error));
    return;
  }
  let appDirectory = configResult.value.appDirectory;
  if (!entriesToUse.includes(entry)) {
    let entriesArray = Array.from(entriesToUse);
    let list = conjunctionListFormat.format(entriesArray);
    console.error(
      colors.red(`Invalid entry file. Valid entry files are ${list}`)
    );
    return;
  }
  let defaultsDirectory = path.resolve(
    path.dirname(nodeRequire.resolve("@react-router/dev/package.json")),
    "dist",
    "config",
    configDir
  );
  let outputFile;
  if (isRsc) {
    let defaultEntry = path.resolve(defaultsDirectory, `${entry}.tsx`);
    outputFile = path.resolve(appDirectory, `${entry}.tsx`);
    if (existsSync(outputFile)) {
      let relative2 = path.relative(rootDirectory, outputFile);
      console.error(colors.red(`Entry file ${relative2} already exists.`));
      return;
    }
    await copyFile(defaultEntry, outputFile);
  } else {
    let { readPackageJSON } = await import("pkg-types");
    let pkgJson = await readPackageJSON(rootDirectory);
    let deps = pkgJson.dependencies ?? {};
    if (!deps["@react-router/node"]) {
      console.error(colors.red(`No default server entry detected.`));
      return;
    }
    let defaultEntryClient = path.resolve(
      defaultsDirectory,
      "entry.client.tsx"
    );
    let defaultEntryServer = path.resolve(
      defaultsDirectory,
      `entry.server.node.tsx`
    );
    let isServerEntry = entry === "entry.server";
    let contents = isServerEntry ? await createServerEntry(rootDirectory, appDirectory, defaultEntryServer) : await createClientEntry(
      rootDirectory,
      appDirectory,
      defaultEntryClient
    );
    let useTypeScript = flags.typescript ?? true;
    let outputExtension = useTypeScript ? "tsx" : "jsx";
    let outputEntry = `${entry}.${outputExtension}`;
    outputFile = path.resolve(appDirectory, outputEntry);
    if (!useTypeScript) {
      let javascript = await transpile(contents, {
        cwd: rootDirectory,
        filename: isServerEntry ? defaultEntryServer : defaultEntryClient
      });
      await writeFile(outputFile, javascript, "utf-8");
    } else {
      await writeFile(outputFile, contents, "utf-8");
    }
  }
  console.log(
    colors.blue(
      `Entry file ${entry} created at ${path.relative(
        rootDirectory,
        outputFile
      )}.`
    )
  );
}
function resolveRootDirectory(root, flags) {
  if (root) {
    return path.resolve(root);
  }
  return process.env.REACT_ROUTER_ROOT || (flags?.config ? path.dirname(path.resolve(flags.config)) : process.cwd());
}
async function checkForEntry(rootDirectory, appDirectory, entries2) {
  for (let entry of entries2) {
    let entryPath = path.resolve(appDirectory, entry);
    let exists = existsSync(entryPath);
    if (exists) {
      let relative2 = path.relative(rootDirectory, entryPath);
      console.error(colors.red(`Entry file ${relative2} already exists.`));
      return process.exit(1);
    }
  }
}
async function createServerEntry(rootDirectory, appDirectory, inputFile) {
  await checkForEntry(rootDirectory, appDirectory, serverEntries);
  let contents = await readFile(inputFile, "utf-8");
  return contents;
}
async function createClientEntry(rootDirectory, appDirectory, inputFile) {
  await checkForEntry(rootDirectory, appDirectory, clientEntries);
  let contents = await readFile(inputFile, "utf-8");
  return contents;
}
async function typegen(root, flags) {
  root = resolveRootDirectory(root, flags);
  const rsc = await hasReactRouterRscPlugin({
    root,
    viteBuildOptions: {
      config: flags.config,
      mode: flags.mode
    }
  });
  if (flags.watch) {
    await preloadVite();
    const vite = getVite();
    const logger = vite.createLogger("info", { prefix: "[react-router]" });
    await watch(root, {
      mode: flags.mode ?? "development",
      rsc,
      logger
    });
    await new Promise(() => {
    });
    return;
  }
  await run(root, {
    mode: flags.mode ?? "production",
    rsc
  });
}

// cli/run.ts
import packageJson from "@react-router/dev/package.json" with { type: "json" };
var helpText = `
${colors2.blueBright("react-router")}

  ${colors2.underline("Usage")}:
    $ react-router build [${colors2.yellowBright("projectDir")}]
    $ react-router dev [${colors2.yellowBright("projectDir")}]
    $ react-router routes [${colors2.yellowBright("projectDir")}]

  ${colors2.underline("Options")}:
    --help, -h          Print this help message and exit
    --version, -v       Print the CLI version and exit
    --no-color          Disable ANSI colors in console output
  \`build\` Options:
    --assetsInlineLimit Static asset base64 inline threshold in bytes (default: 4096) (number)
    --clearScreen       Allow/disable clear screen when logging (boolean)
    --config, -c        Use specified config file (string)
    --emptyOutDir       Force empty outDir when it's outside of root (boolean)
    --logLevel, -l      Info | warn | error | silent (string)
    --minify            Enable/disable minification, or specify minifier to use (default: "esbuild") (boolean | "terser" | "esbuild")
    --mode, -m          Set env mode (string)
    --profile           Start built-in Node.js inspector
    --sourcemapClient   Output source maps for client build (default: false) (boolean | "inline" | "hidden")
    --sourcemapServer   Output source maps for server build (default: false) (boolean | "inline" | "hidden")
  \`dev\` Options:
    --clearScreen       Allow/disable clear screen when logging (boolean)
    --config, -c        Use specified config file (string)
    --cors              Enable CORS (boolean)
    --force             Force the optimizer to ignore the cache and re-bundle (boolean)
    --host              Specify hostname (string)
    --logLevel, -l      Info | warn | error | silent (string)
    --mode, -m          Set env mode (string)
    --open              Open browser on startup (boolean | string)
    --port              Specify port (number)
    --profile           Start built-in Node.js inspector
    --strictPort        Exit if specified port is already in use (boolean)
  \`routes\` Options:
    --config, -c        Use specified Vite config file (string)
    --json              Print the routes as JSON
  \`reveal\` Options:
    --config, -c        Use specified Vite config file (string)
    --no-typescript     Generate plain JavaScript files
  \`typegen\` Options:
    --watch             Automatically regenerate types whenever route config (\`routes.ts\`) or route modules change

  ${colors2.underline("Build your project")}:

    $ react-router build

  ${colors2.underline("Run your project locally in development")}:

    $ react-router dev

  ${colors2.underline("Show all routes in your app")}:

    $ react-router routes
    $ react-router routes my-app
    $ react-router routes --json
    $ react-router routes --config vite.react-router.config.ts

  ${colors2.underline("Reveal the used entry point")}:

    $ react-router reveal entry.client
    $ react-router reveal entry.server
    $ react-router reveal entry.client --no-typescript
    $ react-router reveal entry.server --no-typescript
    $ react-router reveal entry.server --config vite.react-router.config.ts

  ${colors2.underline("Generate types for route modules")}:

   $ react-router typegen
   $ react-router typegen --watch
`;
async function run2(argv = process.argv.slice(2), { isMain = false } = {}) {
  let versions = process.versions;
  let MINIMUM_NODE_VERSION = "22.12.0";
  if (versions && versions.node && semver.lt(versions.node, MINIMUM_NODE_VERSION)) {
    console.warn(
      `\uFE0F\u26A0\uFE0F Oops, Node v${versions.node} detected. react-router requires a Node version greater than ${MINIMUM_NODE_VERSION}.`
    );
  }
  let isBooleanFlag = (arg2) => {
    let index = argv.indexOf(arg2);
    let nextArg = argv[index + 1];
    return !nextArg || nextArg.startsWith("-");
  };
  let args = arg(
    {
      "--force": Boolean,
      "--help": Boolean,
      "-h": "--help",
      "--json": Boolean,
      "--token": String,
      "--typescript": Boolean,
      "--no-typescript": Boolean,
      "--version": Boolean,
      "-v": "--version",
      "--port": Number,
      "-p": "--port",
      "--config": String,
      "-c": "--config",
      "--assetsInlineLimit": Number,
      "--clearScreen": Boolean,
      "--cors": Boolean,
      "--emptyOutDir": Boolean,
      "--host": isBooleanFlag("--host") ? Boolean : String,
      "--logLevel": String,
      "-l": "--logLevel",
      "--minify": String,
      "--mode": String,
      "-m": "--mode",
      "--open": isBooleanFlag("--open") ? Boolean : String,
      "--strictPort": Boolean,
      "--profile": Boolean,
      "--sourcemapClient": isBooleanFlag("--sourcemapClient") ? Boolean : String,
      "--sourcemapServer": isBooleanFlag("--sourcemapServer") ? Boolean : String,
      "--watch": Boolean
    },
    {
      argv
    }
  );
  let input = args._;
  let flags = Object.entries(args).reduce((acc, [key, value]) => {
    key = key.replace(/^--/, "");
    acc[key] = value;
    return acc;
  }, {});
  if (flags.help) {
    console.log(helpText);
    return;
  }
  if (flags.version) {
    console.log(packageJson.version);
    return;
  }
  flags.interactive = flags.interactive ?? isMain;
  if (args["--no-typescript"]) {
    flags.typescript = false;
  }
  let command = input[0];
  switch (command) {
    case "routes":
      await routes(input[1], flags);
      break;
    case "build":
      await build(input[1], flags);
      break;
    case "reveal": {
      await generateEntry(input[1], input[2], flags);
      break;
    }
    case "dev":
      await dev(input[1], flags);
      break;
    case "typegen":
      await typegen(input[1], flags);
      break;
    default:
      await dev(input[0], flags);
  }
}

// cli/index.ts
run2(void 0, { isMain: true }).then(
  () => {
    process.exit(0);
  },
  (error) => {
    if (error) console.error(error);
    process.exit(1);
  }
);
