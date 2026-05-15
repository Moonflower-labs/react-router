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
  generate,
  parse,
  t,
  traverse,
  watch
} from "./chunk-45PASRDH.js";
import {
  fromNodeRequest
} from "./chunk-J6WV576L.js";
import {
  configRouteToBranchRoute,
  createConfigLoader,
  resolveEntryFiles,
  ssrExternals
} from "./chunk-KH3J56LY.js";
import {
  defineCompilerOptions,
  getVite,
  preloadVite
} from "./chunk-A5MD2G7J.js";
import {
  invariant
} from "./chunk-QI2ZSS2B.js";

// vite/plugin.ts
import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, rmSync } from "fs";
import {
  cp,
  mkdir as mkdir2,
  readdir,
  readFile,
  rename,
  rm,
  writeFile as writeFile2
} from "fs/promises";
import { createRequire as createRequire2 } from "module";
import * as path5 from "path";
import * as url from "url";
import * as babel from "@babel/core";
import { sendResponse } from "@remix-run/node-fetch-server";
import {
  unstable_setDevServerHooks as setDevServerHooks,
  createRequestHandler,
  matchRoutes as matchRoutes2
} from "react-router";
import {
  init as initEsModuleLexer,
  parse as esModuleLexer
} from "es-module-lexer";
import pick from "lodash/pick.js";
import jsesc from "jsesc";
import colors2 from "picocolors";
import kebabCase from "lodash/kebabCase.js";

// vite/styles.ts
import * as path2 from "path";
import { matchRoutes } from "react-router";

// vite/resolve-file-url.ts
import * as path from "path";
var resolveFileUrl = ({ rootDirectory }, filePath, { publicPath } = {}) => {
  let vite = getVite();
  let relativePath = path.relative(rootDirectory, filePath);
  let isWithinRoot = !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
  if (!isWithinRoot) {
    return path.posix.join("/@fs", vite.normalizePath(filePath));
  }
  let url2 = "/" + vite.normalizePath(relativePath);
  if (publicPath && publicPath !== "/" && url2.startsWith(publicPath)) {
    return path.posix.join("/@fs", vite.normalizePath(filePath));
  }
  return url2;
};

// vite/styles.ts
var cssFileRegExp = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/;
var cssModulesRegExp = new RegExp(`\\.module${cssFileRegExp.source}`);
var isCssFile = (file) => cssFileRegExp.test(file);
var isCssModulesFile = (file) => cssModulesRegExp.test(file);
var cssUrlParamsWithoutSideEffects = ["url", "inline", "raw", "inline-css"];
var isCssUrlWithoutSideEffects = (url2) => {
  let queryString = url2.split("?")[1];
  if (!queryString) {
    return false;
  }
  let params = new URLSearchParams(queryString);
  for (let paramWithoutSideEffects of cssUrlParamsWithoutSideEffects) {
    if (
      // Parameter is blank and not explicitly set, i.e. "?url", not "?url="
      params.get(paramWithoutSideEffects) === "" && !url2.includes(`?${paramWithoutSideEffects}=`) && !url2.includes(`&${paramWithoutSideEffects}=`)
    ) {
      return true;
    }
  }
  return false;
};
var getStylesForFiles = async ({
  viteDevServer,
  rootDirectory,
  loadCssContents,
  files
}) => {
  let styles = {};
  let deps = /* @__PURE__ */ new Set();
  try {
    for (let file of files) {
      let normalizedPath = path2.resolve(rootDirectory, file).replace(/\\/g, "/");
      let node = await viteDevServer.moduleGraph.getModuleById(normalizedPath);
      if (!node) {
        try {
          await viteDevServer.transformRequest(
            resolveFileUrl({ rootDirectory }, normalizedPath)
          );
        } catch (err) {
          console.error(err);
        }
        node = await viteDevServer.moduleGraph.getModuleById(normalizedPath);
      }
      if (!node) {
        console.log(`Could not resolve module for file: ${file}`);
        continue;
      }
      await findDeps(viteDevServer, node, deps);
    }
  } catch (err) {
    console.error(err);
  }
  for (let dep of deps) {
    if (dep.file && isCssFile(dep.file) && !isCssUrlWithoutSideEffects(dep.url)) {
      try {
        styles[dep.url] = await loadCssContents(viteDevServer, dep);
      } catch {
        console.warn(`Failed to load CSS for ${dep.file}`);
      }
    }
  }
  return Object.entries(styles).map(([fileName, css], i) => [
    `
/* ${fileName.replace(/\/\*/g, "/\\*").replace(/\*\//g, "*\\/")} */`,
    css
  ]).flat().join("\n") || void 0;
};
var findDeps = async (vite, node, deps) => {
  let branches = [];
  async function addFromNode(node2) {
    if (!deps.has(node2)) {
      deps.add(node2);
      await findDeps(vite, node2, deps);
    }
  }
  async function addFromUrl(url2) {
    let node2 = await vite.moduleGraph.getModuleByUrl(url2);
    if (node2) {
      await addFromNode(node2);
    }
  }
  if (node.ssrTransformResult) {
    if (node.ssrTransformResult.deps) {
      node.ssrTransformResult.deps.forEach(
        (url2) => branches.push(addFromUrl(url2))
      );
    }
  } else {
    node.importedModules.forEach((node2) => branches.push(addFromNode(node2)));
  }
  await Promise.all(branches);
};
var groupRoutesByParentId = (manifest) => {
  let routes = {};
  Object.values(manifest).forEach((route) => {
    if (route) {
      let parentId = route.parentId || "";
      if (!routes[parentId]) {
        routes[parentId] = [];
      }
      routes[parentId].push(route);
    }
  });
  return routes;
};
var createRoutesWithChildren = (manifest, parentId = "", routesByParentId = groupRoutesByParentId(manifest)) => {
  return (routesByParentId[parentId] || []).map((route) => ({
    ...route,
    ...route.index ? {
      index: true
    } : {
      index: false,
      children: createRoutesWithChildren(
        manifest,
        route.id,
        routesByParentId
      )
    }
  }));
};
var getStylesForPathname = async ({
  viteDevServer,
  rootDirectory,
  reactRouterConfig,
  entryClientFilePath,
  loadCssContents,
  pathname
}) => {
  if (pathname === void 0 || pathname.includes("?_data=")) {
    return void 0;
  }
  let routesWithChildren = createRoutesWithChildren(reactRouterConfig.routes);
  let appPath = path2.relative(process.cwd(), reactRouterConfig.appDirectory);
  let documentRouteFiles = matchRoutes(routesWithChildren, pathname, reactRouterConfig.basename)?.map(
    (match) => path2.resolve(appPath, reactRouterConfig.routes[match.route.id].file)
  ) ?? [];
  let styles = await getStylesForFiles({
    viteDevServer,
    rootDirectory,
    loadCssContents,
    files: [
      // Always include the client entry file when crawling the module graph for CSS
      path2.relative(rootDirectory, entryClientFilePath),
      // Then include any styles from the matched routes
      ...documentRouteFiles
    ]
  });
  return styles;
};
var getCssStringFromViteDevModuleCode = (code) => {
  let cssContent = void 0;
  const ast = parse(code, { sourceType: "module" });
  traverse(ast, {
    VariableDeclaration(path6) {
      const declaration = path6.node.declarations[0];
      if (declaration?.id?.type === "Identifier" && declaration.id.name === "__vite__css" && declaration.init?.type === "StringLiteral") {
        cssContent = declaration.init.value;
        path6.stop();
      }
    }
  });
  return cssContent;
};

// vite/virtual-module.ts
function create(name) {
  let id = `virtual:react-router/${name}`;
  return {
    id,
    resolvedId: `\0${id}`,
    url: `/@id/__x00__${id}`
  };
}

// vite/resolve-relative-route-file-path.ts
import path3 from "pathe";
function resolveRelativeRouteFilePath(route, reactRouterConfig) {
  let vite = getVite();
  let file = route.file;
  let fullPath = path3.resolve(reactRouterConfig.appDirectory, file);
  return vite.normalizePath(fullPath);
}

// vite/combine-urls.ts
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}

// vite/remove-exports.ts
import {
  findReferencedIdentifiers,
  deadCodeElimination
} from "babel-dead-code-elimination";
var removeExports = (ast, exportsToRemove) => {
  let previouslyReferencedIdentifiers = findReferencedIdentifiers(ast);
  let exportsFiltered = false;
  let markedForRemoval = /* @__PURE__ */ new Set();
  let removedExportLocalNames = /* @__PURE__ */ new Set();
  traverse(ast, {
    ExportDeclaration(path6) {
      if (path6.node.type === "ExportNamedDeclaration") {
        if (path6.node.specifiers.length) {
          path6.node.specifiers = path6.node.specifiers.filter((specifier) => {
            if (specifier.type === "ExportSpecifier" && specifier.exported.type === "Identifier") {
              if (exportsToRemove.includes(specifier.exported.name)) {
                exportsFiltered = true;
                if (specifier.local && specifier.local.name !== specifier.exported.name) {
                  removedExportLocalNames.add(specifier.local.name);
                }
                return false;
              }
            }
            return true;
          });
          if (path6.node.specifiers.length === 0) {
            markedForRemoval.add(path6);
          }
        }
        if (path6.node.declaration?.type === "VariableDeclaration") {
          let declaration = path6.node.declaration;
          declaration.declarations = declaration.declarations.filter(
            (declaration2) => {
              if (declaration2.id.type === "Identifier" && exportsToRemove.includes(declaration2.id.name)) {
                exportsFiltered = true;
                return false;
              }
              if (declaration2.id.type === "ArrayPattern" || declaration2.id.type === "ObjectPattern") {
                validateDestructuredExports(declaration2.id, exportsToRemove);
              }
              return true;
            }
          );
          if (declaration.declarations.length === 0) {
            markedForRemoval.add(path6);
          }
        }
        if (path6.node.declaration?.type === "FunctionDeclaration") {
          let id = path6.node.declaration.id;
          if (id && exportsToRemove.includes(id.name)) {
            markedForRemoval.add(path6);
          }
        }
        if (path6.node.declaration?.type === "ClassDeclaration") {
          let id = path6.node.declaration.id;
          if (id && exportsToRemove.includes(id.name)) {
            markedForRemoval.add(path6);
          }
        }
      }
      if (path6.node.type === "ExportDefaultDeclaration") {
        if (exportsToRemove.includes("default")) {
          markedForRemoval.add(path6);
          if (path6.node.declaration) {
            if (path6.node.declaration.type === "Identifier") {
              removedExportLocalNames.add(path6.node.declaration.name);
            } else if ((path6.node.declaration.type === "FunctionDeclaration" || path6.node.declaration.type === "ClassDeclaration") && path6.node.declaration.id) {
              removedExportLocalNames.add(path6.node.declaration.id.name);
            }
          }
        }
      }
    }
  });
  traverse(ast, {
    ExpressionStatement(path6) {
      if (!path6.parentPath.isProgram()) {
        return;
      }
      if (path6.node.expression.type === "AssignmentExpression") {
        const left = path6.node.expression.left;
        if (left.type === "MemberExpression" && left.object.type === "Identifier" && (exportsToRemove.includes(left.object.name) || removedExportLocalNames.has(left.object.name))) {
          markedForRemoval.add(path6);
        }
      }
    }
  });
  if (markedForRemoval.size > 0 || exportsFiltered) {
    for (let path6 of markedForRemoval) {
      path6.remove();
    }
    deadCodeElimination(ast, previouslyReferencedIdentifiers);
  }
};
function validateDestructuredExports(id, exportsToRemove) {
  if (id.type === "ArrayPattern") {
    for (let element of id.elements) {
      if (!element) {
        continue;
      }
      if (element.type === "Identifier" && exportsToRemove.includes(element.name)) {
        throw invalidDestructureError(element.name);
      }
      if (element.type === "RestElement" && element.argument.type === "Identifier" && exportsToRemove.includes(element.argument.name)) {
        throw invalidDestructureError(element.argument.name);
      }
      if (element.type === "ArrayPattern" || element.type === "ObjectPattern") {
        validateDestructuredExports(element, exportsToRemove);
      }
    }
  }
  if (id.type === "ObjectPattern") {
    for (let property of id.properties) {
      if (!property) {
        continue;
      }
      if (property.type === "ObjectProperty" && property.key.type === "Identifier") {
        if (property.value.type === "Identifier" && exportsToRemove.includes(property.value.name)) {
          throw invalidDestructureError(property.value.name);
        }
        if (property.value.type === "ArrayPattern" || property.value.type === "ObjectPattern") {
          validateDestructuredExports(property.value, exportsToRemove);
        }
      }
      if (property.type === "RestElement" && property.argument.type === "Identifier" && exportsToRemove.includes(property.argument.name)) {
        throw invalidDestructureError(property.argument.name);
      }
    }
  }
}
function invalidDestructureError(name) {
  return new Error(`Cannot remove destructured export "${name}"`);
}

// vite/has-dependency.ts
import { createRequire } from "module";
var nodeRequire = createRequire(import.meta.url);
function hasDependency({
  name,
  rootDirectory
}) {
  try {
    return Boolean(nodeRequire.resolve(name, { paths: [rootDirectory] }));
  } catch (err) {
    return false;
  }
}

// vite/cache.ts
function getOrSetFromCache(cache, key, version, getValue) {
  if (!cache) {
    return getValue();
  }
  let entry = cache.get(key);
  if (entry?.version === version) {
    return entry.value;
  }
  let value = getValue();
  let newEntry = { value, version };
  cache.set(key, newEntry);
  return value;
}

