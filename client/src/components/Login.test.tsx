import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router';
import Login from '@/components/Login';
import {AuthProvider} from '@/components/auth/AuthProvider.tsx';
import {ThemeProvider} from '@/components/theme/ThemeProvider.tsx';

describe('components/Login.tsx', () => {
  const renderWithProviders = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <ThemeProvider>
            <Login />
          </ThemeProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders login form', () => {
    renderWithProviders();

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('has password input with password type', () => {
    renderWithProviders();

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('has username input', () => {
    renderWithProviders();

    const usernameInput = screen.getByLabelText(/username/i);
    expect(usernameInput).toBeInTheDocument();
  });

  it('has placeholder text', () => {
    renderWithProviders();

    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  it('has login card title', () => {
    renderWithProviders();

    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
