import DB from "./db";

export interface EpisodeInterface {
  id: number;
  tmdb_id: number;
  name?: string;
  air_date?: string;
  season_nb?: number;
  episode_nb?: number;
  image?: string;
  overview?: string;
}

const Episode = {

  mapEpisodeFromTmdb: (att:Record<string, any>): Record<string, any> => { // here we map TMDB attributes with our DB fields
    return {
      tmdb_id: att.id,
      name: att.name,
      air_date: att.air_date,
      season_nb: att.season_number,
      episode_nb: att.episode_number,
      image: att.still_path,
      overview: att.overview,
    };
  },

  save: async (data:Record<string, any>): Promise<boolean> => {
    return DB.upsert('episode', data, 'show_id, season_nb, episode_nb');
  },

  getByShowForUser: async (show_id:number, user_id: number): Promise<EpisodeInterface[]> => {
    const q = `SELECT * 
      FROM episode e
      LEFT JOIN u_episode u ON e.id = u.episode_id AND u.u_id = $2
      WHERE show_id = $1
    `;
    return (await DB.query(q, [show_id, user_id])).rows;
  },

  changeFlag: async (id:number, flag: string, value:boolean, user_id: number): Promise<boolean> => {
    let q = `UPDATE u_episode
      SET ${flag} = $3
      WHERE u_id = $1 AND episode_id = $2
    `;
    let res = await DB.query(q, [user_id, id, value]);
    if (res.rowCount === 1) {
      return true;
    } else {
      // the entry doesn't exist yet
      q = `INSERT INTO u_episode(u_id, episode_id, ${flag}) VALUES ($1, $2, $3)`;
      res = await DB.query(q, [user_id, id, value]);
      return res.rowCount === 1;
    }
  },

  changeSeasonFlag: async (show_id:number, season_nb:number, flag: string, value:boolean, user_id: number): Promise<boolean> => {
    let q = `SELECT id
             FROM episode
             WHERE show_id = $1
               AND season_nb = $2
    `;
    let res = await DB.query(q, [show_id, season_nb]);
    await DB.query('BEGIN');
    for (const row of res.rows) {
      res = await Episode.changeFlag(row.id, flag, value, user_id);
      if (!res) break;
    }
    if (!res) {
      await DB.query('ROLLBACK');
      return false;
    }
    await DB.query('COMMIT');
    return true;
  },

};
export default Episode;