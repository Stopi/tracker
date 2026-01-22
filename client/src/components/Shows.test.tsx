import {describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router';
import ShowList from '@/components/Shows';

// Mock the API module (needed for Dialog imports)
vi.mock('@/lib/api.tsx', () => ({
  api: {
    show: {
      $get: vi.fn(),
      $post: vi.fn(),
      search: {
        $: {
          get: vi.fn(),
        },
      },
    },
  },
}));

describe('components/Shows.tsx - ShowList', () => {
  const mockShows = [
    { id: 1, tmdb_id: 1396, name: 'Breaking Bad', nb_seasons: 5, nb_episodes: 62 },
    { id: 2, tmdb_id: 1399, name: 'Game of Thrones', nb_seasons: 8, nb_episodes: 73 },
    { id: 3, tmdb_id: 46260, name: 'Narcos', nb_seasons: 3, nb_episodes: 30 },
  ];

  const renderShowList = (shows = mockShows) => {
    return render(
      <MemoryRouter initialEntries={['/show']}>
        <ShowList shows={shows} onRefreshShows={vi.fn()} />
      </MemoryRouter>
    );
  };

  describe('ShowList rendering', () => {
    it('renders show list with shows', () => {
      renderShowList();

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.getByText('Game of Thrones')).toBeInTheDocument();
      expect(screen.getByText('Narcos')).toBeInTheDocument();
    });

    it('shows filter input', () => {
      renderShowList();

      expect(screen.getByPlaceholderText('Filter shows...')).toBeInTheDocument();
    });

    it('shows add button icon', () => {
      renderShowList();

      // The add button contains a Plus icon
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders show names with correct text', () => {
      renderShowList();

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.getByText('Game of Thrones')).toBeInTheDocument();
      expect(screen.getByText('Narcos')).toBeInTheDocument();
    });

    it('renders show links with correct href', () => {
      renderShowList();

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
      expect(links[0]).toHaveAttribute('href', '/show/1');
      expect(links[1]).toHaveAttribute('href', '/show/2');
      expect(links[2]).toHaveAttribute('href', '/show/3');
    });
  });

  describe('ShowList filtering', () => {
    it('filters shows by name', async () => {
      renderShowList();

      const filterInput = screen.getByPlaceholderText('Filter shows...');
      await userEvent.type(filterInput, 'game');

      expect(screen.queryByText('Breaking Bad')).not.toBeInTheDocument();
      expect(screen.getByText('Game of Thrones')).toBeInTheDocument();
      expect(screen.queryByText('Narcos')).not.toBeInTheDocument();
    });

    it('shows "No matching shows" when filter matches nothing', async () => {
      renderShowList();

      const filterInput = screen.getByPlaceholderText('Filter shows...');
      await userEvent.type(filterInput, 'xyz');

      expect(screen.getByText('No matching shows')).toBeInTheDocument();
    });

    it('shows "No shows found" when list is empty', () => {
      renderShowList([]);

      expect(screen.getByText('No shows found')).toBeInTheDocument();
    });

    it('case insensitive filtering', async () => {
      renderShowList();

      const filterInput = screen.getByPlaceholderText('Filter shows...');
      await userEvent.type(filterInput, 'BREAKING');

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    });

    it('partial matching filter', async () => {
      renderShowList();

      const filterInput = screen.getByPlaceholderText('Filter shows...');
      await userEvent.type(filterInput, 'bad');

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.queryByText('Game of Thrones')).not.toBeInTheDocument();
    });
  });

  describe('ShowList structure', () => {
    it('has a list container', () => {
      renderShowList();

      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('has list items for each show', async () => {
      renderShowList();

      await waitFor(() => {
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
      });
    });
  });
});
