import {createContext} from "react";

export interface User {
  id: number
  username: string
}

export interface AuthContextType {
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  isLoading: boolean
  user: User | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)