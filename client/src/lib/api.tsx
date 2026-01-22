import {type Client, hcWithType} from "server/dist/client"

/** Server URL with environment override for local development */
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

/** Typed Hono RPC client for type-safe API communication */
export const api: Client = hcWithType(SERVER_URL);