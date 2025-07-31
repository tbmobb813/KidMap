// __tests__/helpers/mocks/mockAsyncStorage.ts - Comprehensive AsyncStorage mock for KidMap testing
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys used throughout the app
export const STORAGE_KEYS = {
    USER_STATS: 'user_stats',
    ACHIEVEMENTS: 'achievements',
    SAFE_ZONES: 'safe_zones',
    TRIP_JOURNAL: 'trip_journal',
    SAFETY_CONTACTS: 'safety_contacts',
    USER_PREFERENCES: 'user_preferences',
    PARENT_AUTH: 'parent_auth',
    ACCESSIBILITY_SETTINGS: 'accessibility_settings',
    REGION_SETTINGS: 'region_settings',
    GAMIFICATION_DATA: 'gamification_data',
    PHOTO_CHECKINS: 'photo_checkins',
    FAVORITE_PLACES: 'favorite_places',
    ROUTE_HISTORY: 'route_history',
    SAFETY_SETTINGS: 'safety_settings',
} as const;

// Default mock data for different storage keys
export const DEFAULT_STORAGE_DATA = {
    ... // existing mock data ...
};

// Mock storage implementation
export class MockAsyncStorage {
    private storage: Record<string, string> = { ...DEFAULT_STORAGE_DATA };
    private shouldFail = false;
    private failureError = new Error('MockAsyncStorage: Simulated failure');

    setFailureMode(shouldFail: boolean, error?: Error) {
        this.shouldFail = shouldFail;
        if (error) {
            this.failureError = error;
        }
    }

    resetToDefaults() {
        this.storage = { ...DEFAULT_STORAGE_DATA };
        this.shouldFail = false;
    }

    async getItem(key: string): Promise<string | null> {
        if (this.shouldFail) throw this.failureError;
        return this.storage[key] ?? null;
    }
    async setItem(key: string, value: string): Promise<void> {
        if (this.shouldFail) throw this.failureError;
        this.storage[key] = value;
    }
    async removeItem(key: string): Promise<void> {
        if (this.shouldFail) throw this.failureError;
        delete this.storage[key];
    }
}

// Helper to create a Jest mock of AsyncStorage
export const createAsyncStorageMock = () => new MockAsyncStorage();
