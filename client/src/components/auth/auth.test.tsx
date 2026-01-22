import {beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {AuthProvider} from '@/components/auth/AuthProvider.tsx';
import {useAuth} from "@/components/auth/useAuth.tsx";

// Create mock functions with getters for vi.mock hoisting
const mocks: {
  sessionGet: ReturnType<typeof vi.fn>;
  sessionDelete: ReturnType<typeof vi.fn>;
} = {
  sessionGet: vi.fn(),
  sessionDelete: vi.fn(),
};

// Mock the API
vi.mock('@/lib/api.tsx', () => ({
  get api() {
    return {
      session: {
        get $get() {
          return mocks.sessionGet;
        },
        get $delete() {
          return mocks.sessionDelete;
        },
      },
    };
  },
}));

describe('lib/AuthProvider.tsx', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('AuthProvider', () => {
    it('shows loading state initially', () => {
      // Pending forever - never resolves
      mocks.sessionGet.mockImplementation(() => new Promise(() => {}));

      render(
        <AuthProvider>
          <div>Child</div>
        </AuthProvider>
      );

      // Provider renders children immediately
      expect(screen.getByText('Child')).toBeInTheDocument();
    });

    it('sets user and isAuthenticated on successful session', async () => {
      mocks.sessionGet.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, username: 'testuser' } }),
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });
      expect(screen.getByTestId('user')).toHaveTextContent('1');
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    it('clears authentication on failed session', async () => {
      mocks.sessionGet.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    it('handles session check error gracefully', async () => {
      mocks.sessionGet.mockRejectedValue(new Error('Network error'));

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    it('login updates authentication state', async () => {
      // Start with no session
      mocks.sessionGet.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });

      // Simulate login
      const loginFn = screen.getByTestId('login-fn');
      await userEvent.click(loginFn);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });
      expect(screen.getByTestId('user')).toHaveTextContent('42');
    });

    it('logout calls API and clears state', async () => {
      mocks.sessionGet.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, username: 'testuser' } }),
      });

      mocks.sessionDelete.mockResolvedValue(new Response(null, { status: 200 }));

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      // Wait for authenticated state
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      const logoutFn = screen.getByTestId('logout-fn');
      await userEvent.click(logoutFn);

      await waitFor(() => {
        expect(mocks.sessionDelete).toHaveBeenCalled();
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });
  });

  describe('useAuth', () => {
    it('throws error when used outside AuthProvider', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const TestComponent = () => {
        useAuth();
        return null;
      };

      expect(() => render(<TestComponent />)).toThrow(
        'useAuth must be used within an AuthProvider'
      );
    });

    it('returns auth context values when inside provider', () => {
      mocks.sessionGet.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, username: 'test' } }),
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
    });
  });
});

// Helper component to consume auth context
function AuthConsumer() {
  const { isAuthenticated, login, logout, isLoading, user } = useAuth();

  return (
    <div>
      <span data-testid="isAuthenticated">{isAuthenticated.toString()}</span>
      <span data-testid="user">{user?.id ?? 'null'}</span>
      <span data-testid="isLoading">{isLoading.toString()}</span>
      <button data-testid="login-fn" onClick={() => login({ id: 42, username: 'manual' })}>
        Login
      </button>
      <button data-testid="logout-fn" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
}
