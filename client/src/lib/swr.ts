import useSWR, {type SWRConfiguration} from "swr";

/**
 * Hono RPC fetcher that converts Response to JSON and throws on HTTP errors.
 * Ensures useSWR receives a typed payload rather than raw Response objects.
 */
async function rpcFetcher<T>(_key: string, fetcher: () => Promise<Response>): Promise<T> {
  const res = await fetcher();
  if (!res.ok) {
    // Attempt to extract error message from JSON body; fallback to generic message
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || error.message || "Request failed");
  }
  return res.json() as Promise<T>;
}

/**
 * Data fetching hook using SWR with Hono RPC.
 * Returns typed data with built-in loading, error, and cache management.
 *
 * @param key - SWR cache key (null to skip fetching)
 * @param fetcher - RPC function that returns a Response
 * @param config - Optional SWR configuration
 */
export function useApi<T>(
  key: string | null,
  fetcher: (() => Promise<Response>) | null,
  config?: SWRConfiguration<T, Error>
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<T, Error>(
    key,
    fetcher ? () => rpcFetcher<T>(key!, fetcher) : null,
    {
      revalidateOnFocus: false, // Prevent refetching when window gains focus
      dedupingInterval: 5000, // Deduplicate requests within 5 seconds
      ...config,
    }
  );

  return { data, error, isLoading, isValidating, mutate };
}

/**
 * One-time mutation hook for operations without a cache key.
 * Unlike useApi, this triggers on demand via the returned trigger function.
 *
 * @param mutator - RPC function that performs the mutation
 * @param config - Optional SWR configuration
 */
export function useApiMutation<T>(
  mutator: () => Promise<Response>,
  config?: SWRConfiguration<T, Error>
) {
  const { data, error, isLoading, mutate } = useSWR<T, Error>(
    null,
    () => rpcFetcher<T>(null!, mutator),
    config
  );

  /**
   * Triggers the mutation and returns the result.
   * Automatically updates SWR cache on success.
   */
  const trigger = async () => {
    const res = await mutator();
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || err.message || "Request failed");
    }
    const result = await res.json() as T;
    await mutate(result, false); // Update cache without revalidation
    return result;
  };

  return { data, error, isLoading, trigger, mutate };
}
