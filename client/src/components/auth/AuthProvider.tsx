import {type ReactNode, useEffect, useState} from "react"
import {api} from "@/lib/api.tsx";
import {AuthContext as AuthContext1, User} from "@/components/auth/authContext.tsx";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await api.session.$get()
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch {
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = (user: User) => {
    setUser(user)
    setIsAuthenticated(true)
  }

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
