/* eslint-env jest */
// ES module-style mock for use in tests. Named exports mirror the real store API
// and avoid CommonJS/global issues with linters in some environments.
export const useParentalStore = () => {
  return {
    settings: { emergencyContacts: [] },
    safeZones: [],
    checkInRequests: [],
  };
};

export const ParentalProvider = ({ children }) => children;

// Provide a default export for consumers that may use default imports
export default {
  useParentalStore,
  ParentalProvider,
};
