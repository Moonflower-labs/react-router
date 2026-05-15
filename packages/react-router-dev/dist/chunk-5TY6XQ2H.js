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

// vite/profiler.ts
import fs from "fs";
import path from "path";
import colors from "picocolors";
var getSession = () => global.__reactRouter_profile_session;
var start = async (callback) => {
  let inspector = await import("inspector").then((r) => r.default);
  let session = global.__reactRouter_profile_session = new inspector.Session();
  session.connect();
  session.post("Profiler.enable", () => {
    session.post("Profiler.start", callback);
  });
};
var profileCount = 0;
var stop = (log) => {
  let session = getSession();
  if (!session) return;
  return new Promise((res, rej) => {
    session.post("Profiler.stop", (err, { profile }) => {
      if (err) return rej(err);
      let outPath = path.resolve(`./react-router-${profileCount++}.cpuprofile`);
      fs.writeFileSync(outPath, JSON.stringify(profile));
      log(
        colors.yellow(
          `CPU profile written to ${colors.white(colors.dim(outPath))}`
        )
      );
      global.__reactRouter_profile_session = void 0;
      res();
    });
  });
};

export {
  getSession,
  start,
  stop
};
