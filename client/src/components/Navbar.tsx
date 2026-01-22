import {Link, useLocation} from "react-router"
import {Button} from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {LogOut, Moon, Sun, User} from "lucide-react"
import {useTheme} from "@/components/theme/useTheme.tsx";
import {useAuth} from "@/components/auth/useAuth.tsx";

/**
 * Global navigation bar containing main nav links, theme toggle, and user menu.
 */
function Navbar() {
  const { logout, user } = useAuth()
  const { darkTheme, toggleDarkTheme } = useTheme()
  const location = useLocation()

  const navLinks = [
    { href: "/show", label: "Shows" },
    { href: "/settings", label: "Settings" },
  ]

  return (
    <header className="h-14 border-b flex items-center px-4 gap-4">
      {/* Main navigation links */}
      <nav className="flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              location.pathname === link.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right section: theme toggle and user dropdown */}
      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkTheme}
          title={darkTheme ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkTheme ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <span className="text-sm text-muted-foreground hidden sm:inline">
          {user?.username}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="" alt={user?.username} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={toggleDarkTheme}>
              {darkTheme ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Light mode
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark mode
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Navbar
