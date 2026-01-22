import {useContext} from "react";

import {ThemeContext} from "@/components/theme/themeContext.tsx";

/**
 * Hook to access theme context.
 * @throws Error if used outside ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}