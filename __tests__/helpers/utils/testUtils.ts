// Common test utilities
import { createAsyncStorageMock } from '../mocks/mockAsyncStorage';
export const resetStoreState = (store) => {
    const state = store.getState();
    state.setCategories([]);
    state.setSelectedCategories([]);
    state.setCustomCategories([]);
};

export const mockApiCall = (response) => jest.fn().mockResolvedValue(response);

export const generateTestId = (prefix) => `${prefix}-${Date.now()}`;

// Safe Zone Mock Data
export const mockSafeZones = [
    { id: 'zone-1', name: 'Home', radius: 100, center: [40.7128, -74.0060] as [number, number], createdAt: new Date('2025-07-31T00:00:00Z'), updatedAt: new Date('2025-07-31T00:00:00Z') },
    { id: 'zone-2', name: 'School', radius: 200, center: [40.73061, -73.935242] as [number, number], createdAt: new Date('2025-07-31T00:00:00Z'), updatedAt: new Date('2025-07-31T00:00:00Z') },
];

export const createMockSafeZone = (overrides: Partial<typeof mockSafeZones[0]> = {}) => ({
    id: `zone-${Date.now()}`,
    name: 'Custom Zone',
    radius: 150,
    center: [40.7128, -74.0060] as [number, number],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

// Emergency Contact Mock Data
export const mockEmergencyContacts = [
    { id: 'contact-1', name: 'Mom', phone: '+1234567890', relationship: 'mother', priority: 1, canReceiveAlerts: true, canViewLocation: true },
    { id: 'contact-2', name: 'Dad', phone: '+0987654321', relationship: 'father', priority: 2, canReceiveAlerts: false, canViewLocation: true },
];

export const createMockEmergencyContact = (overrides: Partial<typeof mockEmergencyContacts[0]> = {}) => ({
    id: `contact-${Date.now()}`,
    name: 'Custom Contact',
    phone: '+1122334455',
    relationship: 'relative',
    priority: 3,
    canReceiveAlerts: true,
    canViewLocation: false,
    ...overrides,
});

// Test Setup: Native Module Mocks
export const setupMocks = () => {
    // Mock React Native Alert
    jest.spyOn(require('react-native'), 'Alert', 'get').mockReturnValue({ alert: jest.fn() });
    // Mock AsyncStorage
    jest.doMock('@react-native-async-storage/async-storage', () => createAsyncStorageMock());
};
