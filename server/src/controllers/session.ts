import {Hono} from "hono";
import {type Session} from "@hono/session";
import User from "@server/models/user";
import type {UserSessionData} from "@server/models/session";
import {type LoginInput, loginSchema} from "shared/dist/validators";

const session = new Hono<{ Variables: { session: Session<UserSessionData> } }>()
  .get("", async (c) => {
    const data = (await c.var.session.get())!;
    return c.json({
      user: {
        id: data.userId,
        username: data.username,
      },
      darkTheme: data.darkTheme,
    });
  })
  .post("", async (c) => {
    // Parse and validate input (filter input)
    const body = await c.req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((e: { message: string }) => e.message);
      return c.json(
        { error: errors.join(", ") },
        { status: 400 }
      );
    }

    const { username, password }: LoginInput = result.data;

    // Query user from database
    const user = await User.getUserByUsername(username);

    if (!user) {
      return c.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Verify password with bcrypt
    const isMatch = await Bun.password.verify(password, user.password);

    if (!isMatch) {
      return c.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Set session data
    await c.var.session.update({
      userId: user.id,
      username: user.username,
      darkTheme: user.dark_theme,
    });

    return c.json({
      user: {
        id: user.id,
        username: user.username,
      },
      darkTheme: user.dark_theme,
    });
  })
  .delete("", async (c) => {
    c.var.session.delete();
    return c.json({
      message: "Logout successful",
    });
  })
;
export default session;
