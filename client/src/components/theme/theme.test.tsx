import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ThemeProvider} from '@/components/theme/ThemeProvider.tsx';
import {AuthProvider} from '@/components/auth/AuthProvider.tsx';
import {useTheme} from "@/components/theme/useTheme.tsx";

// Create mock functions with getters for vi.mock hoisting
const mocks: {
  sessionGet: ReturnType<typeof vi.fn>;
  themePatch: ReturnType<typeof vi.fn>;
} = {
  sessionGet: vi.fn(),
  themePatch: vi.fn(),
};

// Mock the API
vi.mock('@/lib/api.tsx', () => ({
  get api() {
    return {
      session: {
        get $get() {
          return mocks.sessionGet;
        },
      },
      settings: {
        theme: {
          get $patch() {
            return mocks.themePatch;
          },
        },
      },
    };
  },
}));

describe('lib/ThemeProvider.tsx', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  describe('ThemeProvider', () => {
    it('applies dark class to document by default', () => {
      // Auth will fail, so theme stays at default (dark)
      mocks.sessionGet.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      render(
        <AuthProvider>
          <ThemeProvider>
            <div>Child</div>
          </ThemeProvider>
        </AuthProvider>
      );

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('loads theme from server when authenticated', async () => {
      mocks.sessionGet.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1 }, darkTheme: false }),
      });

      render(
        <AuthProvider>
          <ThemeProvider>
            <ThemeConsumer />
          </ThemeProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('darkTheme')).toHaveTextContent('false');
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('keeps default theme when server returns no theme preference', async () => {
      mocks.sessionGet.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1 } }), // No darkTheme
      });

      render(
        <AuthProvider>
          <ThemeProvider>
            <ThemeConsumer />
          </ThemeProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('darkTheme')).toHaveTextContent('true');
      });
    });

    it('setDarkTheme updates local state optimistically', async () => {
      mocks.sessionGet.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1 }, darkTheme: true }),
      });

      mocks.themePatch.mockResolvedValue(new Response(null, { status: 200 }));

      render(
        <AuthProvider>
          <ThemeProvider>
            <ThemeConsumer />
          </ThemeProvider>
        </AuthProvider>
      );

      // Wait for initial dark theme
      await waitFor(() => {
        expect(screen.getByTestId('darkTheme')).toHaveTextContent('true');
      });

      const setDarkThemeBtn = screen.getByTestId('setDarkTheme-btn');
      await userEvent.click(setDarkThemeBtn);

      // State should update immediately (optimistic)
      expect(screen.getByTestId('darkTheme')).toHaveTextContent('false');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('sends PATCH to server on theme change', async () => {
      mocks.sessionGet.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1 }, darkTheme: true }),
      });

      mocks.themePatch.mockResolvedValue(new Response(null, { status: 200 }));

      render(
        <AuthProvider>
          <ThemeProvider>
            <ThemeConsumer />
          </ThemeProvider>
        </AuthProvider>
      );

      // Wait for initial dark theme
      await waitFor(() => {
        expect(screen.getByTestId('darkTheme')).toHaveTextContent('true');
      });

      const setDarkThemeBtn = screen.getByTestId('setDarkTheme-btn');
      await userEvent.click(setDarkThemeBtn);

      // Verify the API was called
      await waitFor(() => {
        expect(mocks.themePatch).toHaveBeenCalledWith({
          json: { darkTheme: false },
        });
      });
    });

    it('preserves local state on server error', async () => {
      mocks.sessionGet.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1 }, darkTheme: true }),
      });

      mocks.themePatch.mockRejectedValue(new Error('Network error'));

      render(
        <AuthProvider>
          <ThemeProvider>
            <ThemeConsumer />
          </ThemeProvider>
        </AuthProvider>
      );

      // Wait for initial dark theme
      await waitFor(() => {
        expect(screen.getByTestId('darkTheme')).toHaveTextContent('true');
      });

      const setDarkThemeBtn = screen.getByTestId('setDarkTheme-btn');
      await userEvent.click(setDarkThemeBtn);

      // State should update optimistically despite server error
      expect(screen.getByTestId('darkTheme')).toHaveTextContent('false');
    });

    it('toggleDarkTheme toggles the theme', async () => {
      mocks.sessionGet.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1 }, darkTheme: true }),
      });

      mocks.themePatch.mockResolvedValue(new Response(null, { status: 200 }));

      render(
        <AuthProvider>
          <ThemeProvider>
            <ThemeConsumer />
          </ThemeProvider>
        </AuthProvider>
      );

      // Wait for initial dark theme
      await waitFor(() => {
        expect(screen.getByTestId('darkTheme')).toHaveTextContent('true');
      });

      const toggleBtn = screen.getByTestId('toggle-btn');
      await userEvent.click(toggleBtn);

      expect(screen.getByTestId('darkTheme')).toHaveTextContent('false');
    });

    it('setThemeState updates only local state without server call', async () => {
      mocks.sessionGet.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1 }, darkTheme: true }),
      });

      render(
        <AuthProvider>
          <ThemeProvider>
            <ThemeConsumer />
          </ThemeProvider>
        </AuthProvider>
      );

      // Wait for initial dark theme
      await waitFor(() => {
        expect(screen.getByTestId('darkTheme')).toHaveTextContent('true');
      });

      const setStateBtn = screen.getByTestId('setState-btn');
      await userEvent.click(setStateBtn);

      expect(screen.getByTestId('darkTheme')).toHaveTextContent('false');
      expect(mocks.themePatch).not.toHaveBeenCalled();
    });

    it('does not load theme when not authenticated', async () => {
      mocks.sessionGet.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      render(
        <AuthProvider>
          <ThemeProvider>
            <ThemeConsumer />
          </ThemeProvider>
        </AuthProvider>
      );

      // Should keep default theme (dark)
      await waitFor(() => {
        expect(screen.getByTestId('darkTheme')).toHaveTextContent('true');
      });
    });
  });

  describe('useTheme', () => {
    it('throws error when used outside ThemeProvider', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const TestComponent = () => {
        useTheme();
        return null;
      };

      expect(() => render(<TestComponent />)).toThrow(
        'useTheme must be used within a ThemeProvider'
      );
    });
  });
});

// Helper component to consume theme context
function ThemeConsumer() {
  const { darkTheme, setDarkTheme, toggleDarkTheme, setThemeState } = useTheme();

  return (
    <div>
      <span data-testid="darkTheme">{darkTheme.toString()}</span>
      <button
        data-testid="setDarkTheme-btn"
        onClick={() => setDarkTheme(false)}
      >
        Set Dark False
      </button>
      <button
        data-testid="toggle-btn"
        onClick={() => toggleDarkTheme()}
      >
        Toggle
      </button>
      <button
        data-testid="setState-btn"
        onClick={() => setThemeState(false)}
      >
        Set State Only
      </button>
    </div>
  );
}
