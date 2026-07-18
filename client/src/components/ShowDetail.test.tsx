import {beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {createRoutesStub} from 'react-router';
import ShowDetail from '@/components/ShowDetail';

const { showGet, showPut, showDelete, episodeFlagPatch, seasonFlagPatch } = vi.hoisted(() => {
  const showGet = vi.fn();
  const showPut = vi.fn();
  const showDelete = vi.fn();
  const episodeFlagPatch = vi.fn();
  const seasonFlagPatch = vi.fn();
  return { showGet, showPut, showDelete, episodeFlagPatch, seasonFlagPatch };
});

function mockResponse(data: unknown) {
  return { ok: true, json: () => Promise.resolve(data) };
}

vi.mock('@/lib/api.tsx', () => {
  const showEndpoint = {
    $get: showGet,
    $put: showPut,
    $delete: showDelete,
    season: {
      flag: { $patch: seasonFlagPatch },
    },
  };

  return {
    api: {
      show: new Proxy({}, {
        get(_target, prop) {
          if (prop === 'search') {
            return new Proxy({}, {
              get() {
                return { $get: vi.fn().mockResolvedValue(mockResponse({ shows: [] })) };
              },
            });
          }
          if (prop === '$get') return vi.fn();
          if (prop === '$post') return vi.fn();
          return showEndpoint;
        },
      }),
      episode: new Proxy({}, {
        get() {
          return {
            flag: { $patch: episodeFlagPatch },
          };
        },
      }),
    },
  };
});

vi.mock('react-router', async (importOriginal) => {
  const actual: Record<string, unknown> = await importOriginal();
  return {
    ...actual,
    useOutletContext: vi.fn(() => ({
      shows: [{ id: 1, name: 'Breaking Bad' }],
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
      refreshShows: vi.fn(),
    })),
  };
});

describe('components/ShowDetail.tsx', () => {
  const mockShowData = {
    show: {
      id: 1,
      tmdb_id: 1396,
      name: 'Breaking Bad',
      nb_seasons: 5,
      nb_episodes: 62,
      origin_country: 'US',
      status: 'Ended',
      overview: 'A chemistry teacher turns to crime.',
      image: '/test/breaking-bad.jpg',
      episodes: [
        {
          id: 1,
          tmdb_id: 62085,
          name: 'Pilot',
          season_nb: 1,
          episode_nb: 1,
          air_date: '2008-01-20',
          overview: 'Walter White is diagnosed with cancer.',
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
          name: "Cat's in the Bag...",
          season_nb: 1,
          episode_nb: 2,
          air_date: '2008-01-27',
          overview: 'Walt and Jesse deal with the aftermath.',
          flag_1: true,
          flag_2: false,
          flag_3: false,
          flag_4: false,
          flag_5: false,
          flag_6: false,
          flag_7: false,
          flag_8: false,
        },
      ],
    },
  };

  beforeEach(() => {
    showGet.mockReset();
    showPut.mockReset();
    showDelete.mockReset();
    episodeFlagPatch.mockReset();
    seasonFlagPatch.mockReset();
    showGet.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockShowData) });
  });

  it('shows "Select a show" message when no showId is provided', () => {
    const Stub = createRoutesStub([
      {
        path: '/show',
        Component: ShowDetail,
      },
    ]);

    render(<Stub initialEntries={['/show']} />);

    expect(screen.getByText('Select a show to view details')).toBeInTheDocument();
  });

  it('renders show name when data is loaded', async () => {
    const Stub = createRoutesStub([
      {
        path: '/show/:showId',
        Component: ShowDetail,
      },
    ]);

    render(<Stub initialEntries={['/show/1']} />);

    await waitFor(() => {
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });
  });

  it('renders season count', async () => {
    const Stub = createRoutesStub([
      {
        path: '/show/:showId',
        Component: ShowDetail,
      },
    ]);

    render(<Stub initialEntries={['/show/1']} />);

    await waitFor(() => {
      expect(screen.getByText('5 seasons')).toBeInTheDocument();
    });
  });

  it('renders episode count', async () => {
    const Stub = createRoutesStub([
      {
        path: '/show/:showId',
        Component: ShowDetail,
      },
    ]);

    render(<Stub initialEntries={['/show/1']} />);

    await waitFor(() => {
      expect(screen.getByText('62 episodes')).toBeInTheDocument();
    });
  });

  it('renders first episode name', async () => {
    const Stub = createRoutesStub([
      {
        path: '/show/:showId',
        Component: ShowDetail,
      },
    ]);

    render(<Stub initialEntries={['/show/1']} />);

    await waitFor(() => {
      expect(screen.getByText('01. Pilot')).toBeInTheDocument();
    });
  });

  it('renders show overview', async () => {
    const Stub = createRoutesStub([
      {
        path: '/show/:showId',
        Component: ShowDetail,
      },
    ]);

    render(<Stub initialEntries={['/show/1']} />);

    await waitFor(() => {
      expect(screen.getByText('A chemistry teacher turns to crime.')).toBeInTheDocument();
    });
  });

  it('renders season tabs', async () => {
    const Stub = createRoutesStub([
      {
        path: '/show/:showId',
        Component: ShowDetail,
      },
    ]);

    render(<Stub initialEntries={['/show/1']} />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /S01/i })).toBeInTheDocument();
    });
  });
});
