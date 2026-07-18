import {type ReactNode, useEffect, useState,} from "react";
import {api} from "@/lib/api.tsx";
import {ThemeContext as ThemeContext1} from "@/components/theme/themeContext.tsx";
import {useAuth} from "@/components/auth/useAuth.tsx";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkTheme, setDarkThemeState] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const root = document.documentElement;
    if (darkTheme) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkTheme]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;

    async function loadTheme() {
      try {
        const res = await api.session.$get()
        if (res.ok) {
          const data = await res.json()
          if (data.darkTheme !== undefined) {
            setDarkThemeState(data.darkTheme);
          }
        }
      } catch {
        // keep local state
      }
    }

    loadTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading]);

  const setDarkTheme = async (dark: boolean) => {
    setDarkThemeState(dark);

    try {
      await api.settings['theme'].$patch({ json: { darkTheme: dark } });
    } catch {
      // offline or server error; local state already updated
    }
  };

  const toggleDarkTheme = async () => {
    await setDarkTheme(!darkTheme);
  };

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
