/**
 * @react-router/remix-routes-option-adapter v7.15.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */

// manifest.ts
function routeManifestToRouteConfig(routeManifest, rootId = "root") {
  let routeConfigById = {};
  for (let id in routeManifest) {
    let route = routeManifest[id];
    routeConfigById[id] = {
      id: route.id,
      file: route.file,
      path: route.path,
      index: route.index,
      caseSensitive: route.caseSensitive
    };
  }
  let routeConfig = [];
  for (let id in routeConfigById) {
    let route = routeConfigById[id];
    let parentId = routeManifest[route.id].parentId;
    if (parentId === rootId) {
      routeConfig.push(route);
    } else {
      let parentRoute = parentId && routeConfigById[parentId];
      if (parentRoute) {
        parentRoute.children = parentRoute.children || [];
        parentRoute.children.push(route);
      }
    }
  }
  return routeConfig;
}

// normalizeSlashes.ts
import path from "path";
function normalizeSlashes(file) {
  return file.replaceAll(path.win32.sep, "/");
}

// defineRoutes.ts
var defineRoutes = (callback) => {
  let routes = /* @__PURE__ */ Object.create(null);
  let parentRoutes = [];
  let alreadyReturned = false;
  let defineRoute = (path2, file, optionsOrChildren, children) => {
    if (alreadyReturned) {
      throw new Error(
        "You tried to define routes asynchronously but started defining routes before the async work was done. Please await all async data before calling `defineRoutes()`"
      );
    }
    let options;
    if (typeof optionsOrChildren === "function") {
      options = {};
      children = optionsOrChildren;
    } else {
      options = optionsOrChildren || {};
    }
    let route = {
      path: path2 ? path2 : void 0,
      index: options.index ? true : void 0,
      caseSensitive: options.caseSensitive ? true : void 0,
      id: options.id || createRouteId(file),
      parentId: parentRoutes.length > 0 ? parentRoutes[parentRoutes.length - 1].id : "root",
      file
    };
    if (route.id in routes) {
      throw new Error(
        `Unable to define routes with duplicate route id: "${route.id}"`
      );
    }
    routes[route.id] = route;
    if (children) {
      parentRoutes.push(route);
      children();
      parentRoutes.pop();
    }
  };
  callback(defineRoute);
  alreadyReturned = true;
  return routes;
};
function createRouteId(file) {
  return normalizeSlashes(stripFileExtension(file));
}
function stripFileExtension(file) {
  return file.replace(/\.[a-z0-9]+$/i, "");
}

// index.ts
async function remixRoutesOptionAdapter(routes) {
  let routeManifest = await routes(defineRoutes);
  return routeManifestToRouteConfig(routeManifest);
}
export {
  remixRoutesOptionAdapter
};
