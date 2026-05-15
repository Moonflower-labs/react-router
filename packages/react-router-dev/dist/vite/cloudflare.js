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
  fromNodeRequest
} from "../chunk-J6WV576L.js";
import {
  loadConfig
} from "../chunk-KH3J56LY.js";
import "../chunk-ZZD5RYKL.js";
import {
  preloadVite
} from "../chunk-A5MD2G7J.js";
import "../chunk-QI2ZSS2B.js";

// vite/cloudflare-dev-proxy.ts
import { sendResponse } from "@remix-run/node-fetch-server";
import { createRequestHandler } from "react-router";
var serverBuildId = "virtual:react-router/server-build";
function importWrangler() {
  try {
    return import("wrangler");
  } catch (e) {
    throw Error("Could not import `wrangler`. Do you have it installed?");
  }
}
var PLUGIN_NAME = "react-router-cloudflare-vite-dev-proxy";
var cloudflareDevProxyVitePlugin = (options = {}) => {
  let { getLoadContext, ...restOptions } = options;
  const workerdConditions = ["workerd", "worker"];
  let future;
  return {
    name: PLUGIN_NAME,
    config: async (config, configEnv) => {
      await preloadVite();
      const externalConditions = ["node"];
      let configResult = await loadConfig({
        rootDirectory: config.root ?? process.cwd(),
        mode: configEnv.mode
      });
      if (!configResult.ok) {
        throw new Error(configResult.error);
      }
      future = configResult.value.future;
      return {
        ssr: {
          resolve: {
            externalConditions: [...workerdConditions, ...externalConditions]
          }
        }
      };
    },
    configEnvironment: async (name, options2) => {
      if (!future.v8_viteEnvironmentApi) {
        return;
      }
      if (name !== "client") {
        options2.resolve = options2.resolve ?? {};
        options2.resolve.externalConditions = [
          ...workerdConditions,
          ...options2.resolve?.externalConditions ?? []
        ];
      }
    },
    configResolved: (viteConfig) => {
      let pluginIndex = (name) => viteConfig.plugins.findIndex((plugin) => plugin.name === name);
      let reactRouterPluginIndex = pluginIndex("react-router");
      if (reactRouterPluginIndex >= 0 && reactRouterPluginIndex < pluginIndex(PLUGIN_NAME)) {
        throw new Error(
          `The "${PLUGIN_NAME}" plugin should be placed before the React Router plugin in your Vite config file`
        );
      }
    },
    configureServer: async (viteDevServer) => {
      let context;
      let getContext = async () => {
        let { getPlatformProxy } = await importWrangler();
        let { dispose, ...cloudflare } = await getPlatformProxy(
          restOptions
        );
        return { cloudflare };
      };
      return () => {
        if (!viteDevServer.config.server.middlewareMode) {
          viteDevServer.middlewares.use(async (nodeReq, nodeRes, next) => {
            try {
              let build = await viteDevServer.ssrLoadModule(
                serverBuildId
              );
              let handler = createRequestHandler(build, "development");
              let req = await fromNodeRequest(nodeReq, nodeRes);
              context ??= await getContext();
              let loadContext = getLoadContext ? await getLoadContext({ request: req, context }) : context;
              let res = await handler(req, loadContext);
              await sendResponse(nodeRes, res);
            } catch (error) {
              next(error);
            }
          });
        }
      };
    }
  };
};
export {
  cloudflareDevProxyVitePlugin as cloudflareDevProxy
};
