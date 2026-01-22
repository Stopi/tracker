import {Outlet} from "react-router"
import Navbar from "@/components/Navbar"

/**
 * Root layout component providing the app shell structure.
 * Contains the navigation bar and a main content area for nested routes.
 */
function MainLayout() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <main className="grow-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
