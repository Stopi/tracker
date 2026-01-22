import DB from "./db";
import TMDB from "./tmdb";
import type {EpisodeInterface} from "./episode";
import Episode from "./episode";

export interface ShowInterface {
  id: number;
  tmdb_id: number;
  name?: string;
  started?: string;
  ended?: string;
  nb_seasons?: number;
  nb_episodes?: number;
  origin_country?: [string];
  original_language?: string;
  original_name?: string;
  overview?: string;
  image?: string;
  status?: string;
  episodes?: EpisodeInterface[];
}

export  interface ShowSearchResponse {
  total_results: number;
  total_pages: number;
  shows: ShowInterface[];
}

const Show = {
  getAll: async (user_id: number): Promise<ShowInterface[]> => {
    const res = await DB.query(
      `
      SELECT id, name
      FROM show s
      LEFT JOIN u_show u ON s.id = u.show_id AND u.u_id = $1
      ORDER BY name
    `,
      [user_id]
    );
    return res.rows as ShowInterface[];
  },

  get: async (id: number, user_id?:number): Promise<ShowInterface|null> => {
    let q = 'SELECT * FROM show s';
    let params:any[] = [ id ];
    if (user_id !== undefined) {
      q += ' LEFT JOIN u_show u ON s.id = u.show_id AND u.u_id = $2'
      params.push(user_id);
    }
    q += ' WHERE id = $1';
    const res = await DB.query(q, params);
    return res && res.rowCount === 1 ? res.rows[0] as ShowInterface : null;
  },

  search: async (query: string, language = 'en-US'): Promise<ShowSearchResponse> => {
    return TMDB.searchTVShow(query, language).then(data => {
      if (data.results && data.results.length > 0) {
        return {
          total_results: data.total_results,
          total_pages: data.total_pages,
          shows: data.results.map((show: any): ShowInterface => ({
            id: show.id,
            tmdb_id: show.id,
            name: show.name,
            overview: show.overview,
            image: show.poster_path,
          }))
        };
      } else {
        return {
          total_results: 0,
          total_pages: 0,
          shows: []
        };
      }
    });
  },

  mapShowFromTmdb: (att:Record<string, any>): Record<string, any> => { // here we map TMDB attributes with our DB fields
    return {
      tmdb_id: att.id,
      name: att.name,
      started: att.first_air_date,
      nb_seasons: att.number_of_seasons,
      nb_episodes: att.number_of_episodes,
      origin_country: att.origin_country,
      original_language: att.original_language,
      original_name: att.original_name,
      overview: att.overview,
      image: att.poster_path,
      status: att.status,
    };
  },

  addFromTMDB: async (id: number): Promise<number|null> => {
    let newId = null;
    let data = await TMDB.getShowDetails(id);
    if (data) {
      data = Show.mapShowFromTmdb(data);
      newId = await DB.insert('show', data);
      if (newId) {
        await Show.refreshEpisodes(newId, id, data.nb_seasons); // get all episodes
      }
    }
    return newId;
  },

  refresh: async (id: number): Promise<boolean> => {
    let show = await Show.get(id);
    if (show === null) return false;
    const new_data = await TMDB.getShowDetails(show.tmdb_id);
    const data = Show.mapShowFromTmdb(new_data);
    await DB.update('show', id, data);
    return await Show.refreshEpisodes(id, show.tmdb_id, data.nb_seasons);
  },

  refreshEpisodes: async (id: number, tmdbId: number, nbSeasons: number): Promise<boolean> => {
    let res = false;
    for (let s = 1; s <= nbSeasons; s++) {
      if (s % 10 === 0) {
        // every 10 requests we wait 1 second to limit API request rate to TMDB
        await (ms => new Promise(r => setTimeout(r, ms)))(1000);
      }
      const content:Record<string, any> = await TMDB.getSeasonDetails(tmdbId, s);
      res = await Show.saveSeason(id, content);
      if (!res) break;
    }
    return res;
  },

  saveSeason: async (id:number, data:Record<string, any>): Promise<boolean> => {
    let res = false;
    for (let e of data.episodes) {
      let episode = Episode.mapEpisodeFromTmdb(e);
      episode.show_id = id;
      res = await Episode.save(episode);
      if (!res) break;
    }
    return res;
  },

};
export default Show;