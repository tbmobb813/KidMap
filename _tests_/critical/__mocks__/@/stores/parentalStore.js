/* eslint-env jest */
// Mock for @/stores/parentalStore
const { fn } = require('jest-mock');

const mockDashboardData = {
    safeZoneActivity: [],
    lastUpdated: Date.now(),
    totalAlerts: 0,
    status: 'monitoring'
};

const mockUseParentalStore = fn().mockReturnValue({
    safeZones: [],
    settings: {
        enabled: true,
        alertRadius: 100,
        notifications: true
    },
    dashboardData: mockDashboardData,
    saveDashboardData: fn(),
    addSafeZone: fn(),
    removeSafeZone: fn(),
    updateSettings: fn()
});

module.exports = {
    useParentalStore: mockUseParentalStore,
    __mockUseParentalStore: mockUseParentalStore,
};