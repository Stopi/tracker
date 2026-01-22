import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderHook} from '@testing-library/react';
import useSWR from 'swr';
import {useApi, useApiMutation} from '@/lib/swr';

// Mock swr
vi.mock('swr', () => ({
  default: vi.fn(),
}));

const mockUseSWR = vi.mocked(useSWR);

describe('lib/swr.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useApi', () => {
    it('returns data, error, isLoading, isValidating, mutate from useSWR', async () => {
      const mockData = { test: 'data' };
      const mockMutate = vi.fn();

      mockUseSWR.mockReturnValue({
        data: mockData,
        error: null,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as any);

      const { result } = renderHook(() =>
        useApi('/test-key', () => Promise.resolve({ ok: true, json: () => Promise.resolve(mockData) } as Response))
      );

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isValidating).toBe(false);
      expect(result.current.mutate).toBe(mockMutate);
    });

    it('passes key and fetcher to useSWR', () => {
      mockUseSWR.mockReturnValue({
        data: null,
        error: null,
        isLoading: true,
        isValidating: false,
        mutate: vi.fn(),
      } as any);

      const mockFetcher = () => Promise.resolve({} as Response);

      renderHook(() => useApi('/my-key', mockFetcher));

      expect(mockUseSWR).toHaveBeenCalledWith(
        '/my-key',
        expect.any(Function),
        expect.objectContaining({
          revalidateOnFocus: false,
          dedupingInterval: 5000,
        })
      );
    });

    it('applies custom config options', () => {
      mockUseSWR.mockReturnValue({
        data: null,
        error: null,
        isLoading: true,
        isValidating: false,
        mutate: vi.fn(),
      } as any);

      const customConfig = { revalidateOnFocus: true, dedupingInterval: 10000 };

      renderHook(() =>
        useApi('/test', () => Promise.resolve({} as Response), customConfig)
      );

      expect(mockUseSWR).toHaveBeenCalledWith(
        '/test',
        expect.any(Function),
        expect.objectContaining(customConfig)
      );
    });

    it('handles null key and fetcher gracefully', () => {
      mockUseSWR.mockReturnValue({
        data: null,
        error: null,
        isLoading: true,
        isValidating: false,
        mutate: vi.fn(),
      } as any);

      renderHook(() => useApi(null, null));

      expect(mockUseSWR).toHaveBeenCalledWith(
        null,
        null,
        expect.any(Object)
      );
    });
  });

  describe('useApiMutation', () => {
    it('returns data, error, isLoading, trigger, mutate', async () => {
      mockUseSWR.mockReturnValue({
        data: null,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      } as any);

      const { result } = renderHook(() =>
        useApiMutation(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) } as Response))
      );

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.trigger).toBe('function');
      expect(typeof result.current.mutate).toBe('function');
    });

    it('trigger calls mutator and updates cache on success', async () => {
      const mockMutate = vi.fn();
      mockUseSWR.mockReturnValue({
        data: null,
        error: null,
        isLoading: false,
        mutate: mockMutate,
      } as any);

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ id: 1, name: 'test' }),
      };

      const { result } = renderHook(() =>
        useApiMutation(() => Promise.resolve(mockResponse as unknown as Response))
      );

      await result.current.trigger();

      expect(mockMutate).toHaveBeenCalledWith({ id: 1, name: 'test' }, false);
    });

    it('trigger throws error when response is not ok', async () => {
      mockUseSWR.mockReturnValue({
        data: null,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      } as any);

      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({ error: 'Bad request' }),
      };

      const { result } = renderHook(() =>
        useApiMutation(() => Promise.resolve(mockResponse as unknown as Response))
      );

      await expect(result.current.trigger()).rejects.toThrow('Bad request');
    });

    it('applies custom config options', () => {
      mockUseSWR.mockReturnValue({
        data: null,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      } as any);

      const customConfig = { revalidateOnFocus: true };

      renderHook(() =>
        useApiMutation(() => Promise.resolve({} as Response), customConfig)
      );

      expect(mockUseSWR).toHaveBeenCalledWith(
        null,
        expect.any(Function),
        customConfig
      );
    });
  });
});
