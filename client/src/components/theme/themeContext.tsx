import {createContext} from "react";

export interface ThemeContextType {
  darkTheme: boolean;
  setDarkTheme: (dark: boolean) => Promise<void>;
  toggleDarkTheme: () => Promise<void>;
  setThemeState: (dark: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);