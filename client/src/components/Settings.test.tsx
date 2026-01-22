import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {SWRConfig} from 'swr';
import Settings from '@/components/Settings';

// Mock the API module to prevent actual API calls
vi.mock('@/lib/api.tsx', () => ({
  api: {
    settings: {
      $get: vi.fn(),
      $patch: vi.fn(),
    },
  },
}));

// Mock useApi at module level - returns default state
vi.mock('@/lib/swr', () => ({
  useApi: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    error: undefined,
    mutate: vi.fn(),
  })),
}));

describe('components/Settings.tsx', () => {
  it('renders the settings card structure', () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <Settings />
      </SWRConfig>
    );

    // Check card structure is rendered
    expect(screen.getByText('Flags Labels')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('renders flag rows with labels and inputs', () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <Settings />
      </SWRConfig>
    );

    // Check that all 8 flag labels are rendered (with space instead of underscore)
    expect(screen.getByText('flag 1')).toBeInTheDocument();
    expect(screen.getByText('flag 2')).toBeInTheDocument();
    expect(screen.getByText('flag 3')).toBeInTheDocument();
    expect(screen.getByText('flag 4')).toBeInTheDocument();
    expect(screen.getByText('flag 5')).toBeInTheDocument();
    expect(screen.getByText('flag 6')).toBeInTheDocument();
    expect(screen.getByText('flag 7')).toBeInTheDocument();
    expect(screen.getByText('flag 8')).toBeInTheDocument();
  });

  it('renders input placeholders for flags', () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <Settings />
      </SWRConfig>
    );

    // Check that inputs have the placeholder
    const inputs = screen.getAllByPlaceholderText('< unused >');
    expect(inputs.length).toBe(8);
  });

  it('renders save button with correct text', () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <Settings />
      </SWRConfig>
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
