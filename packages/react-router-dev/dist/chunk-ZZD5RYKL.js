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

// config/routes.ts
import * as Path from "pathe";
import * as v from "valibot";
import pick from "lodash/pick.js";
function setAppDirectory(directory) {
  globalThis.__reactRouterAppDirectory = directory;
}
function getAppDirectory() {
  invariant(globalThis.__reactRouterAppDirectory);
  return globalThis.__reactRouterAppDirectory;
}
var routeConfigEntrySchema = v.pipe(
  v.custom((value) => {
    return !(typeof value === "object" && value !== null && "then" in value && "catch" in value);
  }, "Invalid type: Expected object but received a promise. Did you forget to await?"),
  v.object({
    id: v.optional(
      v.pipe(
        v.string(),
        v.notValue("root", "A route cannot use the reserved id 'root'.")
      )
    ),
    path: v.optional(v.string()),
    index: v.optional(v.boolean()),
    caseSensitive: v.optional(v.boolean()),
    file: v.string(),
    children: v.optional(v.array(v.lazy(() => routeConfigEntrySchema)))
  })
);
var resolvedRouteConfigSchema = v.array(routeConfigEntrySchema);
function validateRouteConfig({
  routeConfigFile,
  routeConfig
}) {
  if (!routeConfig) {
    return {
      valid: false,
      message: `Route config must be the default export in "${routeConfigFile}".`
    };
  }
  if (!Array.isArray(routeConfig)) {
    return {
      valid: false,
      message: `Route config in "${routeConfigFile}" must be an array.`
    };
  }
  let { issues } = v.safeParse(resolvedRouteConfigSchema, routeConfig);
  if (issues?.length) {
    let { root, nested } = v.flatten(issues);
    return {
      valid: false,
      message: [
        `Route config in "${routeConfigFile}" is invalid.`,
        root ? `${root}` : [],
        nested ? Object.entries(nested).map(
          ([path, message]) => `Path: routes.${path}
${message}`
        ) : []
      ].flat().join("\n\n")
    };
  }
  return {
    valid: true,
    routeConfig
  };
}
var createConfigRouteOptionKeys = [
  "id",
  "index",
  "caseSensitive"
];
function route(path, file, optionsOrChildren, children) {
  let options = {};
  if (Array.isArray(optionsOrChildren) || !optionsOrChildren) {
    children = optionsOrChildren;
  } else {
    options = optionsOrChildren;
  }
  return {
    file,
    children,
    path: path ?? void 0,
    ...pick(options, createConfigRouteOptionKeys)
  };
}
var createIndexOptionKeys = ["id"];
function index(file, options) {
  return {
    file,
    index: true,
    ...pick(options, createIndexOptionKeys)
  };
}
var createLayoutOptionKeys = ["id"];
function layout(file, optionsOrChildren, children) {
  let options = {};
  if (Array.isArray(optionsOrChildren) || !optionsOrChildren) {
    children = optionsOrChildren;
  } else {
    options = optionsOrChildren;
  }
  return {
    file,
    children,
    ...pick(options, createLayoutOptionKeys)
  };
}
function prefix(prefixPath, routes) {
  return routes.map((route2) => {
    if (route2.index || typeof route2.path === "string") {
      return {
        ...route2,
        path: route2.path ? joinRoutePaths(prefixPath, route2.path) : prefixPath,
        children: route2.children
      };
    } else if (route2.children) {
      return {
        ...route2,
        children: prefix(prefixPath, route2.children)
      };
    }
    return route2;
  });
}
function relative2(directory) {
  return {
    /**
     * Helper function for creating a route config entry, for use within
     * `routes.ts`. Note that this helper has been scoped, meaning that file
     * path will be resolved relative to the directory provided to the
     * `relative` call that created this helper.
     */
    route: (path, file, ...rest) => {
      return route(path, Path.resolve(directory, file), ...rest);
    },
    /**
     * Helper function for creating a route config entry for an index route, for
     * use within `routes.ts`. Note that this helper has been scoped, meaning
     * that file path will be resolved relative to the directory provided to the
     * `relative` call that created this helper.
     */
    index: (file, ...rest) => {
      return index(Path.resolve(directory, file), ...rest);
    },
    /**
     * Helper function for creating a route config entry for a layout route, for
     * use within `routes.ts`. Note that this helper has been scoped, meaning
     * that file path will be resolved relative to the directory provided to the
     * `relative` call that created this helper.
     */
    layout: (file, ...rest) => {
      return layout(Path.resolve(directory, file), ...rest);
    },
    // Passthrough of helper functions that don't need relative scoping so that
    // a complete API is still provided.
    prefix
  };
}
function configRoutesToRouteManifest(appDirectory, routes) {
  let routeManifest = {};
  function walk(route2, parentId) {
    let id = route2.id || createRouteId(route2.file);
    let manifestItem = {
      id,
      parentId,
      file: Path.isAbsolute(route2.file) ? Path.relative(appDirectory, route2.file) : route2.file,
      path: route2.path,
      index: route2.index,
      caseSensitive: route2.caseSensitive
    };
    if (routeManifest.hasOwnProperty(id)) {
      throw new Error(
        `Unable to define routes with duplicate route id: "${id}"`
      );
    }
    routeManifest[id] = manifestItem;
    if (route2.children) {
      for (let child of route2.children) {
        walk(child, id);
      }
    }
  }
  for (let route2 of routes) {
    walk(route2);
  }
  return routeManifest;
}
function createRouteId(file) {
  return Path.normalize(stripFileExtension(file));
}
function stripFileExtension(file) {
  return file.replace(/\.[a-z0-9]+$/i, "");
}
function joinRoutePaths(path1, path2) {
  return [
    path1.replace(/\/+$/, ""),
    // Remove trailing slashes
    path2.replace(/^\/+/, "")
    // Remove leading slashes
  ].join("/");
}

export {
  setAppDirectory,
  getAppDirectory,
  validateRouteConfig,
  route,
  index,
  layout,
  prefix,
  relative2 as relative,
  configRoutesToRouteManifest
};
