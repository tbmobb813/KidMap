/* eslint-env jest */
// ES module-style mock for use in tests. Named exports mirror the real store API
// and avoid CommonJS/global issues with linters in some environments.
export const useParentalStore = () => {
  // in-memory mock state
  const state = {
    settings: { emergencyContacts: [], requirePinForParentMode: true, parentPin: undefined },
    safeZones: [],
    checkInRequests: [],
    isParentMode: false,
  };

  return {
    get settings() {
      return state.settings;
    },
    get safeZones() {
      return state.safeZones;
    },
    get checkInRequests() {
      return state.checkInRequests;
    },
    // methods
    async addSafeZone(safeZone) {
      const newZone = { ...safeZone, id: `safe_zone_mock_${Date.now()}`, createdAt: Date.now() };
      state.safeZones.push(newZone);
      return newZone;
    },
    async authenticateParentMode(pin) {
      if (!state.settings.requirePinForParentMode) {
        state.isParentMode = true;
        return true;
      }
      if (state.settings.parentPin === pin) {
        state.isParentMode = true;
        return true;
      }
      return false;
    },
    async setParentPin(pin) {
      state.settings.parentPin = pin;
      return;
    },
  };
};

export const ParentalProvider = ({ children }) => children;

// Provide a default export for consumers that may use default imports
export default {
  useParentalStore,
  ParentalProvider,
};
