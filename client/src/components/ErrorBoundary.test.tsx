import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ErrorBoundary} from '@/components/ErrorBoundary';

describe('components/ErrorBoundary.tsx', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Child Content');
  });

  it('renders fallback when error is caught', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary fallback={<div data-testid="fallback">Custom Fallback</div>}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback')).toHaveTextContent('Custom Fallback');
  });

  it('renders default fallback when error is caught and no custom fallback', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('shows error message in default fallback', () => {
    const ErrorComponent = () => {
      throw new Error('Specific error message');
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Specific error message')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('shows "Unknown error" when error has no message', () => {
    const ErrorComponent = () => {
      throw {}; // Error without message
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Unknown error')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('catches errors from nested children', () => {
    const NestedErrorComponent = () => {
      return (
        <div>
          <span>Before error</span>
          <ErrorComponent />
          <span>After error</span>
        </div>
      );
    };

    const ErrorComponent = () => {
      throw new Error('Nested error');
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <NestedErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('can be used multiple times on the page', () => {
    const ErrorComponent1 = () => {
      throw new Error('Error 1');
    };

    const ErrorComponent2 = () => {
      throw new Error('Error 2');
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <div>
        <ErrorBoundary fallback={<div data-testid="fallback1">Fallback 1</div>}>
          <ErrorComponent1 />
        </ErrorBoundary>
        <ErrorBoundary fallback={<div data-testid="fallback2">Fallback 2</div>}>
          <ErrorComponent2 />
        </ErrorBoundary>
      </div>
    );

    expect(screen.getByTestId('fallback1')).toHaveTextContent('Fallback 1');
    expect(screen.getByTestId('fallback2')).toHaveTextContent('Fallback 2');

    consoleErrorSpy.mockRestore();
  });
});
