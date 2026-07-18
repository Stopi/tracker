import {type Client, hcWithType} from "server/dist/client"

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export const api: Client = hcWithType(SERVER_URL);
