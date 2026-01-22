import {Hono} from "hono";
import {cors} from "hono/cors";
import {type Session, useSession, useSessionStorage} from "@hono/session";
import {sessionStorage} from "./models/redis";
import type {UserSessionData} from "@server/models/session";
import session from "./controllers/session";
import show from "./controllers/show";
import episode from "@server/controllers/episode";
import settings from "@server/controllers/settings";

const app = new Hono<{ Variables: { session: Session<UserSessionData>, userId: number } }>()
  .use(
    "*",
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    })
  )
  .use(
    useSessionStorage({
      get: sessionStorage.get,
      set: sessionStorage.set,
      delete: sessionStorage.delete,
    })
  )
  .use(
    useSession<UserSessionData>({
      secret: process.env.AUTH_SECRET || "default-secret-change-in-production-min-32-chars",
    })
  )
  // Auth middleware - runs before all routes
  .use("*", async (c, next) => {
    // Allow POST requests to /session (login)
    if (c.req.path.startsWith("/session") && c.req.method === "POST") { // authentication
      return next();
    }

    try {
      const data = await c.var.session.get();
      if (!data || !data.userId) {
        return c.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Expose userId directly in c.var
      c.set("userId", data.userId);
    } catch (err) {
      console.error("Session error:", err);
      return c.json({ error: "Session storage unavailable" }, { status: 503 });
    }

    return next();
  })
  .get("/", (c) => {
    return c.text("Hello!");
  })
  .route("/session", session)
  .route("/show", show)
  .route("/episode", episode)
  .route("/settings", settings)
;

export type AppType = typeof app;
export { app };
export default app;
