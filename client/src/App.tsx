import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import {AuthProvider} from "@/components/auth/AuthProvider.tsx";
import {ThemeProvider} from "@/components/theme/ThemeProvider.tsx";
import {ShowsLayout} from "@/components/Shows.tsx";
import ShowDetail from "@/components/ShowDetail.tsx";
import Login from "@/components/Login";
import Settings from "@/components/Settings.tsx";
import MainLayout from "@/components/MainLayout";
import {ErrorBoundary} from "@/components/ErrorBoundary";
import {useAuth} from "@/components/auth/useAuth.tsx";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				Loading...
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				Loading...
			</div>
		);
	}

	if (isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
}

function AppRoutes() {
	return (
		<Routes>
			<Route
				path="/login"
				element={
					<GuestRoute>
						<Login />
					</GuestRoute>
				}
			/>
			<Route
				element={
					<ProtectedRoute>
						<MainLayout />
					</ProtectedRoute>
				}
			>
				<Route path="/" element={<Navigate to="/show" replace />} />
        <Route element={
          <ErrorBoundary fallback={<div className="p-4 text-red-500">Failed to load shows</div>}>
            <ShowsLayout />
          </ErrorBoundary>
        }>
          <Route path="/show">
            <Route index element={
              <ErrorBoundary fallback={<div className="p-4 text-red-500">Failed to load show list</div>}>
                <ShowDetail />
              </ErrorBoundary>
            } />
            <Route path=":showId" element={
              <ErrorBoundary fallback={<div className="p-4 text-red-500">Failed to load show details</div>}>
                <ShowDetail />
              </ErrorBoundary>
            } />
          </Route>
        </Route>
				<Route path="/settings" element={
					<ErrorBoundary fallback={<div className="p-4 text-red-500">Failed to load settings</div>}>
						<Settings />
					</ErrorBoundary>
				} />
			</Route>
			<Route path="*" element={<Navigate to="/show" replace />} />
		</Routes>
	);
}

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<ThemeProvider>
					<AppRoutes />
				</ThemeProvider>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
