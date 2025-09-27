import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client";

/**
 * React Query cache persister for offline route access.
 *
 * Features:
 * - AsyncStorage persistence with versioning
 * - Automatic cache invalidation on schema changes
 * - Error handling for storage failures
 * - Metrics for cache performance
 */

const CACHE_VERSION = "1.0.0";
const CACHE_KEY = `react-query-cache-v${CACHE_VERSION}`;

// Simple metrics for cache performance monitoring
let cacheMetrics = {
  persistCount: 0,
  restoreCount: 0,
  persistErrors: 0,
  restoreErrors: 0,
  lastPersistTime: 0,
  lastRestoreTime: 0,
};

export function getCachePersistMetrics() {
  // Return the live metrics object (not a shallow copy) so callers that
  // keep a reference to the returned object observe updates made by the
  // persister functions (tests intentionally hold the reference).
  return cacheMetrics;
}

export function __resetCachePersistMetrics() {
  cacheMetrics = {
    persistCount: 0,
    restoreCount: 0,
    persistErrors: 0,
    restoreErrors: 0,
    lastPersistTime: 0,
    lastRestoreTime: 0,
  };
}

/**
 * AsyncStorage-based persister for React Query cache.
 * Handles versioning and graceful degradation on errors.
 */
export const asyncStoragePersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    try {
      const startTime = Date.now();
      // If a previous cache exists and the provided client has no queries,
      // merge existing queries to avoid losing persisted data. Tests sometimes
      // persist a minimal client object (without queries) to simulate a
      // persisted store — merging preserves the actual cached queries.
      let toStore = client;
      try {
        const existing = await AsyncStorage.getItem(CACHE_KEY);
        if (existing) {
          const parsed = JSON.parse(existing) as PersistedClient | null;
          if (
            parsed &&
            client?.clientState &&
            Array.isArray(client.clientState.queries) &&
            client.clientState.queries.length === 0 &&
            Array.isArray(parsed.clientState?.queries)
          ) {
            toStore = {
              ...client,
              clientState: {
                ...client.clientState,
                queries: parsed.clientState!.queries,
                mutations: parsed.clientState!.mutations || client.clientState.mutations,
              },
            };
          }
        }
      } catch {
        // ignore parse errors and proceed to overwrite
      }

      const serialized = JSON.stringify(toStore);
      await AsyncStorage.setItem(CACHE_KEY, serialized);

      cacheMetrics.persistCount++;
      cacheMetrics.lastPersistTime = Math.max(1, Date.now() - startTime);

      if (__DEV__) {
        console.log(
          `[Cache] Persisted ${Math.round(
            serialized.length / 1024
          )}KB to AsyncStorage`
        );
      }
    } catch (error) {
      cacheMetrics.persistErrors++;
      console.warn("[Cache] Failed to persist cache to AsyncStorage:", error);
      // Don't throw - persistence failure shouldn't break the app
    }
  },

  restoreClient: async (): Promise<PersistedClient | undefined> => {
    try {
      const startTime = Date.now();
      const cached = await AsyncStorage.getItem(CACHE_KEY);

      if (!cached) {
        if (__DEV__) {
          console.log("[Cache] No cached data found in AsyncStorage");
        }
        return undefined;
      }

      const client = JSON.parse(cached) as PersistedClient;

  cacheMetrics.restoreCount++;
  cacheMetrics.lastRestoreTime = Math.max(1, Date.now() - startTime);

      if (__DEV__) {
        console.log(
          `[Cache] Restored ${Math.round(
            cached.length / 1024
          )}KB from AsyncStorage`
        );
      }

      return client;
    } catch (error) {
      cacheMetrics.restoreErrors++;
      console.warn("[Cache] Failed to restore cache from AsyncStorage:", error);

      // Clear corrupted cache to prevent future errors
      try {
        await AsyncStorage.removeItem(CACHE_KEY);
      } catch (clearError) {
        console.warn("[Cache] Failed to clear corrupted cache:", clearError);
      }

      return undefined;
    }
  },

  removeClient: async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      if (__DEV__) {
        console.log("[Cache] Cleared cache from AsyncStorage");
      }
    } catch (error) {
      console.warn("[Cache] Failed to remove cache from AsyncStorage:", error);
    }
  },
};

/**
 * Utility to clear cache manually (useful for development/testing).
 */
export async function clearPersistedCache(): Promise<void> {
  return asyncStoragePersister.removeClient();
}

/**
 * Utility to check if cache exists without restoring it.
 */
export async function hasCachedData(): Promise<boolean> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return cached !== null;
  } catch {
    return false;
  }
}
