// Mock AsyncStorage data
export const mockAsyncStorageData = {
    USER_PREFERENCES: JSON.stringify({
        theme: 'dark',
        notificationsEnabled: true,
        language: 'en',
    }),
    USER_STATS: JSON.stringify({
        tripsCompleted: 10,
        achievementsUnlocked: 5,
    }),
    SAFE_ZONES: JSON.stringify([
        {
            id: 'zone-home',
            name: 'Home',
            latitude: 40.7128,
            longitude: -74.006,
            radius: 100,
            isActive: true,
        },
    ]),
};
