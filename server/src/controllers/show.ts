import {Hono} from "hono";
import z from "zod";
import {zValidator} from "@hono/zod-validator";
import Show from "@server/models/show";
import Episode from "@server/models/episode";
import User from "@server/models/user";

const show = new Hono<{ Variables: { userId: number } }>()
  // list shows from DB
  .get("", async (c) => {
    const shows = await Show.getAll(c.var.userId);
    const userFlags = await User.getFlagsLabels(c.var.userId);
    return c.json({ shows, userFlags });
  })
  // get details from one show
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const show = await Show.get(id, c.var.userId);
    if (!show) return c.json({ error: 'this show doesn\'t exist' }, { status: 404 });
    show.episodes = await Episode.getByShowForUser(show.id, c.var.userId);
    return c.json({ show });
  })
  // search shows from TMDB
  .get("/search/:query", async (c) => {
    // should search for a show
    const query = c.req.param("query");
    const res = await Show.search(query);
    return c.json(res);
  })
  // add a show in DB
  .post("",
    zValidator('json', z.object({ tmdb_id: z.number() })),
    async c => {
      const data = c.req.valid('json');
      const id = await Show.addFromTMDB(data.tmdb_id);
      return c.json({ id });
    }
  )
  .put("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const res = await Show.refresh(id);
    if (!res) {
      return c.json({ error: 'show refresh failed' });
    } else {
      const show = await Show.get(id, c.var.userId);
      if (!show) return c.json({ error: 'show not saved in db' });
      show.episodes = await Episode.getByShowForUser(show.id, c.var.userId);
      return c.json({ show });
    }
  })
  .patch("/:id/season/flag",
    zValidator('json', z.object({ season_nb: z.number(), flag: z.string().regex(/^flag_[1-8]$/), value: z.boolean() })),
    async c => {
      const id = Number(c.req.param("id"));
      const data = c.req.valid('json');
      const res = await Episode.changeSeasonFlag(id, data.season_nb, data.flag, data.value, c.var.userId);
      return c.json({ success: res });
    }
  )
;
export default show;
