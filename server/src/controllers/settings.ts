import {Hono} from "hono";
import {type Session} from "@hono/session";
import User from "@server/models/user";
import type {UserSessionData} from "@server/models/session";
import DB from "@server/models/db";
import z from "zod";
import {zValidator} from "@hono/zod-validator";

const settings = new Hono<{ Variables: { userId: number, session: Session<UserSessionData> } }>()
  .get("", async (c) => {
    const flags = await User.getFlagsLabels(c.var.userId);
    return c.json(flags);
  })
  .patch("",
    zValidator('json', z.object({
      flag_1: z.string(),
      flag_2: z.string(),
      flag_3: z.string(),
      flag_4: z.string(),
      flag_5: z.string(),
      flag_6: z.string(),
      flag_7: z.string(),
      flag_8: z.string(),
    })),
    async (c) => {
    const post = c.req.valid('json');
    const res = await DB.update('u', c.var.userId, post);
    return c.json({ success: res });
  })
  .patch("/theme",
    zValidator('json', z.object({ darkTheme: z.boolean() })),

    async (c) => {
    const post = c.req.valid('json');
    const darkTheme = post.darkTheme;

    if (typeof darkTheme !== "boolean") {
      return c.json(
        { error: "darkTheme is required and must be a boolean" },
        { status: 400 }
      );
    }

    const data = await c.var.session.get();
    // @ts-ignore
    await c.var.session.update({ // Update session data
      ...data,
      darkTheme,
    });

    // Update database
    await User.updateDarkTheme(c.var.userId, darkTheme);

    return c.json({ darkTheme });
  })
;
export default settings;
