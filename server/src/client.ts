import {hc} from "hono/client";
import type {app} from "./index";

export type AppType = typeof app;
export type Client = ReturnType<typeof hc<AppType>>;

export const hcWithType = (baseUrl: string): Client =>
  hc<AppType>(baseUrl, {
    init: {
      credentials: "include",
    },
  });