import {Hono} from "hono";
import z from "zod";
import {zValidator} from "@hono/zod-validator";
import Episode from "@server/models/episode";

const episode = new Hono<{ Variables: { userId: number } }>()
  .patch("/:id/flag",
    zValidator('json', z.object({ flag: z.string().regex(/^flag_[1-8]$/), value: z.boolean() })),
    async c => {
      const id = Number(c.req.param("id"));
      const data = c.req.valid('json');
      const res = await Episode.changeFlag(id, data.flag, data.value, c.var.userId);
      return c.json({ success: res });
    }
  )
;
export default episode;
