import {beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {createRoutesStub} from 'react-router';
import {SWRConfig} from 'swr';
import ShowDetail from '@/components/ShowDetail';

// Mock the API module
vi.mock('@/lib/api.tsx', () => ({
  api: {
    show: {
      $get: vi.fn(),
    },
  },
}));

// Mock useApi - use getter syntax to avoid hoisting issues
const mocks: { useApi: ReturnType<typeof vi.fn> } = {
  useApi: vi.fn(),
};

vi.mock('@/lib/swr', () => ({
  get useApi() {
    return mocks.useApi;
  },
}));

// Mock useOutletContext
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
    mocks.useApi.mockReset();
    mocks.useApi.mockImplementation(() => ({
      data: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    }));
  });

  it('shows "Select a show" message when no showId is provided', () => {
    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <SWRConfig value={{ provider: () => new Map() }}>
          {children}
        </SWRConfig>
      );
    }

    const Stub = createRoutesStub([
      {
        path: '/show',
        Component: ShowDetail,
      },
    ], { Wrapper });

    render(<Stub initialEntries={['/show']} />);

    expect(screen.getByText('Select a show to view details')).toBeInTheDocument();
  });

  it('renders show name when data is loaded', async () => {
    mocks.useApi.mockReturnValue({
      data: mockShowData,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <SWRConfig value={{ provider: () => new Map() }}>
          {children}
        </SWRConfig>
      );
    }

    const Stub = createRoutesStub([
      {
        path: '/show/:showId',
        Component: ShowDetail,
      },
    ], { Wrapper });

    render(<Stub initialEntries={['/show/1']} />);

    await waitFor(() => {
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });
  });

  it('renders season count', async () => {
    mocks.useApi.mockReturnValue({
      data: mockShowData,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <SWRConfig value={{ provider: () => new Map() }}>
          {children}
        </SWRConfig>
      );
    }

    const Stub = createRoutesStub([
      {
        path: '/show/:showId',
        Component: ShowDetail,
      },
    ], { Wrapper });

    render(<Stub initialEntries={['/show/1']} />);

    await waitFor(() => {
      expect(screen.getByText('5 seasons')).toBeInTheDocument();
    });
  });

  it('renders episode count', async () => {
    mocks.useApi.mockReturnValue({
      data: mockShowData,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <SWRConfig value={{ provider: () => new Map() }}>
          {children}
        </SWRConfig>
      );
    }

    const Stub = createRoutesStub([
      {
        path: '/show/:showId',
        Component: ShowDetail,
      },
    ], { Wrapper });

    render(<Stub initialEntries={['/show/1']} />);

    await waitFor(() => {
      expect(screen.getByText('62 episodes')).toBeInTheDocument();
    });
  });

  it('renders first episode name', async () => {
    mocks.useApi.mockReturnValue({
      data: mockShowData,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <SWRConfig value={{ provider: () => new Map() }}>
          {children}
        </SWRConfig>
      );
    }

    const Stub = createRoutesStub([
      {
        path: '/show/:showId',
        Component: ShowDetail,
      },
    ], { Wrapper });

    render(<Stub initialEntries={['/show/1']} />);

    await waitFor(() => {
      expect(screen.getByText('01. Pilot')).toBeInTheDocument();
    });
  });

  it('renders show overview', async () => {
    mocks.useApi.mockReturnValue({
      data: mockShowData,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <SWRConfig value={{ provider: () => new Map() }}>
          {children}
        </SWRConfig>
      );
    }

    const Stub = createRoutesStub([
      {
        path: '/show/:showId',
        Component: ShowDetail,
      },
    ], { Wrapper });

    render(<Stub initialEntries={['/show/1']} />);

    await waitFor(() => {
      expect(screen.getByText('A chemistry teacher turns to crime.')).toBeInTheDocument();
    });
  });

  it('renders season tabs', async () => {
    mocks.useApi.mockReturnValue({
      data: mockShowData,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <SWRConfig value={{ provider: () => new Map() }}>
          {children}
        </SWRConfig>
      );
    }

    const Stub = createRoutesStub([
      {
        path: '/show/:showId',
        Component: ShowDetail,
      },
    ], { Wrapper });

    render(<Stub initialEntries={['/show/1']} />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /S01/i })).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', async () => {
    mocks.useApi.mockReturnValue({
      data: undefined,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <SWRConfig value={{ provider: () => new Map() }}>
          {children}
        </SWRConfig>
      );
    }

    const Stub = createRoutesStub([
      {
        path: '/show/:showId',
        Component: ShowDetail,
      },
    ], { Wrapper });

    render(<Stub initialEntries={['/show/1']} />);

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