// vite/route-chunks.ts
function codeToAst(code, cache, cacheKey) {
  return structuredClone(
    getOrSetFromCache(
      cache,
      `${cacheKey}::codeToAst`,
      code,
      () => parse(code, { sourceType: "module" })
    )
  );
}
function assertNodePath(path6) {
  invariant(
    path6 && !Array.isArray(path6),
    `Expected a Path, but got ${Array.isArray(path6) ? "an array" : path6}`
  );
}
function assertNodePathIsStatement(path6) {
  invariant(
    path6 && !Array.isArray(path6) && t.isStatement(path6.node),
    `Expected a Statement path, but got ${Array.isArray(path6) ? "an array" : path6?.node?.type}`
  );
}
function assertNodePathIsVariableDeclarator(path6) {
  invariant(
    path6 && !Array.isArray(path6) && t.isVariableDeclarator(path6.node),
    `Expected an Identifier path, but got ${Array.isArray(path6) ? "an array" : path6?.node?.type}`
  );
}
function assertNodePathIsPattern(path6) {
  invariant(
    path6 && !Array.isArray(path6) && t.isPattern(path6.node),
    `Expected a Pattern path, but got ${Array.isArray(path6) ? "an array" : path6?.node?.type}`
  );
}
function getExportDependencies(code, cache, cacheKey) {
  return getOrSetFromCache(
    cache,
    `${cacheKey}::getExportDependencies`,
    code,
    () => {
      let exportDependencies = /* @__PURE__ */ new Map();
      let ast = codeToAst(code, cache, cacheKey);
      function handleExport(exportName, exportPath, identifiersPath = exportPath) {
        let identifiers = getDependentIdentifiersForPath(identifiersPath);
        let topLevelStatements = /* @__PURE__ */ new Set([
          exportPath.node,
          ...getTopLevelStatementsForPaths(identifiers)
        ]);
        let topLevelNonModuleStatements = new Set(
          Array.from(topLevelStatements).filter(
            (statement) => !t.isImportDeclaration(statement) && !t.isExportDeclaration(statement)
          )
        );
        let importedIdentifierNames = /* @__PURE__ */ new Set();
        for (let identifier of identifiers) {
          if (identifier.parentPath.parentPath?.isImportDeclaration()) {
            importedIdentifierNames.add(identifier.node.name);
          }
        }
        let exportedVariableDeclarators = /* @__PURE__ */ new Set();
        for (let identifier of identifiers) {
          if (identifier.parentPath.isVariableDeclarator() && identifier.parentPath.parentPath.parentPath?.isExportNamedDeclaration()) {
            exportedVariableDeclarators.add(identifier.parentPath.node);
            continue;
          }
          let isWithinExportDestructuring = Boolean(
            identifier.findParent(
              (path6) => Boolean(
                path6.isPattern() && path6.parentPath?.isVariableDeclarator() && path6.parentPath.parentPath?.parentPath?.isExportNamedDeclaration()
              )
            )
          );
          if (isWithinExportDestructuring) {
            let currentPath = identifier;
            while (currentPath) {
              if (
                // Check the identifier is within a variable declaration, and if
                // so, ensure we're on the left-hand side of the expression
                // since these identifiers are what make up the export names,
                // e.g. export const { foo } = { foo: bar }; should pick up
                // `foo` but not `bar`.
                currentPath.parentPath?.isVariableDeclarator() && currentPath.parentKey === "id"
              ) {
                exportedVariableDeclarators.add(currentPath.parentPath.node);
                break;
              }
              currentPath = currentPath.parentPath;
            }
          }
        }
        let dependencies = {
          topLevelStatements,
          topLevelNonModuleStatements,
          importedIdentifierNames,
          exportedVariableDeclarators
        };
        exportDependencies.set(exportName, dependencies);
      }
      traverse(ast, {
        ExportDeclaration(exportPath) {
          let { node } = exportPath;
          if (t.isExportAllDeclaration(node)) {
            return;
          }
          if (t.isExportDefaultDeclaration(node)) {
            handleExport("default", exportPath);
            return;
          }
          let { declaration } = node;
          if (t.isVariableDeclaration(declaration)) {
            let { declarations } = declaration;
            for (let i = 0; i < declarations.length; i++) {
              let declarator = declarations[i];
              if (t.isIdentifier(declarator.id)) {
                let declaratorPath = exportPath.get(
                  `declaration.declarations.${i}`
                );
                assertNodePathIsVariableDeclarator(declaratorPath);
                handleExport(declarator.id.name, exportPath, declaratorPath);
                continue;
              }
              if (t.isPattern(declarator.id)) {
                let exportedPatternPath = exportPath.get(
                  `declaration.declarations.${i}.id`
                );
                assertNodePathIsPattern(exportedPatternPath);
                let identifiers = getIdentifiersForPatternPath(exportedPatternPath);
                for (let identifier of identifiers) {
                  handleExport(identifier.node.name, exportPath, identifier);
                }
              }
            }
            return;
          }
          if (t.isFunctionDeclaration(declaration) || t.isClassDeclaration(declaration)) {
            invariant(
              declaration.id,
              "Expected exported function or class declaration to have a name when not the default export"
            );
            handleExport(declaration.id.name, exportPath);
            return;
          }
          if (t.isExportNamedDeclaration(node)) {
            for (let specifier of node.specifiers) {
              if (t.isIdentifier(specifier.exported)) {
                let name = specifier.exported.name;
                let specifierPath = exportPath.get("specifiers").find((path6) => path6.node === specifier);
                invariant(
                  specifierPath,
                  `Expected to find specifier path for ${name}`
                );
                handleExport(name, exportPath, specifierPath);
              }
            }
            return;
          }
          throw new Error(`Unknown export node type: ${node.type}`);
        }
      });
      return exportDependencies;
    }
  );
}
function getDependentIdentifiersForPath(path6, state) {
  let { visited, identifiers } = state ?? {
    visited: /* @__PURE__ */ new Set(),
    identifiers: /* @__PURE__ */ new Set()
  };
  if (visited.has(path6)) {
    return identifiers;
  }
  visited.add(path6);
  path6.traverse({
    Identifier(path7) {
      if (identifiers.has(path7)) {
        return;
      }
      identifiers.add(path7);
      let binding = path7.scope.getBinding(path7.node.name);
      if (!binding) {
        return;
      }
      getDependentIdentifiersForPath(binding.path, { visited, identifiers });
      for (let reference of binding.referencePaths) {
        if (reference.isExportNamedDeclaration()) {
          continue;
        }
        getDependentIdentifiersForPath(reference, {
          visited,
          identifiers
        });
      }
      for (let constantViolation of binding.constantViolations) {
        getDependentIdentifiersForPath(constantViolation, {
          visited,
          identifiers
        });
      }
    }
  });
  let topLevelStatement = getTopLevelStatementPathForPath(path6);
  let withinImportStatement = topLevelStatement.isImportDeclaration();
  let withinExportStatement = topLevelStatement.isExportDeclaration();
  if (!withinImportStatement && !withinExportStatement) {
    getDependentIdentifiersForPath(topLevelStatement, {
      visited,
      identifiers
    });
  }
  if (withinExportStatement && path6.isIdentifier() && (t.isPattern(path6.parentPath.node) || // [foo]
  t.isPattern(path6.parentPath.parentPath?.node))) {
    let variableDeclarator = path6.findParent((p) => p.isVariableDeclarator());
    assertNodePath(variableDeclarator);
    getDependentIdentifiersForPath(variableDeclarator, {
      visited,
      identifiers
    });
  }
  return identifiers;
}
function getTopLevelStatementPathForPath(path6) {
  let ancestry = path6.getAncestry();
  let topLevelStatement = ancestry[ancestry.length - 2];
  assertNodePathIsStatement(topLevelStatement);
  return topLevelStatement;
}
function getTopLevelStatementsForPaths(paths) {
  let topLevelStatements = /* @__PURE__ */ new Set();
  for (let path6 of paths) {
    let topLevelStatement = getTopLevelStatementPathForPath(path6);
    topLevelStatements.add(topLevelStatement.node);
  }
  return topLevelStatements;
}
function getIdentifiersForPatternPath(patternPath, identifiers = /* @__PURE__ */ new Set()) {
  function walk(currentPath) {
    if (currentPath.isIdentifier()) {
      identifiers.add(currentPath);
      return;
    }
    if (currentPath.isObjectPattern()) {
      let { properties } = currentPath.node;
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        if (t.isObjectProperty(property)) {
          let valuePath = currentPath.get(`properties.${i}.value`);
          assertNodePath(valuePath);
          walk(valuePath);
        } else if (t.isRestElement(property)) {
          let argumentPath = currentPath.get(`properties.${i}.argument`);
          assertNodePath(argumentPath);
          walk(argumentPath);
        }
      }
    } else if (currentPath.isArrayPattern()) {
      let { elements } = currentPath.node;
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element) {
          let elementPath = currentPath.get(`elements.${i}`);
          assertNodePath(elementPath);
          walk(elementPath);
        }
      }
    } else if (currentPath.isRestElement()) {
      let argumentPath = currentPath.get("argument");
      assertNodePath(argumentPath);
      walk(argumentPath);
    }
  }
  walk(patternPath);
  return identifiers;
}
var getExportedName = (exported) => {
  return t.isIdentifier(exported) ? exported.name : exported.value;
};
function setsIntersect(set1, set2) {
  let smallerSet = set1;
  let largerSet = set2;
  if (set1.size > set2.size) {
    smallerSet = set2;
    largerSet = set1;
  }
  for (let element of smallerSet) {
    if (largerSet.has(element)) {
      return true;
    }
  }
  return false;
}
function hasChunkableExport(code, exportName, cache, cacheKey) {
  return getOrSetFromCache(
    cache,
    `${cacheKey}::hasChunkableExport::${exportName}`,
    code,
    () => {
      let exportDependencies = getExportDependencies(code, cache, cacheKey);
      let dependencies = exportDependencies.get(exportName);
      if (!dependencies) {
        return false;
      }
      for (let [currentExportName, currentDependencies] of exportDependencies) {
        if (currentExportName === exportName) {
          continue;
        }
        if (setsIntersect(
          currentDependencies.topLevelNonModuleStatements,
          dependencies.topLevelNonModuleStatements
        )) {
          return false;
        }
      }
      if (dependencies.exportedVariableDeclarators.size > 1) {
        return false;
      }
      if (dependencies.exportedVariableDeclarators.size > 0) {
        for (let [
          currentExportName,
          currentDependencies
        ] of exportDependencies) {
          if (currentExportName === exportName) {
            continue;
          }
          if (setsIntersect(
            currentDependencies.exportedVariableDeclarators,
            dependencies.exportedVariableDeclarators
          )) {
            return false;
          }
        }
      }
      return true;
    }
  );
}
function getChunkedExport(code, exportName, generateOptions = {}, cache, cacheKey) {
  return getOrSetFromCache(
    cache,
    `${cacheKey}::getChunkedExport::${exportName}::${JSON.stringify(
      generateOptions
    )}`,
    code,
    () => {
      if (!hasChunkableExport(code, exportName, cache, cacheKey)) {
        return void 0;
      }
      let exportDependencies = getExportDependencies(code, cache, cacheKey);
      let dependencies = exportDependencies.get(exportName);
      invariant(dependencies, "Expected export to have dependencies");
      let topLevelStatementsArray = Array.from(dependencies.topLevelStatements);
      let exportedVariableDeclaratorsArray = Array.from(
        dependencies.exportedVariableDeclarators
      );
      let ast = codeToAst(code, cache, cacheKey);
      ast.program.body = ast.program.body.filter(
        (node) => topLevelStatementsArray.some(
          (statement) => t.isNodesEquivalent(node, statement)
        )
      ).map((node) => {
        if (!t.isImportDeclaration(node)) {
          return node;
        }
        if (dependencies.importedIdentifierNames.size === 0) {
          return null;
        }
        node.specifiers = node.specifiers.filter(
          (specifier) => dependencies.importedIdentifierNames.has(specifier.local.name)
        );
        invariant(
          node.specifiers.length > 0,
          "Expected import statement to have used specifiers"
        );
        return node;
      }).map((node) => {
        if (!t.isExportDeclaration(node)) {
          return node;
        }
        if (t.isExportAllDeclaration(node)) {
          return null;
        }
        if (t.isExportDefaultDeclaration(node)) {
          return exportName === "default" ? node : null;
        }
        let { declaration } = node;
        if (t.isVariableDeclaration(declaration)) {
          declaration.declarations = declaration.declarations.filter(
            (node2) => exportedVariableDeclaratorsArray.some(
              (declarator) => t.isNodesEquivalent(node2, declarator)
            )
          );
          if (declaration.declarations.length === 0) {
            return null;
          }
          return node;
        }
        if (t.isFunctionDeclaration(node.declaration) || t.isClassDeclaration(node.declaration)) {
          return node.declaration.id?.name === exportName ? node : null;
        }
        if (t.isExportNamedDeclaration(node)) {
          if (node.specifiers.length === 0) {
            return null;
          }
          node.specifiers = node.specifiers.filter(
            (specifier) => getExportedName(specifier.exported) === exportName
          );
          if (node.specifiers.length === 0) {
            return null;
          }
          return node;
        }
        throw new Error(`Unknown export node type: ${node.type}`);
      }).filter((node) => node !== null);
      return generate(ast, generateOptions);
    }
  );
}
function omitChunkedExports(code, exportNames, generateOptions = {}, cache, cacheKey) {
  return getOrSetFromCache(
    cache,
    `${cacheKey}::omitChunkedExports::${exportNames.join(
      ","
    )}::${JSON.stringify(generateOptions)}`,
    code,
    () => {
      const isChunkable = (exportName) => hasChunkableExport(code, exportName, cache, cacheKey);
      const isOmitted = (exportName) => exportNames.includes(exportName) && isChunkable(exportName);
      const isRetained = (exportName) => !isOmitted(exportName);
      let exportDependencies = getExportDependencies(code, cache, cacheKey);
      let allExportNames = Array.from(exportDependencies.keys());
      let omittedExportNames = allExportNames.filter(isOmitted);
      let retainedExportNames = allExportNames.filter(isRetained);
      let omittedStatements = /* @__PURE__ */ new Set();
      let omittedExportedVariableDeclarators = /* @__PURE__ */ new Set();
      for (let omittedExportName of omittedExportNames) {
        let dependencies = exportDependencies.get(omittedExportName);
        invariant(
          dependencies,
          `Expected dependencies for ${omittedExportName}`
        );
        for (let statement of dependencies.topLevelNonModuleStatements) {
          omittedStatements.add(statement);
        }
        for (let declarator of dependencies.exportedVariableDeclarators) {
          omittedExportedVariableDeclarators.add(declarator);
        }
      }
      let ast = codeToAst(code, cache, cacheKey);
      let omittedStatementsArray = Array.from(omittedStatements);
      let omittedExportedVariableDeclaratorsArray = Array.from(
        omittedExportedVariableDeclarators
      );
      ast.program.body = ast.program.body.filter(
        (node) => omittedStatementsArray.every(
          (statement) => !t.isNodesEquivalent(node, statement)
        )
      ).map((node) => {
        if (!t.isImportDeclaration(node)) {
          return node;
        }
        if (node.specifiers.length === 0) {
          return node;
        }
        node.specifiers = node.specifiers.filter((specifier) => {
          let importedName = specifier.local.name;
          for (let retainedExportName of retainedExportNames) {
            let dependencies = exportDependencies.get(retainedExportName);
            if (dependencies?.importedIdentifierNames?.has(importedName)) {
              return true;
            }
          }
          for (let omittedExportName of omittedExportNames) {
            let dependencies = exportDependencies.get(omittedExportName);
            if (dependencies?.importedIdentifierNames?.has(importedName)) {
              return false;
            }
          }
          return true;
        });
        if (node.specifiers.length === 0) {
          return null;
        }
        return node;
      }).map((node) => {
        if (!t.isExportDeclaration(node)) {
          return node;
        }
        if (t.isExportAllDeclaration(node)) {
          return node;
        }
        if (t.isExportDefaultDeclaration(node)) {
          return isOmitted("default") ? null : node;
        }
        if (t.isVariableDeclaration(node.declaration)) {
          node.declaration.declarations = node.declaration.declarations.filter(
            (node2) => omittedExportedVariableDeclaratorsArray.every(
              (declarator) => !t.isNodesEquivalent(node2, declarator)
            )
          );
          if (node.declaration.declarations.length === 0) {
            return null;
          }
          return node;
        }
        if (t.isFunctionDeclaration(node.declaration) || t.isClassDeclaration(node.declaration)) {
          invariant(
            node.declaration.id,
            "Expected exported function or class declaration to have a name when not the default export"
          );
          return isOmitted(node.declaration.id.name) ? null : node;
        }
        if (t.isExportNamedDeclaration(node)) {
          if (node.specifiers.length === 0) {
            return node;
          }
          node.specifiers = node.specifiers.filter((specifier) => {
            const exportedName = getExportedName(specifier.exported);
            return !isOmitted(exportedName);
          });
          if (node.specifiers.length === 0) {
            return null;
          }
          return node;
        }
        throw new Error(`Unknown node type: ${node.type}`);
      }).filter((node) => node !== null);
      if (ast.program.body.length === 0) {
        return void 0;
      }
      return generate(ast, generateOptions);
    }
  );
}
function detectRouteChunks(code, cache, cacheKey) {
  const hasRouteChunkByExportName = Object.fromEntries(
    routeChunkExportNames.map((exportName) => [
      exportName,
      hasChunkableExport(code, exportName, cache, cacheKey)
    ])
  );
  const chunkedExports = Object.entries(hasRouteChunkByExportName).filter(([, isChunked]) => isChunked).map(([exportName]) => exportName);
  const hasRouteChunks = chunkedExports.length > 0;
  return {
    hasRouteChunks,
    hasRouteChunkByExportName,
    chunkedExports
  };
}
var routeChunkExportNames = [
  "clientAction",
  "clientLoader",
  "clientMiddleware",
  "HydrateFallback"
];
var mainChunkName = "main";
var routeChunkNames = ["main", ...routeChunkExportNames];
function getRouteChunkCode(code, chunkName, cache, cacheKey) {
  if (chunkName === mainChunkName) {
    return omitChunkedExports(code, routeChunkExportNames, {}, cache, cacheKey);
  }
  return getChunkedExport(code, chunkName, {}, cache, cacheKey);
}
var routeChunkQueryStringPrefix = "?route-chunk=";
var routeChunkQueryStrings = {
  main: `${routeChunkQueryStringPrefix}main`,
  clientAction: `${routeChunkQueryStringPrefix}clientAction`,
  clientLoader: `${routeChunkQueryStringPrefix}clientLoader`,
  clientMiddleware: `${routeChunkQueryStringPrefix}clientMiddleware`,
  HydrateFallback: `${routeChunkQueryStringPrefix}HydrateFallback`
};
function getRouteChunkModuleId(filePath, chunkName) {
  return `${filePath}${routeChunkQueryStrings[chunkName]}`;
}
function isRouteChunkModuleId(id) {
  return Object.values(routeChunkQueryStrings).some(
    (queryString) => id.endsWith(queryString)
  );
}
function isRouteChunkName(name) {
  return name === mainChunkName || routeChunkExportNames.includes(name);
}
function getRouteChunkNameFromModuleId(id) {
  if (!isRouteChunkModuleId(id)) {
    return null;
  }
  let chunkName = id.split(routeChunkQueryStringPrefix)[1].split("&")[0];
  if (!isRouteChunkName(chunkName)) {
    return null;
  }
  return chunkName;
}

// vite/optimize-deps-entries.ts
import { escapePath as escapePathAsGlob } from "tinyglobby";
function getOptimizeDepsEntries({
  entryClientFilePath,
  reactRouterConfig
}) {
  if (!reactRouterConfig.future.unstable_optimizeDeps) {
    return [];
  }
  const vite = getVite();
  const viteMajorVersion = parseInt(vite.version.split(".")[0], 10);
  return [
    vite.normalizePath(entryClientFilePath),
    ...Object.values(reactRouterConfig.routes).map(
      (route) => resolveRelativeRouteFilePath(route, reactRouterConfig)
    )
  ].map(
    (entry) => (
      // In Vite 7, the `optimizeDeps.entries` option only accepts glob patterns.
      // In prior versions, absolute file paths were treated differently.
      viteMajorVersion >= 7 ? escapePathAsGlob(entry) : entry
    )
  );
}

// vite/with-props.ts
var namedComponentExports = ["HydrateFallback", "ErrorBoundary"];
function isNamedComponentExport(name) {
  return namedComponentExports.includes(name);
}
var decorateComponentExportsWithProps = (ast) => {
  const hocs = [];
  function getHocUid(path6, hocName) {
    const uid = path6.scope.generateUidIdentifier(hocName);
    hocs.push([hocName, uid]);
    return uid;
  }
  traverse(ast, {
    ExportDeclaration(path6) {
      if (path6.isExportDefaultDeclaration()) {
        const declaration = path6.get("declaration");
        const expr = declaration.isExpression() ? declaration.node : declaration.isFunctionDeclaration() ? toFunctionExpression(declaration.node) : void 0;
        if (expr) {
          const uid = getHocUid(path6, "UNSAFE_withComponentProps");
          declaration.replaceWith(t.callExpression(uid, [expr]));
        }
        return;
      }
      if (path6.isExportNamedDeclaration()) {
        const decl = path6.get("declaration");
        if (decl.isVariableDeclaration()) {
          decl.get("declarations").forEach((varDeclarator) => {
            const id = varDeclarator.get("id");
            const init = varDeclarator.get("init");
            const expr = init.node;
            if (!expr) return;
            if (!id.isIdentifier()) return;
            const { name } = id.node;
            if (!isNamedComponentExport(name)) return;
            const uid = getHocUid(path6, `UNSAFE_with${name}Props`);
            init.replaceWith(t.callExpression(uid, [expr]));
          });
          return;
        }
        if (decl.isFunctionDeclaration()) {
          const { id } = decl.node;
          if (!id) return;
          const { name } = id;
          if (!isNamedComponentExport(name)) return;
          const uid = getHocUid(path6, `UNSAFE_with${name}Props`);
          decl.replaceWith(
            t.variableDeclaration("const", [
              t.variableDeclarator(
                t.identifier(name),
                t.callExpression(uid, [toFunctionExpression(decl.node)])
              )
            ])
          );
        }
      }
    }
  });
  if (hocs.length > 0) {
    ast.program.body.unshift(
      t.importDeclaration(
        hocs.map(
          ([name, identifier]) => t.importSpecifier(identifier, t.identifier(name))
        ),
        t.stringLiteral("react-router")
      )
    );
  }
};
function toFunctionExpression(decl) {
  return t.functionExpression(
    decl.id,
    decl.params,
    decl.body,
    decl.generator,
    decl.async
  );
}

// vite/load-dotenv.ts
async function loadDotenv({
  rootDirectory,
  viteUserConfig,
  mode
}) {
  const vite = await import("vite");
  Object.assign(
    process.env,
    vite.loadEnv(
      mode,
      viteUserConfig.envDir ?? rootDirectory,
      // We override the default prefix of "VITE_" with a blank string since
      // we're targeting the server, so we want to load all environment
      // variables, not just those explicitly marked for the client
      ""
    )
  );
}

// vite/plugins/validate-plugin-order.ts
function validatePluginOrder() {
  return {
    name: "react-router:validate-plugin-order",
    configResolved(viteConfig) {
      let pluginIndex = (pluginName) => {
        pluginName = Array.isArray(pluginName) ? pluginName : [pluginName];
        return viteConfig.plugins.findIndex(
          (plugin) => pluginName.includes(plugin.name)
        );
      };
      let reactRouterRscPluginIndex = pluginIndex("react-router/rsc");
      let viteRscPluginIndex = pluginIndex("rsc");
      if (reactRouterRscPluginIndex >= 0 && viteRscPluginIndex >= 0 && reactRouterRscPluginIndex > viteRscPluginIndex) {
        throw new Error(
          `The "@vitejs/plugin-rsc" plugin should be placed after the React Router RSC plugin in your Vite config`
        );
      }
      let reactRouterPluginIndex = pluginIndex([
        "react-router",
        "react-router/rsc"
      ]);
      let mdxPluginIndex = pluginIndex("@mdx-js/rollup");
      if (mdxPluginIndex >= 0 && mdxPluginIndex > reactRouterPluginIndex) {
        throw new Error(
          `The "@mdx-js/rollup" plugin should be placed before the React Router plugin in your Vite config`
        );
      }
    }
  };
}

