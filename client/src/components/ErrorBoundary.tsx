import {Component, type ReactNode} from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * React error boundary that catches JavaScript errors in child components.
 * Displays a fallback UI when an error occurs, preventing app-wide crashes.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /** Logs caught errors for debugging (dev-only in production) */
  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("Error caught by boundary:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 text-center text-red-500">
            <p className="font-bold">Something went wrong</p>
            <p className="text-sm text-muted-foreground mt-1">
              {this.state.error?.message || "Unknown error"}
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
