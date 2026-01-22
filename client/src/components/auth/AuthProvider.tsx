import {type ReactNode, useEffect, useState} from "react"
import {api} from "@/lib/api.tsx";
import {AuthContext as AuthContext1, User} from "@/components/auth/authContext.tsx";

/**
 * Authentication provider that manages user session state.
 * Checks for existing session on mount and exposes login/logout methods.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verify session with server on initial load
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await api.session.$get()

        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setIsAuthenticated(true)
        } else {
          // Session invalid or expired
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch {
        // Network error or server unavailable
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  /** Updates local state to mark user as authenticated */
  const login = (user: User) => {
    setUser(user)
    setIsAuthenticated(true)
  }

  /** Clears session on server and resets local authentication state */
  const logout = async () => {
    try {
      await api.session.$delete()
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  return (
    <AuthContext1 value={{ isAuthenticated, login, logout, isLoading, user }}>
      {children}
    </AuthContext1>
  )
}

