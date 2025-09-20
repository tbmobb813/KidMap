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
  return { ...cacheMetrics };
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
      const serialized = JSON.stringify(client);
      await AsyncStorage.setItem(CACHE_KEY, serialized);

      cacheMetrics.persistCount++;
      cacheMetrics.lastPersistTime = Date.now() - startTime;

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
      cacheMetrics.lastRestoreTime = Date.now() - startTime;

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
