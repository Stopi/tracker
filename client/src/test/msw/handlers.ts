import {http, HttpResponse} from 'msw';

// Mock types matching the server schema
interface MockShow {
  id: number;
  tmdb_id: number;
  name: string;
  started?: string;
  ended?: string;
  network?: string;
  status?: string;
  nb_seasons: number;
  nb_episodes: number;
  image?: string;
  overview?: string;
  origin_country?: string;
  episodes?: MockEpisode[];
}

interface MockEpisode {
  id: number;
  tmdb_id: number;
  name?: string;
  season_nb: number;
  episode_nb: number;
  air_date?: string;
  overview?: string;
  image?: string;
  flag_1?: boolean;
  flag_2?: boolean;
  flag_3?: boolean;
  flag_4?: boolean;
  flag_5?: boolean;
  flag_6?: boolean;
  flag_7?: boolean;
  flag_8?: boolean;
}

const mockShows: MockShow[] = [
  {
    id: 1,
    tmdb_id: 1396,
    name: 'Breaking Bad',
    started: '2008-01-20',
    ended: '2013-09-29',
    network: 'AMC',
    status: 'Ended',
    nb_seasons: 5,
    nb_episodes: 62,
    image: '/test/breaking-bad.jpg',
    overview: 'A high school chemistry teacher turned methamphetamine producer.',
    origin_country: 'US',
  },
  {
    id: 2,
    tmdb_id: 1399,
    name: 'Game of Thrones',
    started: '2011-04-17',
    ended: '2019-05-19',
    network: 'HBO',
    status: 'Ended',
    nb_seasons: 8,
    nb_episodes: 73,
    image: '/test/got.jpg',
    overview: 'Nine noble families fight for control over Westeros.',
    origin_country: 'US',
  },
];

const mockEpisodes: MockEpisode[] = [
  {
    id: 1,
    tmdb_id: 62085,
    name: 'Pilot',
    season_nb: 1,
    episode_nb: 1,
    air_date: '2008-01-20',
    overview: 'Walter White, a chemistry teacher, is diagnosed with cancer.',
    image: '/test/s01e01.jpg',
    flag_1: false,
    flag_2: false,
    flag_3: false,
    flag_4: false,
    flag_5: false,
    flag_6: false,
    flag_7: false,
    flag_8: false,
  },
  {
    id: 2,
    tmdb_id: 62086,
    name: 'Cat\'s in the Bag...',
    season_nb: 1,
    episode_nb: 2,
    air_date: '2008-01-27',
    overview: 'Walt and Jesse deal with the aftermath of their first deal.',
    image: '/test/s01e02.jpg',
    flag_1: true,
    flag_2: false,
    flag_3: false,
    flag_4: false,
    flag_5: false,
    flag_6: false,
    flag_7: false,
    flag_8: false,
  },
];

export const handlers = [
  // Session endpoints
  http.get('/api/session', () => {
    return HttpResponse.json({
      user: { id: 1, username: 'testuser' },
    });
  }),

  http.post('/api/session', () => {
    return HttpResponse.json({
      user: { id: 1, username: 'testuser' },
    });
  }),

  http.delete('/api/session', () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // Shows endpoints
  http.get('/api/show', () => {
    return HttpResponse.json({
      shows: mockShows,
      userFlags: {
        flag_1: 'Watched',
        flag_2: 'Downloaded',
        flag_3: 'Favorited',
        flag_4: '',
        flag_5: '',
        flag_6: '',
        flag_7: '',
        flag_8: '',
      },
    });
  }),

  http.get('/api/show/:showId', ({ params }) => {
    const showId = Number(params.showId);
    const show = mockShows.find((s) => s.id === showId);
    if (!show) {
      return HttpResponse.json({ error: 'Show not found' }, { status: 404 });
    }
    return HttpResponse.json({
      show: {
        ...show,
        episodes: mockEpisodes,
      },
    });
  }),

  http.post('/api/show', async ({ request }) => {
    const body = await request.json() as { tmdb_id: number };
    const newShow = {
      id: 3,
      tmdb_id: body.tmdb_id,
      name: 'New Show',
      nb_seasons: 1,
      nb_episodes: 10,
    };
    return HttpResponse.json(newShow, { status: 201 });
  }),

  http.put('/api/show/:showId', ({ params }) => {
    const showId = Number(params.showId);
    const show = mockShows.find((s) => s.id === showId);
    if (!show) {
      return HttpResponse.json({ error: 'Show not found' }, { status: 404 });
    }
    return HttpResponse.json({
      show: {
        ...show,
        episodes: mockEpisodes,
      },
    });
  }),

  // Episode flag endpoint
  http.patch('/api/episode/:episodeId/flag', async ({ params, request }) => {
    const episodeId = Number(params.episodeId);
    const body = await request.json() as { flag: string; value: boolean };
    return HttpResponse.json({
      id: episodeId,
      [body.flag]: body.value,
    });
  }),

  // Season flag endpoint
  http.patch('/api/show/:showId/season/flag', async ({ params, request }) => {
    const showId = Number(params.showId);
    const body = await request.json() as { season_nb: number; flag: string; value: boolean };
    return HttpResponse.json({
      showId,
      season_nb: body.season_nb,
      [body.flag]: body.value,
    });
  }),

  // Settings endpoints
  http.get('/api/settings', () => {
    return HttpResponse.json({
      flag_1: 'Watched',
      flag_2: 'Downloaded',
      flag_3: 'Favorited',
      flag_4: '',
      flag_5: '',
      flag_6: '',
      flag_7: '',
      flag_8: '',
    });
  }),

  http.patch('/api/settings', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),

  // Search endpoint
  http.get('/api/show/search/:query', ({ params }) => {
    const query = (Array.isArray(params.query) ? params.query[0] : params.query ?? '').toLowerCase();
    const results = mockShows.filter((s) =>
      s.name.toLowerCase().includes(query)
    );
    return HttpResponse.json({ shows: results });
  }),
];