// vite/plugins/warn-on-client-source-maps.ts
import colors from "picocolors";
function warnOnClientSourceMaps() {
  let viteConfig;
  let viteCommand;
  let logged = false;
  return {
    name: "react-router:warn-on-client-source-maps",
    config(_, configEnv) {
      viteCommand = configEnv.command;
    },
    configResolved(config) {
      viteConfig = config;
    },
    buildStart() {
      invariant(viteConfig);
      if (!logged && viteCommand === "build" && viteConfig.mode === "production" && !viteConfig.build.ssr && (viteConfig.build.sourcemap || viteConfig.environments?.client?.build.sourcemap)) {
        viteConfig.logger.warn(
          colors.yellow(
            "\n" + colors.bold("  \u26A0\uFE0F  Source maps are enabled in production\n") + [
              "This makes your server code publicly",
              "visible in the browser. This is highly",
              "discouraged! If you insist, ensure that",
              "you are using environment variables for",
              "secrets and not hard-coding them in",
              "your source code."
            ].map((line) => "     " + line).join("\n") + "\n"
          )
        );
        logged = true;
      }
    }
  };
}

// vite/plugins/prerender.ts
import { mkdir, writeFile } from "fs/promises";
import path4 from "path";
function normalizePrerenderRequest(input) {
  if (typeof input === "string" || input instanceof Request) {
    return { request: input, metadata: void 0 };
  }
  return { request: input.request, metadata: input.metadata };
}
function normalizePostProcessResult(result) {
  if (Array.isArray(result)) {
    return { files: result, requests: [] };
  }
  return { files: result.files, requests: result.requests ?? [] };
}
function prerender(options) {
  const {
    config,
    requests,
    postProcess = defaultPostProcess,
    handleError = defaultHandleError,
    logFile,
    finalize
  } = options;
  let viteConfig;
  return {
    name: "prerender",
    sharedDuringBuild: true,
    config: {
      order: "post",
      handler({ builder: { buildApp } = {} }) {
        return {
          builder: {
            async buildApp(builder) {
              await buildApp?.(builder);
              const rawRequests = typeof requests === "function" ? await requests() : requests;
              const prerenderRequests = rawRequests.map(
                normalizePrerenderRequest
              );
              if (prerenderRequests.length === 0) {
                return;
              }
              const prerenderConfig = typeof config === "function" ? await config() : config;
              const {
                buildDirectory = viteConfig.environments.client.build.outDir,
                concurrency = 1,
                retryCount = 0,
                retryDelay = 500,
                maxRedirects = 0,
                timeout = 1e4
              } = prerenderConfig ?? {};
              let ogIsBuildRequest = process.env.IS_RR_BUILD_REQUEST;
              process.env.IS_RR_BUILD_REQUEST = "yes";
              try {
                const previewServer = await startPreviewServer(viteConfig);
                try {
                  const baseUrl = getResolvedUrl(previewServer);
                  async function prerenderRequest(input, metadata) {
                    let attemptCount = 0;
                    let redirectCount = 0;
                    const request = new Request(input);
                    const url2 = new URL(request.url);
                    if (url2.origin !== baseUrl.origin) {
                      url2.hostname = baseUrl.hostname;
                      url2.protocol = baseUrl.protocol;
                      url2.port = baseUrl.port;
                    }
                    async function attempt(url3) {
                      try {
                        const signal = AbortSignal.timeout(timeout);
                        const prerenderReq = new Request(url3, request);
                        const response = await fetch(prerenderReq, {
                          redirect: "manual",
                          signal
                        });
                        if (response.status >= 300 && response.status < 400 && response.headers.has("location") && ++redirectCount <= maxRedirects) {
                          const location = response.headers.get("location");
                          const responseURL = new URL(response.url);
                          const locationUrl = new URL(location, response.url);
                          if (responseURL.origin !== locationUrl.origin) {
                            return await postProcess(
                              request,
                              response,
                              metadata
                            );
                          }
                          const redirectUrl = new URL(location, url3);
                          return await attempt(redirectUrl);
                        }
                        if (response.status >= 500 && ++attemptCount <= retryCount) {
                          await new Promise(
                            (resolve3) => setTimeout(resolve3, retryDelay)
                          );
                          return attempt(url3);
                        }
                        return await postProcess(request, response, metadata);
                      } catch (error) {
                        if (++attemptCount <= retryCount) {
                          await new Promise(
                            (resolve3) => setTimeout(resolve3, retryDelay)
                          );
                          return attempt(url3);
                        }
                        handleError(
                          request,
                          error instanceof Error ? error : new Error(error?.toString() ?? "Unknown error"),
                          metadata
                        );
                        return [];
                      }
                    }
                    return attempt(url2);
                  }
                  async function prerender2(input, metadata) {
                    const result = await prerenderRequest(input, metadata);
                    const { files, requests: requests2 } = normalizePostProcessResult(result);
                    for (const file of files) {
                      await writePrerenderFile(file, metadata);
                    }
                    for (const followUp of requests2) {
                      const normalized = normalizePrerenderRequest(followUp);
                      await prerender2(normalized.request, normalized.metadata);
                    }
                  }
                  async function writePrerenderFile(file, metadata) {
                    const normalizedPath = file.path.startsWith("/") ? file.path.slice(1) : file.path;
                    const outputPath = path4.join(
                      buildDirectory,
                      ...normalizedPath.split("/")
                    );
                    await mkdir(path4.dirname(outputPath), { recursive: true });
                    await writeFile(outputPath, file.contents);
                    const relativePath = path4.relative(
                      viteConfig.root,
                      outputPath
                    );
                    if (logFile) {
                      logFile(relativePath, metadata);
                    }
                    return relativePath;
                  }
                  const pMap = await import("p-map");
                  await pMap.default(
                    prerenderRequests,
                    async ({ request, metadata }) => {
                      await prerender2(request, metadata);
                    },
                    { concurrency }
                  );
                  if (finalize) {
                    await finalize(buildDirectory);
                  }
                } finally {
                  await previewServer.close();
                }
              } finally {
                process.env.IS_RR_BUILD_REQUEST = ogIsBuildRequest;
              }
            }
          }
        };
      }
    },
    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    }
  };
}
async function defaultPostProcess(request, response) {
  const prerenderPath = new URL(request.url).pathname;
  if (!response.ok) {
    throw new Error(
      `Prerender: Request failed for ${prerenderPath}: ${response.status} ${response.statusText}`
    );
  }
  return [
    {
      path: `${prerenderPath}/index.html`,
      contents: await response.text()
    }
  ];
}
function defaultHandleError(request, error) {
  const prerenderPath = new URL(request.url).pathname;
  if (request.signal?.aborted) {
    throw new Error(
      `Prerender: Request timed out for ${prerenderPath}: ${error.message}`
    );
  }
  throw new Error(
    `Prerender: Request failed for ${prerenderPath}: ${error.message}`
  );
}
async function startPreviewServer(viteConfig) {
  const vite = await import("vite");
  try {
    return await vite.preview({
      configFile: viteConfig.configFile,
      logLevel: "silent",
      preview: {
        port: 0,
        open: false
      }
    });
  } catch (error) {
    throw new Error("Prerender: Failed to start Vite preview server", {
      cause: error
    });
  }
}
function getResolvedUrl(previewServer) {
  const baseUrl = previewServer.resolvedUrls?.local[0];
  if (!baseUrl) {
    throw new Error(
      "Prerender: No resolved URL is available from the Vite preview server"
    );
  }
  return new URL(baseUrl);
}

