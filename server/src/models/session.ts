import {type SessionData} from "@hono/session";

interface UserSessionData extends SessionData {
  userId: number;
  username: string;
  darkTheme: boolean;
}

export type {UserSessionData};
