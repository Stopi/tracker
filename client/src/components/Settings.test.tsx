import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import Settings from '@/components/Settings';

const mocks: {
  settingsGet: ReturnType<typeof vi.fn>;
} = {
  settingsGet: vi.fn(),
};

function mockResponse(data: unknown) {
  return { ok: true, json: () => Promise.resolve(data) };
}

vi.mock('@/lib/api.tsx', () => ({
  get api() {
    return {
      settings: {
        $get: mocks.settingsGet,
        $patch: vi.fn(),
      },
    };
  },
}));

describe('components/Settings.tsx', () => {
  it('renders the settings card structure', async () => {
    mocks.settingsGet.mockResolvedValue(mockResponse({
      flag_1: '',
      flag_2: '',
      flag_3: '',
      flag_4: '',
      flag_5: '',
      flag_6: '',
      flag_7: '',
      flag_8: '',
    }));

    render(<Settings />);

    expect(await screen.findByText('Flags Labels')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('renders flag rows with labels and inputs', async () => {
    mocks.settingsGet.mockResolvedValue(mockResponse({
      flag_1: '',
      flag_2: '',
      flag_3: '',
      flag_4: '',
      flag_5: '',
      flag_6: '',
      flag_7: '',
      flag_8: '',
    }));

    render(<Settings />);

    expect(await screen.findByText('flag 1')).toBeInTheDocument();
    expect(screen.getByText('flag 2')).toBeInTheDocument();
    expect(screen.getByText('flag 3')).toBeInTheDocument();
    expect(screen.getByText('flag 4')).toBeInTheDocument();
    expect(screen.getByText('flag 5')).toBeInTheDocument();
    expect(screen.getByText('flag 6')).toBeInTheDocument();
    expect(screen.getByText('flag 7')).toBeInTheDocument();
    expect(screen.getByText('flag 8')).toBeInTheDocument();
  });

  it('renders input placeholders for flags', async () => {
    mocks.settingsGet.mockResolvedValue(mockResponse({
      flag_1: '',
      flag_2: '',
      flag_3: '',
      flag_4: '',
      flag_5: '',
      flag_6: '',
      flag_7: '',
      flag_8: '',
    }));

    render(<Settings />);

    const inputs = await screen.findAllByPlaceholderText('< unused >');
    expect(inputs.length).toBe(8);
  });

  it('renders save button with correct text', async () => {
    mocks.settingsGet.mockResolvedValue(mockResponse({
      flag_1: '',
      flag_2: '',
      flag_3: '',
      flag_4: '',
      flag_5: '',
      flag_6: '',
      flag_7: '',
      flag_8: '',
    }));

    render(<Settings />);

    expect(await screen.findByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
