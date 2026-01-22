import {type ReactNode, useEffect, useState,} from "react";
import {api} from "@/lib/api.tsx";
import {ThemeContext as ThemeContext1} from "@/components/theme/themeContext.tsx";
import {useAuth} from "@/components/auth/useAuth.tsx";

/**
 * Theme provider that manages dark/light mode state.
 * Applies theme to document root and syncs with server when authenticated.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkTheme, setDarkThemeState] = useState(true); // Dark by default
  const { isAuthenticated, isLoading } = useAuth();

  // Sync theme state with document's class list
  useEffect(() => {
    const root = document.documentElement;
    if (darkTheme) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkTheme]);

  // Fetch user's theme preference from server after authentication
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;

    async function loadTheme() {
      try {
        const res = await api.session.$get();
        if (res.ok) {
          const data = await res.json();
          if (data.darkTheme !== undefined) {
            setDarkThemeState(data.darkTheme);
          }
        }
      } catch {
        // Server unavailable or session expired; keep local state
      }
    }

    loadTheme();
  }, [isAuthenticated, isLoading]);

  /**
   * Persists theme change to server after updating local state.
   * Server persistence is best-effort; local state is always updated.
   */
  const setDarkTheme = async (dark: boolean) => {
    setDarkThemeState(dark);

    // Attempt server sync (best-effort; failures are silent)
    try {
      await api.settings['theme'].$patch({ json: { darkTheme: dark } });
    } catch {
      // Offline or server error; local state already updated
    }
  };

  /** Toggles between dark and light themes */
  const toggleDarkTheme = async () => {
    await setDarkTheme(!darkTheme);
  };

  /** Updates local theme state without server sync (e.g., post-logout) */
  const setThemeState = (dark: boolean) => {
    setDarkThemeState(dark);
  };

  return (
    <ThemeContext1
      value={{ darkTheme, setDarkTheme, toggleDarkTheme, setThemeState }}
    >
      {children}
    </ThemeContext1>
  );
}