// vite/plugin.ts
var nodeRequire2 = createRequire2(import.meta.url);
async function resolveViteConfig({
  configFile,
  mode,
  root,
  plugins
}) {
  let vite = getVite();
  let viteConfig = await vite.resolveConfig(
    { mode, configFile, root, plugins },
    "build",
    // command
    "production",
    // default mode
    "production"
    // default NODE_ENV
  );
  if (typeof viteConfig.build.manifest === "string") {
    throw new Error("Custom Vite manifest paths are not supported");
  }
  return viteConfig;
}
function extractPluginContext(viteConfig) {
  return viteConfig["__reactRouterPluginContext"];
}
var SERVER_ONLY_ROUTE_EXPORTS = ["loader", "action", "middleware", "headers"];
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
var BUILD_CLIENT_ROUTE_QUERY_STRING = "?__react-router-build-client-route";
var SSR_BUNDLE_PREFIX = "ssrBundle_";
function isSsrBundleEnvironmentName(name) {
  return name.startsWith(SSR_BUNDLE_PREFIX);
}
function getServerEnvironmentEntries(ctx, record) {
  return Object.entries(record).filter(
    ([name]) => ctx.buildManifest?.serverBundles ? isSsrBundleEnvironmentName(name) : name === "ssr"
  );
}
function getServerEnvironmentKeys(ctx, record) {
  return getServerEnvironmentEntries(ctx, record).map(([key]) => key);
}
function getServerEnvironmentValues(ctx, record) {
  return getServerEnvironmentEntries(ctx, record).map(([, value]) => value);
}
var isRouteEntryModuleId = (id) => {
  return id.endsWith(BUILD_CLIENT_ROUTE_QUERY_STRING);
};
var isRouteVirtualModule = (id) => {
  return isRouteEntryModuleId(id) || isRouteChunkModuleId(id);
};
var isServerBuildVirtualModuleId = (id) => {
  return id.split("?")[0] === virtual.serverBuild.id;
};
var getServerBuildFile = (viteManifest) => {
  let serverBuildIds = Object.keys(viteManifest).filter(
    isServerBuildVirtualModuleId
  );
  invariant(
    serverBuildIds.length <= 1,
    "Multiple server build files found in manifest"
  );
  invariant(
    serverBuildIds.length === 1,
    "Server build file not found in manifest"
  );
  return viteManifest[serverBuildIds[0]].file;
};
var virtualHmrRuntime = create("hmr-runtime");
var virtualInjectHmrRuntime = create("inject-hmr-runtime");
var normalizeRelativeFilePath = (file, reactRouterConfig) => {
  let vite = getVite();
  let fullPath = path5.resolve(reactRouterConfig.appDirectory, file);
  let relativePath = path5.relative(reactRouterConfig.appDirectory, fullPath);
  return vite.normalizePath(relativePath).split("?")[0];
};
var virtual = {
  serverBuild: create("server-build"),
  serverManifest: create("server-manifest"),
  browserManifest: create("browser-manifest")
};
var invalidateVirtualModules = (viteDevServer) => {
  Object.values(virtual).forEach((vmod) => {
    let mod = viteDevServer.moduleGraph.getModuleById(vmod.resolvedId);
    if (mod) {
      viteDevServer.moduleGraph.invalidateModule(mod);
    }
  });
};
var getHash = (source, maxLength) => {
  let hash = createHash("sha256").update(source).digest("hex");
  return typeof maxLength === "number" ? hash.slice(0, maxLength) : hash;
};
var resolveChunk = (ctx, viteManifest, absoluteFilePath) => {
  let vite = getVite();
  let rootRelativeFilePath = vite.normalizePath(
    path5.relative(ctx.rootDirectory, absoluteFilePath)
  );
  let entryChunk = viteManifest[rootRelativeFilePath];
  if (!entryChunk) {
    return void 0;
  }
  return entryChunk;
};
var getPublicModulePathForEntry = (ctx, viteManifest, entryFilePath) => {
  let entryChunk = resolveChunk(ctx, viteManifest, entryFilePath);
  return entryChunk ? `${ctx.publicPath}${entryChunk.file}` : void 0;
};
var getCssCodeSplitDisabledFile = (ctx, viteConfig, viteManifest) => {
  if (viteConfig.build.cssCodeSplit) {
    return null;
  }
  let cssFile = viteManifest["style.css"]?.file;
  invariant(
    cssFile,
    "Expected `style.css` to be present in Vite manifest when `build.cssCodeSplit` is disabled"
  );
  return `${ctx.publicPath}${cssFile}`;
};
var getClientEntryChunk = (ctx, viteManifest) => {
  let filePath = ctx.entryClientFilePath;
  let chunk = resolveChunk(ctx, viteManifest, filePath);
  invariant(chunk, `Chunk not found: ${filePath}`);
  return chunk;
};
var getReactRouterManifestBuildAssets = (ctx, viteConfig, viteManifest, allDynamicCssFiles, entryFilePath, route) => {
  let entryChunk = resolveChunk(ctx, viteManifest, entryFilePath);
  invariant(entryChunk, `Chunk not found: ${entryFilePath}`);
  let isRootRoute = Boolean(route && route.parentId === void 0);
  let routeModuleChunks = routeChunkNames.map(
    (routeChunkName) => resolveChunk(
      ctx,
      viteManifest,
      getRouteChunkModuleId(entryFilePath.split("?")[0], routeChunkName)
    )
  ).filter(isNonNullable);
  let chunks = resolveDependantChunks(
    viteManifest,
    [
      // If this is the root route, we also need to include assets from the
      // client entry file as this is a common way for consumers to import
      // global reset styles, etc.
      isRootRoute ? getClientEntryChunk(ctx, viteManifest) : null,
      entryChunk,
      routeModuleChunks
    ].flat(1).filter(isNonNullable)
  );
  return {
    module: `${ctx.publicPath}${entryChunk.file}`,
    imports: dedupe(chunks.flatMap((e) => e.imports ?? [])).map((imported) => {
      return `${ctx.publicPath}${viteManifest[imported].file}`;
    }) ?? [],
    css: dedupe(
      [
        // If CSS code splitting is disabled, Vite includes a singular 'style.css' asset
        // in the manifest that isn't tied to any route file. If we want to render these
        // styles correctly, we need to include them in the root route.
        isRootRoute ? getCssCodeSplitDisabledFile(ctx, viteConfig, viteManifest) : null,
        chunks.flatMap((e) => e.css ?? []).map((href) => {
          let publicHref = `${ctx.publicPath}${href}`;
          return allDynamicCssFiles.has(href) ? `${publicHref}#` : publicHref;
        })
      ].flat(1).filter(isNonNullable)
    )
  };
};
function resolveDependantChunks(viteManifest, entryChunks) {
  let chunks = /* @__PURE__ */ new Set();
  function walk(chunk) {
    if (chunks.has(chunk)) {
      return;
    }
    chunks.add(chunk);
    if (chunk.imports) {
      for (let importKey of chunk.imports) {
        walk(viteManifest[importKey]);
      }
    }
  }
  for (let entryChunk of entryChunks) {
    walk(entryChunk);
  }
  return Array.from(chunks);
}
function getAllDynamicCssFiles(ctx, viteManifest) {
  let allDynamicCssFiles = /* @__PURE__ */ new Set();
  for (let route of Object.values(ctx.reactRouterConfig.routes)) {
    let routeFile = path5.join(ctx.reactRouterConfig.appDirectory, route.file);
    let entryChunk = resolveChunk(
      ctx,
      viteManifest,
      `${routeFile}${BUILD_CLIENT_ROUTE_QUERY_STRING}`
    );
    if (entryChunk) {
      let walk2 = function(chunk, isDynamicImportContext) {
        if (visitedChunks.has(chunk)) {
          return;
        }
        visitedChunks.add(chunk);
        if (isDynamicImportContext && chunk.css) {
          for (let cssFile of chunk.css) {
            allDynamicCssFiles.add(cssFile);
          }
        }
        if (chunk.dynamicImports) {
          for (let dynamicImportKey of chunk.dynamicImports) {
            walk2(viteManifest[dynamicImportKey], true);
          }
        }
        if (chunk.imports) {
          for (let importKey of chunk.imports) {
            walk2(viteManifest[importKey], isDynamicImportContext);
          }
        }
      };
      var walk = walk2;
      let visitedChunks = /* @__PURE__ */ new Set();
      walk2(entryChunk, false);
    }
  }
  return allDynamicCssFiles;
}
function dedupe(array) {
  return [...new Set(array)];
}
var writeFileSafe = async (file, contents) => {
  await mkdir2(path5.dirname(file), { recursive: true });
  await writeFile2(file, contents);
};
var getExportNames = (code) => {
  let [, exportSpecifiers] = esModuleLexer(code);
  return exportSpecifiers.map(({ n: name }) => name);
};
var getRouteManifestModuleExports = async (viteChildCompiler, ctx) => {
  let entries = await Promise.all(
    Object.entries(ctx.reactRouterConfig.routes).map(async ([key, route]) => {
      let sourceExports = await getRouteModuleExports(
        viteChildCompiler,
        ctx,
        route.file
      );
      return [key, sourceExports];
    })
  );
  return Object.fromEntries(entries);
};
var compileRouteFile = async (viteChildCompiler, ctx, routeFile, readRouteFile) => {
  if (!viteChildCompiler) {
    throw new Error("Vite child compiler not found");
  }
  let ssr = true;
  let { pluginContainer, moduleGraph } = viteChildCompiler;
  let routePath = path5.resolve(ctx.reactRouterConfig.appDirectory, routeFile);
  let url2 = resolveFileUrl(ctx, routePath);
  let resolveId = async () => {
    let result = await pluginContainer.resolveId(url2, void 0, { ssr });
    if (!result) throw new Error(`Could not resolve module ID for ${url2}`);
    return result.id;
  };
  let [id, code] = await Promise.all([
    resolveId(),
    readRouteFile?.() ?? readFile(routePath, "utf-8"),
    // pluginContainer.transform(...) fails if we don't do this first:
    moduleGraph.ensureEntryFromUrl(url2, ssr)
  ]);
  let transformed = await pluginContainer.transform(code, id, { ssr });
  return transformed.code;
};
var getRouteModuleExports = async (viteChildCompiler, ctx, routeFile, readRouteFile) => {
  if (!viteChildCompiler) {
    throw new Error("Vite child compiler not found");
  }
  let code = await compileRouteFile(
    viteChildCompiler,
    ctx,
    routeFile,
    readRouteFile
  );
  return getExportNames(code);
};
var resolveEnvironmentBuildContext = ({
  viteCommand,
  viteUserConfig
}) => {
  if (!("__reactRouterEnvironmentBuildContext" in viteUserConfig) || !viteUserConfig.__reactRouterEnvironmentBuildContext) {
    return null;
  }
  let buildContext = viteUserConfig.__reactRouterEnvironmentBuildContext;
  let resolvedBuildContext = {
    name: buildContext.name,
    options: buildContext.resolveOptions({ viteUserConfig })
  };
  return resolvedBuildContext;
};
var getServerBuildDirectory = (reactRouterConfig, { serverBundleId } = {}) => path5.join(
  reactRouterConfig.buildDirectory,
  "server",
  ...serverBundleId ? [serverBundleId] : []
);
var getClientBuildDirectory = (reactRouterConfig) => path5.join(reactRouterConfig.buildDirectory, "client");
var getServerBundleRouteIds = (vitePluginContext, ctx) => {
  if (!ctx.buildManifest) {
    return void 0;
  }
  let environmentName = ctx.reactRouterConfig.future.v8_viteEnvironmentApi ? vitePluginContext.environment.name : ctx.environmentBuildContext?.name;
  if (!environmentName || !isSsrBundleEnvironmentName(environmentName)) {
    return void 0;
  }
  let serverBundleId = environmentName.replace(SSR_BUNDLE_PREFIX, "");
  let routesByServerBundleId = getRoutesByServerBundleId(ctx.buildManifest);
  let serverBundleRoutes = routesByServerBundleId[serverBundleId];
  invariant(
    serverBundleRoutes,
    `Routes not found for server bundle "${serverBundleId}"`
  );
  return Object.keys(serverBundleRoutes);
};
var defaultEntriesDir = path5.resolve(
  path5.dirname(nodeRequire2.resolve("@react-router/dev/package.json")),
  "dist",
  "config",
  "defaults"
);
var defaultEntries = readdirSync(defaultEntriesDir).map(
  (filename) => path5.join(defaultEntriesDir, filename)
);
invariant(defaultEntries.length > 0, "No default entries found");
var reactRouterDevLoadContext = () => void 0;
var reactRouterVitePlugin = () => {
  let rootDirectory;
  let viteCommand;
  let viteUserConfig;
  let viteConfigEnv;
  let viteConfig;
  let cssModulesManifest = {};
  let viteChildCompiler = null;
  let cache = /* @__PURE__ */ new Map();
  let reactRouterConfigLoader;
  let typegenWatcherPromise;
  let logger;
  let firstLoad = true;
  let ctx;
  let updatePluginContext = async () => {
    let reactRouterConfig;
    let reactRouterConfigResult = await reactRouterConfigLoader.getConfig();
    if (reactRouterConfigResult.ok) {
      reactRouterConfig = reactRouterConfigResult.value;
    } else {
      logger.error(reactRouterConfigResult.error);
      if (firstLoad) {
        process.exit(1);
      }
      return;
    }
    let injectedPluginContext = !reactRouterConfig.future.v8_viteEnvironmentApi && viteCommand === "build" ? extractPluginContext(viteUserConfig) : void 0;
    let { entryClientFilePath, entryServerFilePath } = await resolveEntryFiles({
      rootDirectory,
      reactRouterConfig
    });
    let publicPath = viteUserConfig.base ?? "/";
    if (reactRouterConfig.basename !== "/" && viteCommand === "serve" && !viteUserConfig.server?.middlewareMode && !reactRouterConfig.basename.startsWith(publicPath)) {
      logger.error(
        colors2.red(
          "When using the React Router `basename` and the Vite `base` config, the `basename` config must begin with `base` for the default Vite dev server."
        )
      );
      process.exit(1);
    }
    let viteManifestEnabled = viteUserConfig.build?.manifest === true;
    let buildManifest = viteCommand === "build" ? injectedPluginContext?.buildManifest ?? await getBuildManifest({ reactRouterConfig, rootDirectory }) : null;
    let environmentBuildContext = viteCommand === "build" ? resolveEnvironmentBuildContext({ viteCommand, viteUserConfig }) : null;
    firstLoad = false;
    ctx = {
      environmentBuildContext,
      reactRouterManifest: null,
      prerenderPaths: null,
      reactRouterConfig,
      rootDirectory,
      entryClientFilePath,
      entryServerFilePath,
      publicPath,
      viteManifestEnabled,
      buildManifest
    };
  };
  let getServerEntry = async ({ routeIds }) => {
    invariant(viteConfig, "viteconfig required to generate the server entry");
    let routes = routeIds ? (
      // For server bundle builds, the server build should only import the
      // routes for this bundle rather than importing all routes
      pick(ctx.reactRouterConfig.routes, routeIds)
    ) : (
      // Otherwise, all routes are imported as usual
      ctx.reactRouterConfig.routes
    );
    let prerenderPaths = await getPrerenderPaths(
      ctx.reactRouterConfig.prerender,
      ctx.reactRouterConfig.ssr,
      routes
    );
    if (!ctx.prerenderPaths) {
      ctx.prerenderPaths = /* @__PURE__ */ new Set();
    }
    for (let path6 of prerenderPaths) {
      ctx.prerenderPaths.add(path6);
    }
    let isSpaMode = isSpaModeEnabled(ctx.reactRouterConfig);
    return `
    import * as entryServer from ${JSON.stringify(
      resolveFileUrl(ctx, ctx.entryServerFilePath, {
        publicPath: ctx.publicPath
      })
    )};
    ${Object.keys(routes).map((key, index) => {
      let route = routes[key];
      if (isSpaMode && key !== "root") {
        return `const route${index} = { default: () => null };`;
      } else {
        return `import * as route${index} from ${JSON.stringify(
          resolveFileUrl(
            ctx,
            resolveRelativeRouteFilePath(route, ctx.reactRouterConfig),
            { publicPath: ctx.publicPath }
          )
        )};`;
      }
    }).join("\n")}
      export { default as assets } from ${JSON.stringify(
      virtual.serverManifest.id
    )};
      export const assetsBuildDirectory = ${JSON.stringify(
      path5.relative(
        ctx.rootDirectory,
        getClientBuildDirectory(ctx.reactRouterConfig)
      )
    )};
      export const basename = ${JSON.stringify(ctx.reactRouterConfig.basename)};
      export const future = ${JSON.stringify(ctx.reactRouterConfig.future)};
      export const ssr = ${ctx.reactRouterConfig.ssr};
      export const isSpaMode = ${isSpaMode};
      export const prerender = ${JSON.stringify(prerenderPaths)};
      export const routeDiscovery = ${JSON.stringify(
      ctx.reactRouterConfig.routeDiscovery
    )};
      export const publicPath = ${JSON.stringify(ctx.publicPath)};
      export const entry = { module: entryServer };
      export const routes = {
        ${Object.keys(routes).map((key, index) => {
      let route = routes[key];
      return `${JSON.stringify(key)}: {
          id: ${JSON.stringify(route.id)},
          parentId: ${JSON.stringify(route.parentId)},
          path: ${JSON.stringify(route.path)},
          index: ${JSON.stringify(route.index)},
          caseSensitive: ${JSON.stringify(route.caseSensitive)},
          module: route${index}
        }`;
    }).join(",\n  ")}
      };
      ${ctx.reactRouterConfig.future.v8_viteEnvironmentApi && viteCommand === "serve" ? `
              export const unstable_getCriticalCss = ({ pathname }) => {
                return {
                  rel: "stylesheet",
                  href: "${ctx.publicPath}@react-router/critical.css?pathname=" + pathname,
                };
              }
            ` : ""}
      export const allowedActionOrigins = ${JSON.stringify(ctx.reactRouterConfig.allowedActionOrigins)};
    `;
  };
  let loadViteManifest = async (directory) => {
    let manifestContents = await readFile(
      path5.resolve(directory, ".vite", "manifest.json"),
      "utf-8"
    );
    return JSON.parse(manifestContents);
  };
  let getViteManifestAssetPaths = (viteManifest) => {
    let cssUrlPaths = Object.values(viteManifest).filter((chunk) => chunk.file.endsWith(".css")).map((chunk) => chunk.file);
    let chunkAssetPaths = Object.values(viteManifest).flatMap(
      (chunk) => chunk.assets ?? []
    );
    return /* @__PURE__ */ new Set([...cssUrlPaths, ...chunkAssetPaths]);
  };
  let generateSriManifest = async (ctx2) => {
    let clientBuildDirectory = getClientBuildDirectory(ctx2.reactRouterConfig);
    let entries = readdirSync(clientBuildDirectory, {
      withFileTypes: true,
      recursive: true
    });
    let sriManifest = {};
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".js")) {
        const entryNormalizedPath = "parentPath" in entry && typeof entry.parentPath === "string" ? entry.parentPath : entry.path;
        let contents;
        try {
          contents = await readFile(
            path5.join(entryNormalizedPath, entry.name),
            "utf-8"
          );
        } catch (e) {
          logger.error(`Failed to read file for SRI generation: ${entry.name}`);
          throw e;
        }
        let hash = createHash("sha384").update(contents).digest().toString("base64");
        let filepath = getVite().normalizePath(
          path5.relative(
            clientBuildDirectory,
            path5.join(entryNormalizedPath, entry.name)
          )
        );
        sriManifest[`${ctx2.publicPath}${filepath}`] = `sha384-${hash}`;
      }
    }
    return sriManifest;
  };
  let generateReactRouterManifestsForBuild = async ({
    viteConfig: viteConfig2,
    routeIds
  }) => {
    invariant(viteConfig2);
    let viteManifest = await loadViteManifest(
      getClientBuildDirectory(ctx.reactRouterConfig)
    );
    let allDynamicCssFiles = getAllDynamicCssFiles(ctx, viteManifest);
    let entry = getReactRouterManifestBuildAssets(
      ctx,
      viteConfig2,
      viteManifest,
      allDynamicCssFiles,
      ctx.entryClientFilePath,
      null
    );
    let browserRoutes = {};
    let serverRoutes = {};
    let routeManifestExports = await getRouteManifestModuleExports(
      viteChildCompiler,
      ctx
    );
    let enforceSplitRouteModules = ctx.reactRouterConfig.future.v8_splitRouteModules === "enforce";
    for (let route of Object.values(ctx.reactRouterConfig.routes)) {
      let routeFile = path5.join(ctx.reactRouterConfig.appDirectory, route.file);
      let sourceExports = routeManifestExports[route.id];
      let hasClientAction = sourceExports.includes("clientAction");
      let hasClientLoader = sourceExports.includes("clientLoader");
      let hasClientMiddleware = sourceExports.includes("clientMiddleware");
      let hasHydrateFallback = sourceExports.includes("HydrateFallback");
      let { hasRouteChunkByExportName } = await detectRouteChunksIfEnabled(
        cache,
        ctx,
        routeFile,
        { routeFile, viteChildCompiler }
      );
      if (enforceSplitRouteModules) {
        validateRouteChunks({
          ctx,
          id: route.file,
          valid: {
            clientAction: !hasClientAction || hasRouteChunkByExportName.clientAction,
            clientLoader: !hasClientLoader || hasRouteChunkByExportName.clientLoader,
            clientMiddleware: !hasClientMiddleware || hasRouteChunkByExportName.clientMiddleware,
            HydrateFallback: !hasHydrateFallback || hasRouteChunkByExportName.HydrateFallback
          }
        });
      }
      let routeManifestEntry = {
        id: route.id,
        parentId: route.parentId,
        path: route.path,
        index: route.index,
        caseSensitive: route.caseSensitive,
        hasAction: sourceExports.includes("action"),
        hasLoader: sourceExports.includes("loader"),
        hasClientAction,
        hasClientLoader,
        hasClientMiddleware,
        hasDefaultExport: sourceExports.includes("default"),
        hasErrorBoundary: sourceExports.includes("ErrorBoundary"),
        ...getReactRouterManifestBuildAssets(
          ctx,
          viteConfig2,
          viteManifest,
          allDynamicCssFiles,
          `${routeFile}${BUILD_CLIENT_ROUTE_QUERY_STRING}`,
          route
        ),
        clientActionModule: hasRouteChunkByExportName.clientAction ? getPublicModulePathForEntry(
          ctx,
          viteManifest,
          getRouteChunkModuleId(routeFile, "clientAction")
        ) : void 0,
        clientLoaderModule: hasRouteChunkByExportName.clientLoader ? getPublicModulePathForEntry(
          ctx,
          viteManifest,
          getRouteChunkModuleId(routeFile, "clientLoader")
        ) : void 0,
        clientMiddlewareModule: hasRouteChunkByExportName.clientMiddleware ? getPublicModulePathForEntry(
          ctx,
          viteManifest,
          getRouteChunkModuleId(routeFile, "clientMiddleware")
        ) : void 0,
        hydrateFallbackModule: hasRouteChunkByExportName.HydrateFallback ? getPublicModulePathForEntry(
          ctx,
          viteManifest,
          getRouteChunkModuleId(routeFile, "HydrateFallback")
        ) : void 0
      };
      browserRoutes[route.id] = routeManifestEntry;
      if (!routeIds || routeIds.includes(route.id)) {
        serverRoutes[route.id] = routeManifestEntry;
      }
    }
    let fingerprintedValues = { entry, routes: browserRoutes };
    let version = getHash(JSON.stringify(fingerprintedValues), 8);
    let manifestPath = path5.posix.join(
      viteConfig2.build.assetsDir,
      `manifest-${version}.js`
    );
    let url2 = `${ctx.publicPath}${manifestPath}`;
    let nonFingerprintedValues = { url: url2, version };
    let reactRouterBrowserManifest = {
      ...fingerprintedValues,
      ...nonFingerprintedValues,
      sri: void 0
    };
    await writeFileSafe(
      path5.join(getClientBuildDirectory(ctx.reactRouterConfig), manifestPath),
      `window.__reactRouterManifest=${JSON.stringify(
        reactRouterBrowserManifest
      )};`
    );
    let sri = void 0;
    if (ctx.reactRouterConfig.subResourceIntegrity) {
      sri = await generateSriManifest(ctx);
    }
    let reactRouterServerManifest = {
      ...reactRouterBrowserManifest,
      routes: serverRoutes,
      sri
    };
    return {
      reactRouterBrowserManifest,
      reactRouterServerManifest
    };
  };
  let currentReactRouterManifestForDev = null;
  let getReactRouterManifestForDev = async () => {
    let routes = {};
    let routeManifestExports = await getRouteManifestModuleExports(
      viteChildCompiler,
      ctx
    );
    let enforceSplitRouteModules = ctx.reactRouterConfig.future.v8_splitRouteModules === "enforce";
    for (let [key, route] of Object.entries(ctx.reactRouterConfig.routes)) {
      let routeFile = route.file;
      let sourceExports = routeManifestExports[key];
      let hasClientAction = sourceExports.includes("clientAction");
      let hasClientLoader = sourceExports.includes("clientLoader");
      let hasClientMiddleware = sourceExports.includes("clientMiddleware");
      let hasHydrateFallback = sourceExports.includes("HydrateFallback");
      let routeModulePath = combineURLs(
        ctx.publicPath,
        `${resolveFileUrl(
          ctx,
          resolveRelativeRouteFilePath(route, ctx.reactRouterConfig)
        )}`
      );
      if (enforceSplitRouteModules) {
        let { hasRouteChunkByExportName } = await detectRouteChunksIfEnabled(
          cache,
          ctx,
          routeFile,
          { routeFile, viteChildCompiler }
        );
        validateRouteChunks({
          ctx,
          id: route.file,
          valid: {
            clientAction: !hasClientAction || hasRouteChunkByExportName.clientAction,
            clientLoader: !hasClientLoader || hasRouteChunkByExportName.clientLoader,
            clientMiddleware: !hasClientMiddleware || hasRouteChunkByExportName.clientMiddleware,
            HydrateFallback: !hasHydrateFallback || hasRouteChunkByExportName.HydrateFallback
          }
        });
      }
      routes[key] = {
        id: route.id,
        parentId: route.parentId,
        path: route.path,
        index: route.index,
        caseSensitive: route.caseSensitive,
        module: routeModulePath,
        // Split route modules are a build-time optimization
        clientActionModule: void 0,
        clientLoaderModule: void 0,
        clientMiddlewareModule: void 0,
        hydrateFallbackModule: void 0,
        hasAction: sourceExports.includes("action"),
        hasLoader: sourceExports.includes("loader"),
        hasClientAction,
        hasClientLoader,
        hasClientMiddleware,
        hasDefaultExport: sourceExports.includes("default"),
        hasErrorBoundary: sourceExports.includes("ErrorBoundary"),
        imports: []
      };
    }
    let sri = void 0;
    let reactRouterManifestForDev = {
      version: String(Math.random()),
      url: combineURLs(ctx.publicPath, virtual.browserManifest.url),
      hmr: {
        runtime: combineURLs(ctx.publicPath, virtualInjectHmrRuntime.url)
      },
      entry: {
        module: combineURLs(
          ctx.publicPath,
          resolveFileUrl(ctx, ctx.entryClientFilePath)
        ),
        imports: []
      },
      sri,
      routes
    };
    currentReactRouterManifestForDev = reactRouterManifestForDev;
    return reactRouterManifestForDev;
  };
  const loadCssContents = async (viteDevServer, dep) => {
    invariant(
      viteCommand === "serve",
      "loadCssContents is only available in dev mode"
    );
    if (dep.file && isCssModulesFile(dep.file)) {
      return cssModulesManifest[dep.file];
    }
    let transformedCssCode = (await viteDevServer.transformRequest(dep.url))?.code;
    invariant(
      transformedCssCode,
      `Failed to load CSS for ${dep.file ?? dep.url}`
    );
    let cssString = getCssStringFromViteDevModuleCode(transformedCssCode);
    invariant(
      typeof cssString === "string",
      `Failed to extract CSS for ${dep.file ?? dep.url}`
    );
    return cssString;
  };
  return [
    {
      name: "react-router",
      config: async (_viteUserConfig, _viteConfigEnv) => {
        await preloadVite();
        let vite = getVite();
        viteUserConfig = _viteUserConfig;
        viteConfigEnv = _viteConfigEnv;
        viteCommand = viteConfigEnv.command;
        let viteClientConditions = [
          ...vite.defaultClientConditions ?? []
        ];
        logger = vite.createLogger(viteUserConfig.logLevel, {
          prefix: "[react-router]"
        });
        rootDirectory = viteUserConfig.root ?? process.env.REACT_ROUTER_ROOT ?? process.cwd();
        let mode = viteConfigEnv.mode;
        if (viteCommand === "serve") {
          typegenWatcherPromise = watch(rootDirectory, {
            mode,
            rsc: false,
            // ignore `info` logs from typegen since they are redundant when Vite plugin logs are active
            logger: vite.createLogger("warn", { prefix: "[react-router]" })
          });
        }
        await loadDotenv({
          rootDirectory,
          viteUserConfig,
          mode
        });
        reactRouterConfigLoader = await createConfigLoader({
          rootDirectory,
          mode,
          watch: viteCommand === "serve"
        });
        await updatePluginContext();
        let environments = await getEnvironmentsOptions(ctx, viteCommand, {
          viteUserConfig
        });
        let serverEnvironment = getServerEnvironmentValues(
          ctx,
          environments
        )[0];
        invariant(serverEnvironment);
        let clientEnvironment = environments.client;
        invariant(clientEnvironment);
        return {
          __reactRouterPluginContext: ctx,
          appType: viteCommand === "serve" && viteConfigEnv.mode === "production" && ctx.reactRouterConfig.ssr === false ? "spa" : "custom",
          ssr: {
            external: serverEnvironment.resolve?.external,
            resolve: serverEnvironment.resolve
          },
          optimizeDeps: {
            entries: getOptimizeDepsEntries({
              entryClientFilePath: ctx.entryClientFilePath,
              reactRouterConfig: ctx.reactRouterConfig
            }),
            include: [
              // Pre-bundle React dependencies to avoid React duplicates,
              // even if React dependencies are not direct dependencies.
              // https://react.dev/warnings/invalid-hook-call-warning#duplicate-react
              "react",
              "react/jsx-runtime",
              "react/jsx-dev-runtime",
              "react-dom",
              "react-dom/client",
              // Pre-bundle router dependencies to avoid router duplicates.
              // Mismatching routers cause `Error: You must render this element inside a <Remix> element`.
              "react-router",
              "react-router/dom",
              // Check to avoid "Failed to resolve dependency: react-router-dom, present in 'optimizeDeps.include'"
              ...hasDependency({
                name: "react-router-dom",
                rootDirectory: ctx.rootDirectory
              }) ? ["react-router-dom"] : []
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
          resolve: {
            dedupe: [
              // https://react.dev/warnings/invalid-hook-call-warning#duplicate-react
              "react",
              "react-dom",
              // see description for `optimizeDeps.include`
              "react-router",
              "react-router/dom",
              "react-router-dom"
            ],
            conditions: viteCommand === "build" ? viteClientConditions : ["development", ...viteClientConditions]
          },
          base: viteUserConfig.base,
          // When consumer provides an allowlist for files that can be read by
          // the server, ensure that the default entry files are included.
          // If we don't do this and a default entry file is used, the server
          // will throw an error that the file is not allowed to be read.
          // https://vitejs.dev/config/server-options#server-fs-allow
          server: viteUserConfig.server?.fs?.allow ? { fs: { allow: defaultEntries } } : void 0,
          ...ctx.reactRouterConfig.future.v8_viteEnvironmentApi ? {
            environments,
            build: {
              // This isn't honored by the SSR environment config (which seems
              // to be a Vite bug?) so we set it here too.
              ssrEmitAssets: true
            },
            builder: {
              sharedConfigBuild: true,
              sharedPlugins: true,
              async buildApp(builder) {
                invariant(viteConfig);
                viteConfig.logger.info(
                  "Using Vite Environment API (experimental)"
                );
                let { reactRouterConfig } = ctx;
                await cleanBuildDirectory(viteConfig, ctx);
                await builder.build(builder.environments.client);
                let serverEnvironments = getServerEnvironmentValues(
                  ctx,
                  builder.environments
                );
                await Promise.all(serverEnvironments.map(builder.build));
                await cleanViteManifests(environments, ctx);
                let { buildManifest } = ctx;
                invariant(buildManifest, "Expected build manifest");
                await reactRouterConfig.buildEnd?.({
                  buildManifest,
                  reactRouterConfig,
                  viteConfig
                });
              }
            }
          } : {
            build: ctx.environmentBuildContext?.options.build ?? (viteConfigEnv.isSsrBuild ? serverEnvironment.build : clientEnvironment.build)
          }
        };
      },
      configEnvironment(name, options) {
        if (ctx.reactRouterConfig.future.v8_viteEnvironmentApi && (ctx.buildManifest?.serverBundles ? isSsrBundleEnvironmentName(name) : name === "ssr")) {
          const vite = getVite();
          return {
            resolve: {
              external: (
                // This check is required to honor the "noExternal: true" config
                // provided by vite-plugin-cloudflare within this repo. When compiling
                // for Cloudflare, all server dependencies are pre-bundled, but our
                // `ssrExternals` config inadvertently overrides this. This doesn't
                // impact consumers because for them `ssrExternals` is undefined and
                // Cloudflare's "noExternal: true" config remains intact.
                options.resolve?.noExternal === true ? void 0 : ssrExternals
              )
            },
            optimizeDeps: options.optimizeDeps?.noDiscovery === false ? {
              entries: [
                vite.normalizePath(ctx.entryServerFilePath),
                ...Object.values(ctx.reactRouterConfig.routes).map(
                  (route) => resolveRelativeRouteFilePath(
                    route,
                    ctx.reactRouterConfig
                  )
                )
              ],
              include: [
                "react",
                "react/jsx-dev-runtime",
                "react-dom/server",
                "react-router"
              ]
            } : void 0
          };
        }
      },
      async configResolved(resolvedViteConfig) {
        await initEsModuleLexer;
        viteConfig = resolvedViteConfig;
        invariant(viteConfig);
        if (!viteConfig.configFile) {
          throw new Error(
            "The React Router Vite plugin requires the use of a Vite config file"
          );
        }
        let vite = getVite();
        let childCompilerConfigFile = await vite.loadConfigFromFile(
          {
            command: viteConfig.command,
            mode: viteConfig.mode
          },
          viteConfig.configFile
        );
        invariant(
          childCompilerConfigFile,
          "Vite config file was unable to be resolved for React Router child compiler"
        );
        const childCompilerPlugins = await asyncFlatten(
          childCompilerConfigFile.config.plugins ?? []
        );
        viteChildCompiler = await vite.createServer({
          ...viteUserConfig,
          // Ensure child compiler cannot overwrite the default cache directory
          cacheDir: "node_modules/.vite-child-compiler",
          mode: viteConfig.mode,
          server: {
            watch: viteConfig.command === "build" ? null : void 0,
            preTransformRequests: false,
            hmr: false
          },
          configFile: false,
          envFile: false,
          plugins: [
            childCompilerPlugins.filter(
              (plugin) => typeof plugin === "object" && plugin !== null && "name" in plugin && plugin.name !== "react-router" && plugin.name !== "react-router:route-exports" && plugin.name !== "react-router:hmr-updates" && plugin.name !== "react-router:validate-plugin-order"
            ).map((plugin) => ({
              ...plugin,
              configureServer: void 0,
              configurePreviewServer: void 0
            }))
          ]
        });
        await viteChildCompiler.pluginContainer.buildStart({});
      },
      async transform(code, id) {
        if (isCssModulesFile(id)) {
          cssModulesManifest[id] = code;
        }
      },
      async configureServer(viteDevServer) {
        setDevServerHooks({
          // Give the request handler access to the critical CSS in dev to avoid a
          // flash of unstyled content since Vite injects CSS file contents via JS
          getCriticalCss: async (pathname) => {
            return getStylesForPathname({
              rootDirectory: ctx.rootDirectory,
              entryClientFilePath: ctx.entryClientFilePath,
              reactRouterConfig: ctx.reactRouterConfig,
              viteDevServer,
              loadCssContents,
              pathname
            });
          },
          // If an error is caught within the request handler, let Vite fix the
          // stack trace so it maps back to the actual source code
          processRequestError: (error) => {
            if (error instanceof Error) {
              viteDevServer.ssrFixStacktrace(error);
            }
          }
        });
        reactRouterConfigLoader.onChange(
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
            logger.info(colors2.green(message), {
              clear: true,
              timestamp: true
            });
            await updatePluginContext();
            if (configChanged || routeConfigChanged) {
              invalidateVirtualModules(viteDevServer);
            }
          }
        );
        if (ctx.reactRouterConfig.future.v8_viteEnvironmentApi) {
          viteDevServer.middlewares.use(async (req, res, next) => {
            let [reqPathname, reqSearch] = (req.url ?? "").split("?");
            if (reqPathname.endsWith("/@react-router/critical.css")) {
              let pathname = new URLSearchParams(reqSearch).get("pathname");
              if (!pathname) {
                return next("No pathname provided");
              }
              let css = await getStylesForPathname({
                rootDirectory: ctx.rootDirectory,
                entryClientFilePath: ctx.entryClientFilePath,
                reactRouterConfig: ctx.reactRouterConfig,
                viteDevServer,
                loadCssContents,
                pathname
              });
              res.setHeader("Content-Type", "text/css");
              res.end(css);
            } else {
              next();
            }
          });
        }
        return () => {
          if (!viteDevServer.config.server.middlewareMode) {
            viteDevServer.middlewares.use(async (req, res, next) => {
              try {
                let build;
                if (ctx.reactRouterConfig.future.v8_viteEnvironmentApi) {
                  let vite = getVite();
                  let ssrEnvironment = viteDevServer.environments.ssr;
                  if (!vite.isRunnableDevEnvironment(ssrEnvironment)) {
                    next();
                    return;
                  }
                  build = await ssrEnvironment.runner.import(
                    virtual.serverBuild.id
                  );
                } else {
                  build = await viteDevServer.ssrLoadModule(
                    virtual.serverBuild.id
                  );
                }
                let handler = createRequestHandler(build, "development");
                let nodeHandler = async (nodeReq, nodeRes) => {
                  let req2 = await fromNodeRequest(nodeReq, nodeRes);
                  let res2 = await handler(
                    req2,
                    await reactRouterDevLoadContext(req2)
                  );
                  await sendResponse(nodeRes, res2);
                };
                await nodeHandler(req, res);
              } catch (error) {
                next(error);
              }
            });
          }
        };
      },
      configurePreviewServer(previewServer) {
        let cachedHandler = null;
        async function getHandler() {
          if (cachedHandler) return cachedHandler;
          let bundledHandlers = [];
          let buildManifest = ctx.buildManifest ?? (ctx.reactRouterConfig.serverBundles ? await getBuildManifest({
            reactRouterConfig: ctx.reactRouterConfig,
            rootDirectory: ctx.rootDirectory
          }) : null);
          if (buildManifest?.serverBundles) {
            let routesByServerBundleId = getRoutesByServerBundleId(buildManifest);
            for (let bundle of Object.values(buildManifest.serverBundles)) {
              let build = await import(url.pathToFileURL(path5.resolve(ctx.rootDirectory, bundle.file)).href);
              bundledHandlers.push({
                handler: createRequestHandler(build, "production"),
                routes: createPrerenderRoutes(
                  routesByServerBundleId[bundle.id] ?? {}
                )
              });
            }
          } else {
            let serverEntryPath = path5.resolve(
              getServerBuildDirectory(ctx.reactRouterConfig),
              "index.js"
            );
            let build = await import(url.pathToFileURL(serverEntryPath).href);
            bundledHandlers.push({
              handler: createRequestHandler(build, "production"),
              routes: null
            });
          }
          cachedHandler = async (request, loadContext) => {
            let response;
            let handlersToTry = bundledHandlers;
            if (buildManifest?.serverBundles) {
              let pathname = new URL(request.url).pathname;
              handlersToTry = bundledHandlers.map((entry, index) => ({
                entry,
                index,
                matchDepth: matchRoutes2(
                  entry.routes ?? [],
                  pathname,
                  ctx.reactRouterConfig.basename
                )?.length ?? -1
              })).sort(
                (a, b) => b.matchDepth - a.matchDepth || a.index - b.index
              ).map(({ entry }) => entry);
            }
            for (let { handler } of handlersToTry) {
              response = await handler(request, loadContext);
              if (response.status !== 404) {
                return response;
              }
            }
            if (response) {
              return response;
            }
            let url2 = new URL(request.url);
            throw new Error(
              "No handlers were found for the request: " + url2.pathname + url2.search
            );
          };
          return cachedHandler;
        }
        return () => {
          if (!ctx.reactRouterConfig.ssr) {
            return;
          }
          previewServer.middlewares.use(async (req, res, next) => {
            try {
              let handler = await getHandler();
              let request = await fromNodeRequest(req, res);
              let response = await handler(
                request,
                await reactRouterDevLoadContext(request)
              );
              await sendResponse(res, response);
            } catch (error) {
              next(error);
            }
          });
        };
      },
      writeBundle: {
        // After the SSR build is finished, we inspect the Vite manifest for
        // the SSR build and move server-only assets to client assets directory
        async handler() {
          let { future } = ctx.reactRouterConfig;
          if (future.v8_viteEnvironmentApi ? this.environment.name === "client" : !viteConfigEnv.isSsrBuild) {
            return;
          }
          invariant(viteConfig);
          let clientBuildDirectory = getClientBuildDirectory(
            ctx.reactRouterConfig
          );
          let serverBuildDirectory = future.v8_viteEnvironmentApi ? this.environment.config?.build?.outDir : ctx.environmentBuildContext?.options.build?.outDir ?? getServerBuildDirectory(ctx.reactRouterConfig);
          let ssrViteManifest = await loadViteManifest(serverBuildDirectory);
          let ssrAssetPaths = getViteManifestAssetPaths(ssrViteManifest);
          let userSsrEmitAssets = (ctx.reactRouterConfig.future.v8_viteEnvironmentApi ? viteUserConfig.environments?.ssr?.build?.ssrEmitAssets ?? viteUserConfig.environments?.ssr?.build?.emitAssets : null) ?? viteUserConfig.build?.ssrEmitAssets ?? false;
          let movedAssetPaths = [];
          let removedAssetPaths = [];
          let copiedAssetPaths = [];
          for (let ssrAssetPath of ssrAssetPaths) {
            let src = path5.join(serverBuildDirectory, ssrAssetPath);
            let dest = path5.join(clientBuildDirectory, ssrAssetPath);
            if (!userSsrEmitAssets) {
              if (!existsSync(dest)) {
                await mkdir2(path5.dirname(dest), { recursive: true });
                await rename(src, dest);
                movedAssetPaths.push(dest);
              } else {
                await rm(src, { force: true, recursive: true });
                removedAssetPaths.push(dest);
              }
            } else if (!existsSync(dest)) {
              await cp(src, dest, { recursive: true });
              copiedAssetPaths.push(dest);
            }
          }
          if (!userSsrEmitAssets) {
            let ssrCssPaths = Object.values(ssrViteManifest).flatMap(
              (chunk) => chunk.css ?? []
            );
            await Promise.all(
              ssrCssPaths.map(async (cssPath) => {
                let src = path5.join(serverBuildDirectory, cssPath);
                await rm(src, { force: true, recursive: true });
                removedAssetPaths.push(src);
              })
            );
          }
          let cleanedAssetPaths = [...removedAssetPaths, ...movedAssetPaths];
          let handledAssetPaths = [...cleanedAssetPaths, ...copiedAssetPaths];
          let cleanedAssetDirs = new Set(cleanedAssetPaths.map(path5.dirname));
          await Promise.all(
            Array.from(cleanedAssetDirs).map(async (dir) => {
              try {
                const files = await readdir(dir, { recursive: true });
                if (files.length === 0) {
                  await rm(dir, { force: true, recursive: true });
                }
              } catch {
              }
            })
          );
          if (handledAssetPaths.length) {
            viteConfig.logger.info("");
          }
          function logHandledAssets(paths, message) {
            invariant(viteConfig);
            if (paths.length) {
              viteConfig.logger.info(
                [
                  `${colors2.green("\u2713")} ${message}`,
                  ...paths.map(
                    (assetPath) => colors2.dim(path5.relative(ctx.rootDirectory, assetPath))
                  )
                ].join("\n")
              );
            }
          }
          logHandledAssets(
            removedAssetPaths,
            `${removedAssetPaths.length} asset${removedAssetPaths.length > 1 ? "s" : ""} cleaned from React Router server build.`
          );
          logHandledAssets(
            movedAssetPaths,
            `${movedAssetPaths.length} asset${movedAssetPaths.length > 1 ? "s" : ""} moved from React Router server build to client assets.`
          );
          logHandledAssets(
            copiedAssetPaths,
            `${copiedAssetPaths.length} asset${copiedAssetPaths.length > 1 ? "s" : ""} copied from React Router server build to client assets.`
          );
          if (handledAssetPaths.length) {
            viteConfig.logger.info("");
          }
          if (future.unstable_previewServerPrerendering) {
            return;
          }
          process.env.IS_RR_BUILD_REQUEST = "yes";
          if (isPrerenderingEnabled(ctx.reactRouterConfig)) {
            await handlePrerender(
              viteConfig,
              ctx.reactRouterConfig,
              serverBuildDirectory,
              getServerBuildFile(ssrViteManifest),
              clientBuildDirectory
            );
          }
          if (!ctx.reactRouterConfig.ssr) {
            await handleSpaMode(
              viteConfig,
              ctx.reactRouterConfig,
              serverBuildDirectory,
              getServerBuildFile(ssrViteManifest),
              clientBuildDirectory
            );
          }
          if (!ctx.reactRouterConfig.ssr) {
            viteConfig.logger.info(
              [
                "Removing the server build in",
                colors2.green(serverBuildDirectory),
                "due to ssr:false"
              ].join(" ")
            );
            rmSync(serverBuildDirectory, { force: true, recursive: true });
          }
        }
      },
      async buildEnd() {
        await viteChildCompiler?.close();
        await reactRouterConfigLoader.close();
        let typegenWatcher = await typegenWatcherPromise;
        await typegenWatcher?.close();
      }
    },
    {
      name: "react-router:route-chunks-index",
      // This plugin provides the route module "index" since route modules can
      // be chunked and may be made up of multiple smaller modules. This plugin
      // primarily ensures code is never duplicated across a route module and
      // its chunks. If we didn't have this plugin, any app that explicitly
      // imports a route module would result in duplicate code since the app
      // would contain code for both the unprocessed route module and its
      // individual chunks. This is because, since they have different module
      // IDs, they are treated as completely separate modules even though they
      // all reference the same underlying file. This plugin addresses this by
      // ensuring that any explicit imports of a route module resolve to a
      // module that simply re-exports from its underlying chunks, if present.
      async transform(code, id, options) {
        if (viteCommand !== "build") return;
        if (options?.ssr) {
          return;
        }
        if (!isRoute(ctx.reactRouterConfig, id)) {
          return;
        }
        if (isRouteVirtualModule(id)) {
          return;
        }
        let { hasRouteChunks, chunkedExports } = await detectRouteChunksIfEnabled(cache, ctx, id, code);
        if (!hasRouteChunks) {
          return;
        }
        let sourceExports = await getRouteModuleExports(
          viteChildCompiler,
          ctx,
          id
        );
        let isMainChunkExport = (name) => !chunkedExports.includes(name);
        let mainChunkReexports = sourceExports.filter(isMainChunkExport).join(", ");
        let chunkBasePath = `./${path5.basename(id)}`;
        return [
          `export { ${mainChunkReexports} } from "${getRouteChunkModuleId(
            chunkBasePath,
            "main"
          )}";`,
          ...chunkedExports.map(
            (exportName) => `export { ${exportName} } from "${getRouteChunkModuleId(
              chunkBasePath,
              exportName
            )}";`
          )
        ].filter(Boolean).join("\n");
      }
    },
    {
      name: "react-router:build-client-route",
      async transform(code, id, options) {
        if (!id.endsWith(BUILD_CLIENT_ROUTE_QUERY_STRING)) return;
        let routeModuleId = id.replace(BUILD_CLIENT_ROUTE_QUERY_STRING, "");
        let routeFileName = path5.basename(routeModuleId);
        let sourceExports = await getRouteModuleExports(
          viteChildCompiler,
          ctx,
          routeModuleId
        );
        let { chunkedExports = [] } = options?.ssr ? {} : await detectRouteChunksIfEnabled(cache, ctx, id, code);
        let reexports = sourceExports.filter((exportName) => {
          let isRouteEntryExport = options?.ssr && SERVER_ONLY_ROUTE_EXPORTS.includes(exportName) || CLIENT_ROUTE_EXPORTS.includes(exportName);
          let isChunkedExport = chunkedExports.includes(
            exportName
          );
          return isRouteEntryExport && !isChunkedExport;
        }).join(", ");
        return `export { ${reexports} } from "./${routeFileName}";`;
      }
    },
    {
      name: "react-router:split-route-modules",
      async transform(code, id, options) {
        if (options?.ssr) return;
        if (!isRouteChunkModuleId(id)) return;
        invariant(
          viteCommand === "build",
          "Route modules are only split in build mode"
        );
        let chunkName = getRouteChunkNameFromModuleId(id);
        if (!chunkName) {
          throw new Error(`Invalid route chunk name "${chunkName}" in "${id}"`);
        }
        let chunk = await getRouteChunkIfEnabled(
          cache,
          ctx,
          id,
          chunkName,
          code
        );
        let preventEmptyChunkSnippet = ({ reason }) => `Math.random()<0&&console.log(${JSON.stringify(reason)});`;
        if (chunk === null) {
          return preventEmptyChunkSnippet({
            reason: "Split round modules disabled"
          });
        }
        let enforceSplitRouteModules = ctx.reactRouterConfig.future.v8_splitRouteModules === "enforce";
        if (enforceSplitRouteModules && chunkName === "main" && chunk) {
          let exportNames = getExportNames(chunk.code);
          validateRouteChunks({
            ctx,
            id,
            valid: {
              clientAction: !exportNames.includes("clientAction"),
              clientLoader: !exportNames.includes("clientLoader"),
              clientMiddleware: !exportNames.includes("clientMiddleware"),
              HydrateFallback: !exportNames.includes("HydrateFallback")
            }
          });
        }
        return chunk ?? preventEmptyChunkSnippet({ reason: `No ${chunkName} chunk` });
      }
    },
    {
      name: "react-router:virtual-modules",
      enforce: "pre",
      resolveId(id) {
        const vmod = Object.values(virtual).find((vmod2) => vmod2.id === id);
        if (vmod) return vmod.resolvedId;
      },
      async load(id) {
        switch (id) {
          case virtual.serverBuild.resolvedId: {
            let routeIds = getServerBundleRouteIds(this, ctx);
            return await getServerEntry({ routeIds });
          }
          case virtual.serverManifest.resolvedId: {
            let routeIds = getServerBundleRouteIds(this, ctx);
            invariant(viteConfig);
            let reactRouterManifest = viteCommand === "build" ? (await generateReactRouterManifestsForBuild({
              viteConfig,
              routeIds
            })).reactRouterServerManifest : await getReactRouterManifestForDev();
            ctx.reactRouterManifest = reactRouterManifest;
            if (!ctx.reactRouterConfig.ssr) {
              invariant(viteConfig);
              validateSsrFalsePrerenderExports(
                viteConfig,
                ctx,
                reactRouterManifest,
                viteChildCompiler
              );
            }
            return `export default ${jsesc(reactRouterManifest, {
              es6: true
            })};`;
          }
          case virtual.browserManifest.resolvedId: {
            if (viteCommand === "build") {
              throw new Error("This module only exists in development");
            }
            let reactRouterManifest = await getReactRouterManifestForDev();
            let reactRouterManifestString = jsesc(reactRouterManifest, {
              es6: true
            });
            return `window.__reactRouterManifest=${reactRouterManifestString};`;
          }
        }
      }
    },
    {
      name: "react-router:dot-server",
      enforce: "pre",
      async resolveId(id, importer, options) {
        let isOptimizeDeps = viteCommand === "serve" && options?.scan === true;
        if (isOptimizeDeps || options?.ssr) return;
        let isResolving = options?.custom?.["react-router:dot-server"] ?? false;
        if (isResolving) return;
        options.custom = { ...options.custom, "react-router:dot-server": true };
        let resolved = await this.resolve(id, importer, options);
        if (!resolved) return;
        let serverFileRE = /\.server(\.[cm]?[jt]sx?)?$/;
        let serverDirRE = /\/\.server\//;
        let isDotServer = serverFileRE.test(resolved.id) || serverDirRE.test(resolved.id);
        if (!isDotServer) return;
        if (!importer) return;
        if (viteCommand !== "build" && importer.endsWith(".html")) {
          return;
        }
        let vite = getVite();
        let importerShort = vite.normalizePath(
          path5.relative(ctx.rootDirectory, importer)
        );
        if (isRoute(ctx.reactRouterConfig, importer)) {
          let serverOnlyExports = SERVER_ONLY_ROUTE_EXPORTS.map(
            (xport) => `\`${xport}\``
          ).join(", ");
          throw Error(
            [
              colors2.red(`Server-only module referenced by client`),
              "",
              `    '${id}' imported by route '${importerShort}'`,
              "",
              `  React Router automatically removes server-code from these exports:`,
              `    ${serverOnlyExports}`,
              "",
              `  But other route exports in '${importerShort}' depend on '${id}'.`,
              "",
              "  See https://reactrouter.com/explanation/code-splitting#removal-of-server-code",
              ""
            ].join("\n")
          );
        }
        throw Error(
          [
            colors2.red(`Server-only module referenced by client`),
            "",
            `    '${id}' imported by '${importerShort}'`,
            "",
            "  See https://reactrouter.com/explanation/code-splitting#removal-of-server-code",
            ""
          ].join("\n")
        );
      }
    },
    {
      name: "react-router:dot-client",
      async transform(code, id, options) {
        if (!options?.ssr) return;
        let clientFileRE = /\.client(\.[cm]?[jt]sx?)?$/;
        let clientDirRE = /\/\.client\//;
        if (clientFileRE.test(id) || clientDirRE.test(id)) {
          let exports = getExportNames(code);
          return {
            code: exports.map(
              (name) => name === "default" ? "export default undefined;" : `export const ${name} = undefined;`
            ).join("\n"),
            map: null
          };
        }
      }
    },
    {
      name: "react-router:route-exports",
      async transform(code, id, options) {
        if (isRouteChunkModuleId(id)) {
          id = id.split("?")[0];
        }
        let route = getRoute(ctx.reactRouterConfig, id);
        if (!route) return;
        if (!options?.ssr && isSpaModeEnabled(ctx.reactRouterConfig)) {
          let exportNames = getExportNames(code);
          let serverOnlyExports = exportNames.filter((exp) => {
            if (route.id === "root" && exp === "loader") {
              return false;
            }
            return SERVER_ONLY_ROUTE_EXPORTS.includes(exp);
          });
          if (serverOnlyExports.length > 0) {
            let str = serverOnlyExports.map((e) => `\`${e}\``).join(", ");
            let message = `SPA Mode: ${serverOnlyExports.length} invalid route export(s) in \`${route.file}\`: ${str}. See https://reactrouter.com/how-to/spa for more information.`;
            throw Error(message);
          }
          if (route.id !== "root") {
            let hasHydrateFallback = exportNames.some(
              (exp) => exp === "HydrateFallback"
            );
            if (hasHydrateFallback) {
              let message = `SPA Mode: Invalid \`HydrateFallback\` export found in \`${route.file}\`. \`HydrateFallback\` is only permitted on the root route in SPA Mode. See https://reactrouter.com/how-to/spa for more information.`;
              throw Error(message);
            }
          }
        }
        let [filepath] = id.split("?");
        let ast = parse(code, { sourceType: "module" });
        if (!options?.ssr) {
          removeExports(ast, SERVER_ONLY_ROUTE_EXPORTS);
        }
        decorateComponentExportsWithProps(ast);
        return generate(ast, {
          sourceMaps: true,
          filename: id,
          sourceFileName: filepath
        });
      }
    },
    {
      name: "react-router:inject-hmr-runtime",
      enforce: "pre",
      resolveId(id) {
        if (id === virtualInjectHmrRuntime.id) {
          return virtualInjectHmrRuntime.resolvedId;
        }
      },
      async load(id) {
        if (id !== virtualInjectHmrRuntime.resolvedId) return;
        return [
          `import RefreshRuntime from "${virtualHmrRuntime.id}"`,
          "RefreshRuntime.injectIntoGlobalHook(window)",
          "window.$RefreshReg$ = () => {}",
          "window.$RefreshSig$ = () => (type) => type",
          "window.__vite_plugin_react_preamble_installed__ = true"
        ].join("\n");
      }
    },
    {
      name: "react-router:hmr-runtime",
      enforce: "pre",
      resolveId(id) {
        if (id === virtualHmrRuntime.id) return virtualHmrRuntime.resolvedId;
      },
      async load(id) {
        if (id !== virtualHmrRuntime.resolvedId) return;
        let reactRefreshDir = path5.dirname(
          nodeRequire2.resolve("react-refresh/package.json")
        );
        let reactRefreshRuntimePath = path5.join(
          reactRefreshDir,
          "cjs/react-refresh-runtime.development.js"
        );
        return [
          "const exports = {}",
          await readFile(reactRefreshRuntimePath, "utf8"),
          await readFile(
            nodeRequire2.resolve("./static/refresh-utils.mjs"),
            "utf8"
          ),
          "export default exports"
        ].join("\n");
      }
    },
    {
      name: "react-router:react-refresh-babel",
      async transform(code, id, options) {
        if (viteCommand !== "serve") return;
        if (id.includes("/node_modules/")) return;
        let [filepath] = id.split("?");
        let extensionsRE = /\.(jsx?|tsx?|mdx?)$/;
        if (!extensionsRE.test(filepath)) return;
        let devRuntime = "react/jsx-dev-runtime";
        let ssr = options?.ssr === true;
        let isJSX = filepath.endsWith("x");
        let useFastRefresh = !ssr && (isJSX || code.includes(devRuntime));
        if (!useFastRefresh) return;
        if (isRouteVirtualModule(id)) {
          return { code: addRefreshWrapper(ctx.reactRouterConfig, code, id) };
        }
        let result = await babel.transformAsync(code, {
          babelrc: false,
          configFile: false,
          filename: id,
          sourceFileName: filepath,
          parserOpts: {
            sourceType: "module",
            allowAwaitOutsideFunction: true
          },
          plugins: [
            [
              nodeRequire2.resolve("react-refresh/babel"),
              { skipEnvCheck: true }
            ]
          ],
          sourceMaps: true
        });
        if (result === null) return;
        code = result.code;
        let refreshContentRE = /\$Refresh(?:Reg|Sig)\$\(/;
        if (refreshContentRE.test(code)) {
          code = addRefreshWrapper(ctx.reactRouterConfig, code, id);
        }
        return { code, map: result.map };
      }
    },
    {
      name: "react-router:hmr-updates",
      async handleHotUpdate({ server, file, modules, read }) {
        let route = getRoute(ctx.reactRouterConfig, file);
        let hmrEventData = { route: null };
        if (route) {
          let oldRouteMetadata = currentReactRouterManifestForDev?.routes[route.id];
          let newRouteMetadata = await getRouteMetadata(
            cache,
            ctx,
            viteChildCompiler,
            route,
            read
          );
          hmrEventData.route = newRouteMetadata;
          if (!oldRouteMetadata || [
            "hasLoader",
            "hasClientLoader",
            "clientLoaderModule",
            "hasAction",
            "hasClientAction",
            "clientActionModule",
            "hasClientMiddleware",
            "clientMiddlewareModule",
            "hasErrorBoundary",
            "hydrateFallbackModule"
          ].some((key) => oldRouteMetadata[key] !== newRouteMetadata[key])) {
            invalidateVirtualModules(server);
          }
        }
        server.hot.send({
          type: "custom",
          event: "react-router:hmr",
          data: hmrEventData
        });
        return modules;
      }
    },
    {
      name: "react-router-server-change-trigger-client-hmr",
      // This hook is only available in Vite v6+ so this is a no-op in v5.
      // Previously, the server and client modules were shared in a single module
      // graph. This meant that changes to server code automatically resulted in
      // client HMR updates. In Vite v6+, these module graphs are separate from
      // each other, so we need to manually trigger client HMR updates if server
      // code has changed.
      hotUpdate({ server, modules }) {
        if (this.environment.name !== "ssr" && modules.length <= 0) {
          return;
        }
        let clientModules = modules.flatMap(
          (mod) => getParentClientNodes(server.environments.client.moduleGraph, mod)
        );
        for (let clientModule of clientModules) {
          server.environments.client.reloadModule(clientModule);
        }
      }
    },
    prerender({
      config() {
        process.env.IS_RR_BUILD_REQUEST = "yes";
        return {
          // Required as viteConfig.environments.client.build.outDir is only available in Vite v6+
          buildDirectory: getClientBuildDirectory(ctx.reactRouterConfig),
          concurrency: getPrerenderConcurrencyConfig(ctx.reactRouterConfig)
        };
      },
      async requests() {
        invariant(viteConfig);
        let { future } = ctx.reactRouterConfig;
        if (!future.unstable_previewServerPrerendering) {
          return [];
        }
        let requests = [];
        if (isPrerenderingEnabled(ctx.reactRouterConfig)) {
          invariant(ctx.prerenderPaths !== null, "Prerender paths missing");
          invariant(
            ctx.reactRouterManifest !== null,
            "Prerender manifest missing"
          );
          let { reactRouterConfig, reactRouterManifest, prerenderPaths } = ctx;
          assertPrerenderPathsMatchRoutes(
            reactRouterConfig,
            Array.from(prerenderPaths)
          );
          let buildRoutes = createPrerenderRoutes(reactRouterManifest.routes);
          for (let prerenderPath of prerenderPaths) {
            let matches = matchRoutes2(
              buildRoutes,
              `/${prerenderPath}/`.replace(/^\/\/+/, "/")
            );
            if (!matches) {
              continue;
            }
            let leafRoute = matches[matches.length - 1].route;
            let manifestRoute = reactRouterManifest.routes[leafRoute.id];
            let isResourceRoute = manifestRoute && !manifestRoute.hasDefaultExport && !manifestRoute.hasErrorBoundary;
            if (isResourceRoute) {
              if (manifestRoute?.hasLoader) {
                requests.push(
                  // Prerender a .data file for turbo-stream consumption
                  createDataRequest(
                    prerenderPath,
                    reactRouterConfig,
                    [leafRoute.id],
                    true
                  ),
                  // Prerender a raw file for external consumption
                  createResourceRouteRequest(prerenderPath, reactRouterConfig)
                );
              } else {
                viteConfig.logger.warn(
                  `\u26A0\uFE0F Skipping prerendering for resource route without a loader: ${leafRoute.id}`
                );
              }
            } else {
              let hasLoaders = matches.some(
                (m) => reactRouterManifest.routes[m.route.id]?.hasLoader
              );
              if (hasLoaders) {
                requests.push(
                  createDataRequest(prerenderPath, reactRouterConfig, null)
                );
              } else {
                requests.push(
                  createRouteRequest(prerenderPath, reactRouterConfig)
                );
              }
            }
          }
        }
        if (!ctx.reactRouterConfig.ssr) {
          requests.push(createSpaModeRequest(ctx.reactRouterConfig));
        }
        return requests;
      },
      async postProcess(request, response, metadata) {
        invariant(metadata);
        if (metadata.type === "data") {
          let pathname2 = new URL(request.url).pathname;
          if (response.status !== 200 && response.status !== 202) {
            throw new Error(
              `Prerender (data): Received a ${response.status} status code from \`entry.server.tsx\` while prerendering the \`${metadata.path}\` path.
${pathname2}`,
              { cause: response }
            );
          }
          let data = await response.text();
          return {
            files: [
              {
                path: pathname2,
                contents: data
              }
            ],
            // After saving the .data file, request the HTML page.
            // The data is passed along to be embedded in the response header.
            requests: !metadata.isResourceRoute ? [createRouteRequest(metadata.path, ctx.reactRouterConfig, data)] : []
          };
        }
        if (metadata.type === "resource") {
          let pathname2 = new URL(request.url).pathname;
          let contents = new Uint8Array(await response.arrayBuffer());
          if (response.status !== 200) {
            throw new Error(
              `Prerender (resource): Received a ${response.status} status code from \`entry.server.tsx\` while prerendering the \`${pathname2}\` path.
${new TextDecoder().decode(contents)}`
            );
          }
          return [
            {
              path: pathname2,
              contents
            }
          ];
        }
        let html = await response.text();
        if (metadata.type === "spa") {
          if (response.status !== 200) {
            throw new Error(
              `SPA Mode: Received a ${response.status} status code from \`entry.server.tsx\` while prerendering your SPA Fallback HTML file.
` + html
            );
          }
          if (!html.includes("window.__reactRouterContext =") || !html.includes("window.__reactRouterRouteModules =")) {
            throw new Error(
              "SPA Mode: Did you forget to include `<Scripts/>` in your root route? Your pre-rendered HTML cannot hydrate without `<Scripts />`."
            );
          }
          return [
            {
              path: "/__spa-fallback.html",
              contents: html
            }
          ];
        }
        let pathname = new URL(request.url).pathname;
        if (redirectStatusCodes.has(response.status)) {
          let location = response.headers.get("Location");
          let delay = response.status === 302 ? 2 : 0;
          let escapedLocation = escapeHtml(location ?? "");
          let escapedPathname = escapeHtml(pathname);
          html = `<!doctype html>
<head>
<title>Redirecting to: ${escapedLocation}</title>
<meta http-equiv="refresh" content="${delay};url=${escapedLocation}">
<meta name="robots" content="noindex">
</head>
<body>
	<a href="${escapedLocation}">
    Redirecting from <code>${escapedPathname}</code> to <code>${escapedLocation}</code>
  </a>
</body>
</html>`;
        } else if (response.status !== 200) {
          throw new Error(
            `Prerender (html): Received a ${response.status} status code from \`entry.server.tsx\` while prerendering the \`${pathname}\` path.
${html}`
          );
        }
        return [
          {
            path: `${pathname}/index.html`,
            contents: html
          }
        ];
      },
      logFile(outputPath, metadata) {
        invariant(viteConfig);
        invariant(metadata);
        if (metadata.type === "spa") {
          return;
        }
        viteConfig.logger.info(
          `Prerender (${metadata.type}): ${metadata.path} -> ${colors2.bold(outputPath)}`
        );
      },
      async finalize(buildDirectory) {
        invariant(viteConfig);
        let { ssr } = ctx.reactRouterConfig;
        if (!ssr) {
          let spaFallback = path5.join(buildDirectory, "__spa-fallback.html");
          let index = path5.join(buildDirectory, "index.html");
          let finalSpaPath;
          if (existsSync(spaFallback) && !existsSync(index)) {
            await rename(spaFallback, index);
            finalSpaPath = index;
          } else if (existsSync(spaFallback)) {
            finalSpaPath = spaFallback;
          }
          if (finalSpaPath) {
            let prettyPath = path5.relative(viteConfig.root, finalSpaPath);
            if (ctx.prerenderPaths && ctx.prerenderPaths.size > 0) {
              viteConfig.logger.info(
                `Prerender (html): SPA Fallback -> ${colors2.bold(prettyPath)}`
              );
            } else {
              viteConfig.logger.info(
                `SPA Mode: Generated ${colors2.bold(prettyPath)}`
              );
            }
          }
          let serverBuildDirectory = getServerBuildDirectory(
            ctx.reactRouterConfig
          );
          viteConfig.logger.info(
            [
              "Removing the server build in",
              colors2.green(serverBuildDirectory),
              "due to ssr:false"
            ].join(" ")
          );
          rmSync(serverBuildDirectory, { force: true, recursive: true });
        }
      }
    }),
    validatePluginOrder(),
    warnOnClientSourceMaps()
  ];
};
function getParentClientNodes(clientModuleGraph, module, seenNodes = /* @__PURE__ */ new Set()) {
  if (!module.id) {
    return [];
  }
  if (seenNodes.has(module.url)) {
    return [];
  }
  seenNodes.add(module.url);
  let clientModule = clientModuleGraph.getModuleById(module.id);
  if (clientModule) {
    return [clientModule];
  }
  return [...module.importers].flatMap(
    (importer) => getParentClientNodes(clientModuleGraph, importer, seenNodes)
  );
}
function addRefreshWrapper(reactRouterConfig, code, id) {
  let route = getRoute(reactRouterConfig, id);
  let acceptExports = route ? CLIENT_NON_COMPONENT_EXPORTS : [];
  return REACT_REFRESH_HEADER.replaceAll("__SOURCE__", JSON.stringify(id)) + code + REACT_REFRESH_FOOTER.replaceAll("__SOURCE__", JSON.stringify(id)).replaceAll("__ACCEPT_EXPORTS__", JSON.stringify(acceptExports)).replaceAll("__ROUTE_ID__", JSON.stringify(route?.id));
}
var REACT_REFRESH_HEADER = `
import RefreshRuntime from "${virtualHmrRuntime.id}";

const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;

if (import.meta.hot && !inWebWorker) {
  if (!window.__vite_plugin_react_preamble_installed__) {
    throw new Error(
      "React Router Vite plugin can't detect preamble. Something is wrong."
    );
  }

  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    RefreshRuntime.register(type, __SOURCE__ + " " + id)
  };
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}`.replaceAll("\n", "");
var REACT_REFRESH_FOOTER = `
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh(__SOURCE__, currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      __ROUTE_ID__ && window.__reactRouterRouteModuleUpdates.set(__ROUTE_ID__, nextExports);
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate(currentExports, nextExports, __ACCEPT_EXPORTS__);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}`;
function getRoute(pluginConfig, file) {
  let vite = getVite();
  let routePath = vite.normalizePath(
    path5.relative(pluginConfig.appDirectory, file)
  );
  let route = Object.values(pluginConfig.routes).find(
    (r) => vite.normalizePath(r.file) === routePath
  );
  return route;
}
function isRoute(pluginConfig, file) {
  return Boolean(getRoute(pluginConfig, file));
}
async function getRouteMetadata(cache, ctx, viteChildCompiler, route, readRouteFile) {
  let routeFile = route.file;
  let sourceExports = await getRouteModuleExports(
    viteChildCompiler,
    ctx,
    route.file,
    readRouteFile
  );
  let { hasRouteChunkByExportName } = await detectRouteChunksIfEnabled(
    cache,
    ctx,
    routeFile,
    { routeFile, readRouteFile, viteChildCompiler }
  );
  let moduleUrl = combineURLs(
    ctx.publicPath,
    `${resolveFileUrl(
      ctx,
      resolveRelativeRouteFilePath(route, ctx.reactRouterConfig)
    )}`
  );
  let info = {
    id: route.id,
    parentId: route.parentId,
    path: route.path,
    index: route.index,
    caseSensitive: route.caseSensitive,
    url: combineURLs(
      ctx.publicPath,
      "/" + path5.relative(
        ctx.rootDirectory,
        resolveRelativeRouteFilePath(route, ctx.reactRouterConfig)
      )
    ),
    module: `${moduleUrl}?import`,
    // Ensure the Vite dev server responds with a JS module
    clientActionModule: hasRouteChunkByExportName.clientAction ? `${getRouteChunkModuleId(moduleUrl, "clientAction")}` : void 0,
    clientLoaderModule: hasRouteChunkByExportName.clientLoader ? `${getRouteChunkModuleId(moduleUrl, "clientLoader")}` : void 0,
    clientMiddlewareModule: hasRouteChunkByExportName.clientMiddleware ? `${getRouteChunkModuleId(moduleUrl, "clientMiddleware")}` : void 0,
    hydrateFallbackModule: hasRouteChunkByExportName.HydrateFallback ? `${getRouteChunkModuleId(moduleUrl, "HydrateFallback")}` : void 0,
    hasAction: sourceExports.includes("action"),
    hasClientAction: sourceExports.includes("clientAction"),
    hasLoader: sourceExports.includes("loader"),
    hasClientLoader: sourceExports.includes("clientLoader"),
    hasClientMiddleware: sourceExports.includes("clientMiddleware"),
    hasDefaultExport: sourceExports.includes("default"),
    hasErrorBoundary: sourceExports.includes("ErrorBoundary"),
    imports: []
  };
  return info;
}
function isPrerenderingEnabled(reactRouterConfig) {
  return reactRouterConfig.prerender != null && reactRouterConfig.prerender !== false;
}
function isSpaModeEnabled(reactRouterConfig) {
  return reactRouterConfig.ssr === false && !isPrerenderingEnabled(reactRouterConfig);
}
async function getPrerenderBuildAndHandler(viteConfig, serverBuildDirectory, serverBuildFile) {
  let serverBuildPath = path5.join(serverBuildDirectory, serverBuildFile);
  let build = await import(url.pathToFileURL(serverBuildPath).toString());
  let { createRequestHandler: createHandler } = await import("react-router");
  return {
    build,
    handler: createHandler(build, viteConfig.mode)
  };
}
async function handleSpaMode(viteConfig, reactRouterConfig, serverBuildDirectory, serverBuildFile, clientBuildDirectory) {
  let { build, handler } = await getPrerenderBuildAndHandler(
    viteConfig,
    serverBuildDirectory,
    serverBuildFile
  );
  let request = new Request(`http://localhost${reactRouterConfig.basename}`, {
    headers: {
      // Enable SPA mode in the server runtime and only render down to the root
      "X-React-Router-SPA-Mode": "yes"
    }
  });
  let response = await handler(request);
  let html = await response.text();
  let isPrerenderSpaFallback = build.prerender.includes("/");
  let filename = isPrerenderSpaFallback ? "__spa-fallback.html" : "index.html";
  if (response.status !== 200) {
    if (isPrerenderSpaFallback) {
      throw new Error(
        `Prerender: Received a ${response.status} status code from \`entry.server.tsx\` while prerendering your \`${filename}\` file.
` + html
      );
    } else {
      throw new Error(
        `SPA Mode: Received a ${response.status} status code from \`entry.server.tsx\` while prerendering your \`${filename}\` file.
` + html
      );
    }
  }
  if (!html.includes("window.__reactRouterContext =") || !html.includes("window.__reactRouterRouteModules =")) {
    throw new Error(
      "SPA Mode: Did you forget to include `<Scripts/>` in your root route? Your pre-rendered HTML cannot hydrate without `<Scripts />`."
    );
  }
  await writeFile2(path5.join(clientBuildDirectory, filename), html);
  let prettyDir = path5.relative(viteConfig.root, clientBuildDirectory);
  let prettyPath = path5.join(prettyDir, filename);
  if (build.prerender.length > 0) {
    viteConfig.logger.info(
      `Prerender (html): SPA Fallback -> ${colors2.bold(prettyPath)}`
    );
  } else {
    viteConfig.logger.info(`SPA Mode: Generated ${colors2.bold(prettyPath)}`);
  }
}
async function handlePrerender(viteConfig, reactRouterConfig, serverBuildDirectory, serverBuildPath, clientBuildDirectory) {
  let { build, handler } = await getPrerenderBuildAndHandler(
    viteConfig,
    serverBuildDirectory,
    serverBuildPath
  );
  let routes = createPrerenderRoutes(reactRouterConfig.routes);
  for (let path6 of build.prerender) {
    let matches = matchRoutes2(routes, `/${path6}/`.replace(/^\/\/+/, "/"));
    if (!matches) {
      throw new Error(
        `Unable to prerender path because it does not match any routes: ${path6}`
      );
    }
  }
  let buildRoutes = createPrerenderRoutes(build.routes);
  let prerenderSinglePath = async (path6) => {
    let matches = matchRoutes2(buildRoutes, `/${path6}/`.replace(/^\/\/+/, "/"));
    if (!matches) {
      return;
    }
    let leafRoute = matches ? matches[matches.length - 1].route : null;
    let manifestRoute = leafRoute ? build.routes[leafRoute.id]?.module : null;
    let isResourceRoute = manifestRoute && !manifestRoute.default && !manifestRoute.ErrorBoundary;
    if (isResourceRoute) {
      invariant(leafRoute);
      invariant(manifestRoute);
      if (manifestRoute.loader) {
        await prerenderData(
          handler,
          path6,
          [leafRoute.id],
          clientBuildDirectory,
          reactRouterConfig,
          viteConfig
        );
        await prerenderResourceRoute(
          handler,
          path6,
          clientBuildDirectory,
          reactRouterConfig,
          viteConfig
        );
      } else {
        viteConfig.logger.warn(
          `\u26A0\uFE0F Skipping prerendering for resource route without a loader: ${leafRoute?.id}`
        );
      }
    } else {
      let hasLoaders = matches.some(
        (m) => build.assets.routes[m.route.id]?.hasLoader
      );
      let data;
      if (!isResourceRoute && hasLoaders) {
        data = await prerenderData(
          handler,
          path6,
          null,
          clientBuildDirectory,
          reactRouterConfig,
          viteConfig
        );
      }
      await prerenderRoute(
        handler,
        path6,
        clientBuildDirectory,
        reactRouterConfig,
        viteConfig,
        data ? {
          headers: {
            "X-React-Router-Prerender-Data": encodeURI(data)
          }
        } : void 0
      );
    }
  };
  let concurrency = 1;
  let { prerender: prerender2 } = reactRouterConfig;
  if (typeof prerender2 === "object" && "concurrency" in prerender2) {
    concurrency = prerender2.concurrency ?? 1;
  }
  const pMap = await import("p-map");
  await pMap.default(build.prerender, prerenderSinglePath, { concurrency });
}
function getStaticPrerenderPaths(routes) {
  let paths = ["/"];
  let paramRoutes = [];
  function recurse(subtree, prefix = "") {
    for (let route of subtree) {
      let newPath = [prefix, route.path].join("/").replace(/\/\/+/g, "/");
      if (route.path) {
        let segments = route.path.split("/");
        if (segments.some((s) => s.startsWith(":") || s === "*")) {
          paramRoutes.push(route.path);
        } else {
          paths.push(newPath);
        }
      }
      if (route.children) {
        recurse(route.children, newPath);
      }
    }
  }
  recurse(routes);
  return {
    paths: paths.map((p) => p.replace(/\/\/+/g, "/").replace(/(.+)\/$/, "$1")),
    paramRoutes
  };
}
async function prerenderData(handler, prerenderPath, onlyRoutes, clientBuildDirectory, reactRouterConfig, viteConfig, requestInit) {
  let dataRequestPath;
  if (reactRouterConfig.future.unstable_trailingSlashAwareDataRequests) {
    if (prerenderPath.endsWith("/")) {
      dataRequestPath = `${prerenderPath}_.data`;
    } else {
      dataRequestPath = `${prerenderPath}.data`;
    }
  } else {
    if (prerenderPath === "/") {
      dataRequestPath = "/_root.data";
    } else {
      dataRequestPath = `${prerenderPath.replace(/\/$/, "")}.data`;
    }
  }
  let normalizedPath = `${reactRouterConfig.basename}${dataRequestPath}`.replace(/\/\/+/g, "/");
  let url2 = new URL(`http://localhost${normalizedPath}`);
  if (onlyRoutes?.length) {
    url2.searchParams.set("_routes", onlyRoutes.join(","));
  }
  let request = new Request(url2, requestInit);
  let response = await handler(request);
  let data = await response.text();
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(
      `Prerender (data): Received a ${response.status} status code from \`entry.server.tsx\` while prerendering the \`${prerenderPath}\` path.
${normalizedPath}`
    );
  }
  let outfile = path5.join(clientBuildDirectory, ...normalizedPath.split("/"));
  await mkdir2(path5.dirname(outfile), { recursive: true });
  await writeFile2(outfile, data);
  viteConfig.logger.info(
    `Prerender (data): ${prerenderPath} -> ${colors2.bold(
      path5.relative(viteConfig.root, outfile)
    )}`
  );
  return data;
}
var redirectStatusCodes = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
async function prerenderRoute(handler, prerenderPath, clientBuildDirectory, reactRouterConfig, viteConfig, requestInit) {
  let normalizedPath = `${reactRouterConfig.basename}${prerenderPath}/`.replace(
    /\/\/+/g,
    "/"
  );
  let request = new Request(`http://localhost${normalizedPath}`, requestInit);
  let response = await handler(request);
  let html = await response.text();
  if (redirectStatusCodes.has(response.status)) {
    let location = response.headers.get("Location");
    let delay = response.status === 302 ? 2 : 0;
    let escapedLocation = escapeHtml(location ?? "");
    let escapedNormalizedPath = escapeHtml(normalizedPath);
    html = `<!doctype html>
<head>
<title>Redirecting to: ${escapedLocation}</title>
<meta http-equiv="refresh" content="${delay};url=${escapedLocation}">
<meta name="robots" content="noindex">
</head>
<body>
	<a href="${escapedLocation}">
    Redirecting from <code>${escapedNormalizedPath}</code> to <code>${escapedLocation}</code>
  </a>
</body>
</html>`;
  } else if (response.status !== 200) {
    throw new Error(
      `Prerender (html): Received a ${response.status} status code from \`entry.server.tsx\` while prerendering the \`${normalizedPath}\` path.
${html}`
    );
  }
  let outfile = path5.join(
    clientBuildDirectory,
    ...normalizedPath.split("/"),
    "index.html"
  );
  await mkdir2(path5.dirname(outfile), { recursive: true });
  await writeFile2(outfile, html);
  viteConfig.logger.info(
    `Prerender (html): ${prerenderPath} -> ${colors2.bold(
      path5.relative(viteConfig.root, outfile)
    )}`
  );
}
async function prerenderResourceRoute(handler, prerenderPath, clientBuildDirectory, reactRouterConfig, viteConfig, requestInit) {
  let normalizedPath = `${reactRouterConfig.basename}${prerenderPath}/`.replace(/\/\/+/g, "/").replace(/\/$/g, "");
  let request = new Request(`http://localhost${normalizedPath}`, requestInit);
  let response = await handler(request);
  let content = Buffer.from(await response.arrayBuffer());
  if (response.status !== 200) {
    throw new Error(
      `Prerender (resource): Received a ${response.status} status code from \`entry.server.tsx\` while prerendering the \`${normalizedPath}\` path.
${content.toString("utf8")}`
    );
  }
  let outfile = path5.join(clientBuildDirectory, ...normalizedPath.split("/"));
  await mkdir2(path5.dirname(outfile), { recursive: true });
  await writeFile2(outfile, content);
  viteConfig.logger.info(
    `Prerender (resource): ${prerenderPath} -> ${colors2.bold(
      path5.relative(viteConfig.root, outfile)
    )}`
  );
}
async function getPrerenderPaths(prerender2, ssr, routes, logWarning = false) {
  if (prerender2 == null || prerender2 === false) {
    return [];
  }
  let pathsConfig;
  if (typeof prerender2 === "object" && "paths" in prerender2) {
    pathsConfig = prerender2.paths;
  } else {
    pathsConfig = prerender2;
  }
  if (pathsConfig === false) {
    return [];
  }
  let prerenderRoutes = createPrerenderRoutes(routes);
  if (pathsConfig === true) {
    let { paths, paramRoutes } = getStaticPrerenderPaths(prerenderRoutes);
    if (logWarning && !ssr && paramRoutes.length > 0) {
      console.warn(
        colors2.yellow(
          [
            "\u26A0\uFE0F Paths with dynamic/splat params cannot be prerendered when using `prerender: true`. You may want to use the `prerender()` API to prerender the following paths:",
            ...paramRoutes.map((p) => "  - " + p)
          ].join("\n")
        )
      );
    }
    return paths;
  }
  if (typeof pathsConfig === "function") {
    let paths = await pathsConfig({
      getStaticPaths: () => getStaticPrerenderPaths(prerenderRoutes).paths
    });
    return paths;
  }
  return pathsConfig;
}
function groupRoutesByParentId2(manifest) {
  let routes = {};
  Object.values(manifest).forEach((route) => {
    if (route) {
      let parentId = route.parentId || "";
      if (!routes[parentId]) {
        routes[parentId] = [];
      }
      routes[parentId].push(route);
    }
  });
  return routes;
}
function createPrerenderRoutes(manifest, parentId = "", routesByParentId = groupRoutesByParentId2(manifest)) {
  return (routesByParentId[parentId] || []).map((route) => {
    let commonRoute = {
      id: route.id,
      path: route.path
    };
    if (route.index) {
      return {
        index: true,
        ...commonRoute
      };
    }
    return {
      children: createPrerenderRoutes(manifest, route.id, routesByParentId),
      ...commonRoute
    };
  });
}
async function validateSsrFalsePrerenderExports(viteConfig, ctx, manifest, viteChildCompiler) {
  let prerenderPaths = await getPrerenderPaths(
    ctx.reactRouterConfig.prerender,
    ctx.reactRouterConfig.ssr,
    manifest.routes,
    true
  );
  if (prerenderPaths.length === 0) {
    return;
  }
  let prerenderRoutes = createPrerenderRoutes(manifest.routes);
  let prerenderedRoutes = /* @__PURE__ */ new Set();
  for (let path6 of prerenderPaths) {
    let matches = matchRoutes2(
      prerenderRoutes,
      `/${path6}/`.replace(/^\/\/+/, "/")
    );
    invariant(
      matches,
      `Unable to prerender path because it does not match any routes: ${path6}`
    );
    matches.forEach((m) => prerenderedRoutes.add(m.route.id));
  }
  let errors = [];
  let routeExports = await getRouteManifestModuleExports(
    viteChildCompiler,
    ctx
  );
  for (let [routeId, route] of Object.entries(manifest.routes)) {
    let invalidApis = [];
    invariant(route, "Expected a route object in validateSsrFalseExports");
    let exports = routeExports[route.id];
    if (exports.includes("headers")) invalidApis.push("headers");
    if (exports.includes("action")) invalidApis.push("action");
    if (invalidApis.length > 0) {
      errors.push(
        `Prerender: ${invalidApis.length} invalid route export(s) in \`${route.id}\` when pre-rendering with \`ssr:false\`: ${invalidApis.map((a) => `\`${a}\``).join(", ")}.  See https://reactrouter.com/how-to/pre-rendering#invalid-exports for more information.`
      );
    }
    if (!prerenderedRoutes.has(routeId)) {
      if (exports.includes("loader")) {
        errors.push(
          `Prerender: 1 invalid route export in \`${route.id}\` when pre-rendering with \`ssr:false\`: \`loader\`. See https://reactrouter.com/how-to/pre-rendering#invalid-exports for more information.`
        );
      }
      let parentRoute = route.parentId ? manifest.routes[route.parentId] : null;
      while (parentRoute && parentRoute.id !== "root") {
        if (parentRoute.hasLoader && !parentRoute.hasClientLoader) {
          errors.push(
            `Prerender: 1 invalid route export in \`${parentRoute.id}\` when pre-rendering with \`ssr:false\`: \`loader\`. See https://reactrouter.com/how-to/pre-rendering#invalid-exports for more information.`
          );
        }
        parentRoute = parentRoute.parentId && parentRoute.parentId !== "root" ? manifest.routes[parentRoute.parentId] : null;
      }
    }
  }
  if (errors.length > 0) {
    viteConfig.logger.error(colors2.red(errors.join("\n")));
    throw new Error(
      "Invalid route exports found when prerendering with `ssr:false`"
    );
  }
}
function getAddressableRoutes(routes) {
  let nonAddressableIds = /* @__PURE__ */ new Set();
  for (let id in routes) {
    let route = routes[id];
    if (route.index) {
      invariant(
        route.parentId,
        `Expected index route "${route.id}" to have "parentId" set`
      );
      nonAddressableIds.add(route.parentId);
    }
    if (typeof route.path !== "string" && !route.index) {
      nonAddressableIds.add(id);
    }
  }
  return Object.values(routes).filter(
    (route) => !nonAddressableIds.has(route.id)
  );
}
function getRouteBranch(routes, routeId) {
  let branch = [];
  let currentRouteId = routeId;
  while (currentRouteId) {
    let route = routes[currentRouteId];
    invariant(route, `Missing route for ${currentRouteId}`);
    branch.push(route);
    currentRouteId = route.parentId;
  }
  return branch.reverse();
}
function getServerBundleIds(ctx) {
  return ctx.buildManifest?.serverBundles ? Object.keys(ctx.buildManifest.serverBundles) : void 0;
}
function getRoutesByServerBundleId(buildManifest) {
  if (!buildManifest.routeIdToServerBundleId) {
    return {};
  }
  let routesByServerBundleId = {};
  for (let [routeId, serverBundleId] of Object.entries(
    buildManifest.routeIdToServerBundleId
  )) {
    routesByServerBundleId[serverBundleId] ??= {};
    let branch = getRouteBranch(buildManifest.routes, routeId);
    for (let route of branch) {
      routesByServerBundleId[serverBundleId][route.id] = route;
    }
  }
  return routesByServerBundleId;
}
var resolveRouteFileCode = async (ctx, input) => {
  if (typeof input === "string") return input;
  invariant(input.viteChildCompiler);
  return await compileRouteFile(
    input.viteChildCompiler,
    ctx,
    input.routeFile,
    input.readRouteFile
  );
};
function isRootRouteModuleId(ctx, id) {
  return normalizeRelativeFilePath(id, ctx.reactRouterConfig) === ctx.reactRouterConfig.routes.root.file;
}
async function detectRouteChunksIfEnabled(cache, ctx, id, input) {
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
  if (!ctx.reactRouterConfig.future.v8_splitRouteModules) {
    return noRouteChunks();
  }
  if (isRootRouteModuleId(ctx, id)) {
    return noRouteChunks();
  }
  let code = await resolveRouteFileCode(ctx, input);
  if (!routeChunkExportNames.some((exportName) => code.includes(exportName))) {
    return noRouteChunks();
  }
  let cacheKey = normalizeRelativeFilePath(id, ctx.reactRouterConfig) + (typeof input === "string" ? "" : "?read");
  return detectRouteChunks(code, cache, cacheKey);
}
async function getRouteChunkIfEnabled(cache, ctx, id, chunkName, input) {
  if (!ctx.reactRouterConfig.future.v8_splitRouteModules) {
    return null;
  }
  let code = await resolveRouteFileCode(ctx, input);
  let cacheKey = normalizeRelativeFilePath(id, ctx.reactRouterConfig) + (typeof input === "string" ? "" : "?read");
  return getRouteChunkCode(code, chunkName, cache, cacheKey);
}
function validateRouteChunks({
  ctx,
  id,
  valid
}) {
  if (isRootRouteModuleId(ctx, id)) {
    return;
  }
  let invalidChunks = Object.entries(valid).filter(([_, isValid]) => !isValid).map(([chunkName]) => chunkName);
  if (invalidChunks.length === 0) {
    return;
  }
  let plural = invalidChunks.length > 1;
  throw new Error(
    [
      `Error splitting route module: ${normalizeRelativeFilePath(
        id,
        ctx.reactRouterConfig
      )}`,
      invalidChunks.map((name) => `- ${name}`).join("\n"),
      `${plural ? "These exports" : "This export"} could not be split into ${plural ? "their own chunks" : "its own chunk"} because ${plural ? "they share" : "it shares"} code with other exports. You should extract any shared code into its own module and then import it within the route module.`
    ].join("\n\n")
  );
}
async function cleanBuildDirectory(viteConfig, ctx) {
  let buildDirectory = ctx.reactRouterConfig.buildDirectory;
  let isWithinRoot = () => {
    let relativePath = path5.relative(ctx.rootDirectory, buildDirectory);
    return !relativePath.startsWith("..") && !path5.isAbsolute(relativePath);
  };
  if (viteConfig.build.emptyOutDir ?? isWithinRoot()) {
    await rm(buildDirectory, { force: true, recursive: true });
  }
}
async function cleanViteManifests(environmentsOptions, ctx) {
  let viteManifestPaths = Object.entries(environmentsOptions).map(
    ([environmentName, options]) => {
      let outDir = options.build?.outDir;
      invariant(outDir, `Expected build.outDir for ${environmentName}`);
      return path5.join(outDir, ".vite/manifest.json");
    }
  );
  await Promise.all(
    viteManifestPaths.map(async (viteManifestPath) => {
      let manifestExists = existsSync(viteManifestPath);
      if (!manifestExists) return;
      if (!ctx.viteManifestEnabled) {
        await rm(viteManifestPath, { force: true, recursive: true });
      }
      let viteDir = path5.dirname(viteManifestPath);
      let viteDirFiles = await readdir(viteDir, { recursive: true });
      if (viteDirFiles.length === 0) {
        await rm(viteDir, { force: true, recursive: true });
      }
    })
  );
}
async function getBuildManifest({
  reactRouterConfig,
  rootDirectory
}) {
  let { routes, serverBundles, appDirectory } = reactRouterConfig;
  if (!serverBundles) {
    return { routes };
  }
  let { normalizePath } = await import("vite");
  let serverBuildDirectory = getServerBuildDirectory(reactRouterConfig);
  let resolvedAppDirectory = path5.resolve(rootDirectory, appDirectory);
  let rootRelativeRoutes = Object.fromEntries(
    Object.entries(routes).map(([id, route]) => {
      let filePath = path5.join(resolvedAppDirectory, route.file);
      let rootRelativeFilePath = normalizePath(
        path5.relative(rootDirectory, filePath)
      );
      return [id, { ...route, file: rootRelativeFilePath }];
    })
  );
  let buildManifest = {
    serverBundles: {},
    routeIdToServerBundleId: {},
    routes: rootRelativeRoutes
  };
  await Promise.all(
    getAddressableRoutes(routes).map(async (route) => {
      let branch = getRouteBranch(routes, route.id);
      let serverBundleId = await serverBundles({
        branch: branch.map(
          (route2) => configRouteToBranchRoute({
            ...route2,
            // Ensure absolute paths are passed to the serverBundles function
            file: path5.join(resolvedAppDirectory, route2.file)
          })
        )
      });
      if (typeof serverBundleId !== "string") {
        throw new Error(`The "serverBundles" function must return a string`);
      }
      if (reactRouterConfig.future.v8_viteEnvironmentApi) {
        if (!/^[a-zA-Z0-9_]+$/.test(serverBundleId)) {
          throw new Error(
            `The "serverBundles" function must only return strings containing alphanumeric characters and underscores.`
          );
        }
      } else {
        if (!/^[a-zA-Z0-9-_]+$/.test(serverBundleId)) {
          throw new Error(
            `The "serverBundles" function must only return strings containing alphanumeric characters, hyphens and underscores.`
          );
        }
      }
      buildManifest.routeIdToServerBundleId[route.id] = serverBundleId;
      buildManifest.serverBundles[serverBundleId] ??= {
        id: serverBundleId,
        file: normalizePath(
          path5.join(
            path5.relative(
              rootDirectory,
              path5.join(serverBuildDirectory, serverBundleId)
            ),
            reactRouterConfig.serverBuildFile
          )
        )
      };
    })
  );
  return buildManifest;
}
function mergeEnvironmentOptions(base, ...overrides) {
  let vite = getVite();
  return overrides.reduce(
    (merged, override) => vite.mergeConfig(merged, override, false),
    base
  );
}
async function getEnvironmentOptionsResolvers(ctx, viteCommand) {
  let { serverBuildFile, serverModuleFormat } = ctx.reactRouterConfig;
  let packageRoot = path5.dirname(
    nodeRequire2.resolve("@react-router/dev/package.json")
  );
  let { moduleSyncEnabled } = await import(`file:///${path5.join(packageRoot, "module-sync-enabled/index.mjs")}`);
  let vite = getVite();
  function getBaseOptions({
    viteUserConfig
  }) {
    const rollupOptions = {
      preserveEntrySignatures: "exports-only",
      // Silence Rollup "use client" warnings
      // Adapted from https://github.com/vitejs/vite-plugin-react/pull/144
      onwarn(warning, defaultHandler) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE" && warning.message.includes("use client")) {
          return;
        }
        let userHandler = viteUserConfig.build?.rollupOptions?.onwarn;
        if (userHandler) {
          userHandler(warning, defaultHandler);
        } else {
          defaultHandler(warning);
        }
      }
    };
    return {
      build: {
        cssMinify: viteUserConfig.build?.cssMinify ?? true,
        manifest: true,
        // The manifest is enabled for all builds to detect SSR-only assets
        rollupOptions
      }
    };
  }
  function getBaseServerOptions({
    viteUserConfig
  }) {
    let maybeModuleSyncConditions = [
      ...moduleSyncEnabled ? ["module-sync"] : []
    ];
    let maybeDevelopmentConditions = viteCommand === "build" ? [] : ["development"];
    let maybeDefaultServerConditions = vite.defaultServerConditions || [];
    let defaultExternalConditions = ["node"];
    let baseConditions = [
      ...maybeDevelopmentConditions,
      ...maybeModuleSyncConditions
    ];
    return mergeEnvironmentOptions(getBaseOptions({ viteUserConfig }), {
      resolve: {
        external: (
          // If `v8_viteEnvironmentApi` is `true`, `resolve.external` is set in the `configEnvironment` hook
          ctx.reactRouterConfig.future.v8_viteEnvironmentApi ? void 0 : ssrExternals
        ),
        conditions: [...baseConditions, ...maybeDefaultServerConditions],
        externalConditions: [...baseConditions, ...defaultExternalConditions]
      },
      build: {
        // We move SSR-only assets to client assets. Note that the
        // SSR build can also emit code-split JS files (e.g., by
        // dynamic import) under the same assets directory
        // regardless of "ssrEmitAssets" option, so we also need to
        // keep these JS files to be kept as-is.
        ssrEmitAssets: true,
        copyPublicDir: false,
        // The client only uses assets in the public directory
        rollupOptions: {
          input: (ctx.reactRouterConfig.future.v8_viteEnvironmentApi ? viteUserConfig.environments?.ssr?.build?.rollupOptions?.input : viteUserConfig.build?.rollupOptions?.input) ?? virtual.serverBuild.id,
          output: {
            entryFileNames: serverBuildFile,
            format: serverModuleFormat
          }
        }
      }
    });
  }
  let environmentOptionsResolvers = {
    client: ({ viteUserConfig }) => mergeEnvironmentOptions(getBaseOptions({ viteUserConfig }), {
      build: {
        rollupOptions: {
          input: [
            ctx.entryClientFilePath,
            ...Object.values(ctx.reactRouterConfig.routes).flatMap(
              (route) => {
                let routeFilePath = path5.resolve(
                  ctx.reactRouterConfig.appDirectory,
                  route.file
                );
                let isRootRoute = route.file === ctx.reactRouterConfig.routes.root.file;
                let code = readFileSync(routeFilePath, "utf-8");
                return [
                  `${routeFilePath}${BUILD_CLIENT_ROUTE_QUERY_STRING}`,
                  ...ctx.reactRouterConfig.future.v8_splitRouteModules && !isRootRoute ? routeChunkExportNames.map(
                    (exportName) => code.includes(exportName) ? getRouteChunkModuleId(routeFilePath, exportName) : null
                  ) : []
                ].filter(isNonNullable);
              }
            )
          ],
          output: (ctx.reactRouterConfig.future.v8_viteEnvironmentApi ? viteUserConfig?.environments?.client?.build?.rollupOptions?.output : viteUserConfig?.build?.rollupOptions?.output) ?? {
            entryFileNames: ({ moduleIds }) => {
              let routeChunkModuleId = moduleIds.find(isRouteChunkModuleId);
              let routeChunkName = routeChunkModuleId ? getRouteChunkNameFromModuleId(routeChunkModuleId)?.replace(
                "unstable_",
                ""
              ) : null;
              let routeChunkSuffix = routeChunkName ? `-${kebabCase(routeChunkName)}` : "";
              let assetsDir = (ctx.reactRouterConfig.future.v8_viteEnvironmentApi ? viteUserConfig?.environments?.client?.build?.assetsDir : null) ?? viteUserConfig?.build?.assetsDir ?? "assets";
              return path5.posix.join(
                assetsDir,
                `[name]${routeChunkSuffix}-[hash].js`
              );
            }
          }
        },
        outDir: getClientBuildDirectory(ctx.reactRouterConfig)
      }
    })
  };
  let serverBundleIds = getServerBundleIds(ctx);
  if (serverBundleIds) {
    for (let serverBundleId of serverBundleIds) {
      const environmentName = `${SSR_BUNDLE_PREFIX}${serverBundleId}`;
      environmentOptionsResolvers[environmentName] = ({ viteUserConfig }) => mergeEnvironmentOptions(
        getBaseServerOptions({ viteUserConfig }),
        {
          build: {
            outDir: getServerBuildDirectory(ctx.reactRouterConfig, {
              serverBundleId
            })
          }
        },
        // Ensure server bundle environments extend the user's SSR
        // environment config if it exists
        viteUserConfig.environments?.ssr ?? {}
      );
    }
  } else {
    environmentOptionsResolvers.ssr = ({ viteUserConfig }) => mergeEnvironmentOptions(getBaseServerOptions({ viteUserConfig }), {
      build: {
        outDir: getServerBuildDirectory(ctx.reactRouterConfig)
      }
    });
  }
  return environmentOptionsResolvers;
}
function resolveEnvironmentsOptions(environmentResolvers, resolverOptions) {
  let environmentOptions = {};
  for (let [environmentName, resolver] of Object.entries(
    environmentResolvers
  )) {
    environmentOptions[environmentName] = resolver(resolverOptions);
  }
  return environmentOptions;
}
async function getEnvironmentsOptions(ctx, viteCommand, resolverOptions) {
  let environmentOptionsResolvers = await getEnvironmentOptionsResolvers(
    ctx,
    viteCommand
  );
  return resolveEnvironmentsOptions(
    environmentOptionsResolvers,
    resolverOptions
  );
}
function isNonNullable(x) {
  return x != null;
}
async function asyncFlatten(arr) {
  do {
    arr = (await Promise.all(arr)).flat(Infinity);
  } while (arr.some((v) => v?.then));
  return arr;
}
function assertPrerenderPathsMatchRoutes(config, prerenderPaths) {
  let routes = createPrerenderRoutes(config.routes);
  for (let path6 of prerenderPaths) {
    let matches = matchRoutes2(routes, `/${path6}/`.replace(/^\/\/+/, "/"));
    if (!matches) {
      throw new Error(
        `Unable to prerender path because it does not match any routes: ${path6}`
      );
    }
  }
}
function getPrerenderConcurrencyConfig(reactRouterConfig) {
  let concurrency = 1;
  let { prerender: prerender2 } = reactRouterConfig;
  if (typeof prerender2 === "object" && "concurrency" in prerender2) {
    concurrency = prerender2.concurrency ?? 1;
  }
  return concurrency;
}
function createDataRequest(prerenderPath, reactRouterConfig, onlyRoutes, isResourceRoute) {
  let normalizedPath = `${reactRouterConfig.basename}${prerenderPath === "/" ? "/_root.data" : `${prerenderPath.replace(/\/$/, "")}.data`}`.replace(/\/\/+/g, "/");
  let url2 = new URL(`http://localhost${normalizedPath}`);
  if (onlyRoutes?.length) {
    url2.searchParams.set("_routes", onlyRoutes.join(","));
  }
  return {
    request: new Request(url2),
    metadata: { type: "data", path: prerenderPath, isResourceRoute }
  };
}
function createRouteRequest(prerenderPath, reactRouterConfig, data) {
  let normalizedPath = `${reactRouterConfig.basename}${prerenderPath}/`.replace(
    /\/\/+/g,
    "/"
  );
  let headers = new Headers();
  if (data) {
    let encodedData = encodeURI(data);
    if (encodedData.length < 8 * 1024) {
      headers.set("X-React-Router-Prerender-Data", encodedData);
    }
  }
  return {
    request: new Request(`http://localhost${normalizedPath}`, { headers }),
    metadata: { type: "html", path: prerenderPath }
  };
}
function createResourceRouteRequest(prerenderPath, reactRouterConfig, requestInit) {
  let normalizedPath = `${reactRouterConfig.basename}${prerenderPath}/`.replace(/\/\/+/g, "/").replace(/\/$/g, "");
  return {
    request: new Request(`http://localhost${normalizedPath}`, requestInit),
    metadata: { type: "resource", path: prerenderPath }
  };
}
function createSpaModeRequest(reactRouterConfig) {
  return {
    request: new Request(`http://localhost${reactRouterConfig.basename}`, {
      headers: {
        // Enable SPA mode in the server runtime and only render down to the root
        "X-React-Router-SPA-Mode": "yes"
      }
    }),
    metadata: { type: "spa", path: "/" }
  };
}
var ESCAPE_REGEX = /[&><\u2028\u2029]/g;
var ESCAPE_LOOKUP = {
  "&": "\\u0026",
  ">": "\\u003e",
  "<": "\\u003c",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escapeHtml(html) {
  return html.replace(ESCAPE_REGEX, (match) => ESCAPE_LOOKUP[match]);
}

export {
  create,
  removeExports,
  hasDependency,
  detectRouteChunks,
  getOptimizeDepsEntries,
  loadDotenv,
  validatePluginOrder,
  warnOnClientSourceMaps,
  prerender,
  resolveViteConfig,
  extractPluginContext,
  getServerEnvironmentKeys,
  reactRouterVitePlugin,
  getPrerenderPaths,
  cleanBuildDirectory,
  cleanViteManifests,
  getEnvironmentOptionsResolvers,
  resolveEnvironmentsOptions
};
