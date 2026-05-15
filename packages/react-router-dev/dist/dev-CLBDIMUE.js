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
  getSession,
  start,
  stop
} from "./chunk-5TY6XQ2H.js";
import {
  getVite,
  preloadVite
} from "./chunk-A5MD2G7J.js";
import "./chunk-QI2ZSS2B.js";

// vite/dev.ts
import colors from "picocolors";
async function dev(root, {
  clearScreen,
  config: configFile,
  cors,
  force,
  host,
  logLevel,
  mode,
  open,
  port,
  strictPort
}) {
  await preloadVite();
  let vite = getVite();
  let server = await vite.createServer({
    root,
    mode,
    configFile,
    server: { open, cors, host, port, strictPort },
    optimizeDeps: { force },
    clearScreen,
    logLevel
  });
  if (!server.config.plugins.find(
    (plugin) => plugin.name === "react-router" || plugin.name === "react-router/rsc"
  )) {
    console.error(
      colors.red("React Router Vite plugin not found in Vite config")
    );
    process.exit(1);
  }
  await server.listen();
  server.printUrls();
  let customShortcuts = [
    {
      key: "p",
      description: "start/stop the profiler",
      async action(server2) {
        if (getSession()) {
          await stop(server2.config.logger.info);
        } else {
          await start(() => {
            server2.config.logger.info("Profiler started");
          });
        }
      }
    }
  ];
  server.bindCLIShortcuts({ print: true, customShortcuts });
}
export {
  dev
};
