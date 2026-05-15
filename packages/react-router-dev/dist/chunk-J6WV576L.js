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

// vite/node-adapter.ts
import { createRequest } from "@remix-run/node-fetch-server";
async function fromNodeRequest(nodeReq, nodeRes) {
  invariant(
    nodeReq.originalUrl,
    "Expected `nodeReq.originalUrl` to be defined"
  );
  nodeReq.url = nodeReq.originalUrl;
  return createRequest(nodeReq, nodeRes);
}

export {
  fromNodeRequest
};
