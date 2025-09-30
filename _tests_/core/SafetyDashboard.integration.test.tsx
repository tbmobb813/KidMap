/* Integration-style test for SafetyDashboard using testing-library.
   Use top-level jest.mock factories that read mutable variables so we can control mocked return values per-test
   without reloading testing-library or causing duplicate React instances.
*/
const React = require('react');
const { render, fireEvent } = require('@testing-library/react-native');

let mockParental: any = null;
let mockNavigation: any = null;
let mockSafeZoneStatus: any = null;

jest.mock('@/stores/parentalStore', () => ({
  __esModule: true,
  useParentalStore: () => mockParental,
  ParentalProvider: ({ children }: any) => children,
}));

jest.mock('@/stores/navigationStore', () => ({
  __esModule: true,
  useNavigationStore: () => mockNavigation,
}));

jest.mock('@/hooks/useSafeZoneMonitor', () => ({
  __esModule: true,
  useSafeZoneMonitor: () => ({ getCurrentSafeZoneStatus: () => mockSafeZoneStatus }),
}));

describe('SafetyDashboard integration', () => {
  it('renders header, shows inside safe-zone status and quick actions that can be hidden, shows contacts and photo checkin', () => {
    // Set mocks for this test
  mockParental = {
      settings: { emergencyContacts: [{ name: 'Parent', phone: '1' }] },
      checkInRequests: [],
      safeZones: [{ id: 'z1', name: 'Home', isActive: true, latitude: 0, longitude: 0, radius: 100 }],
    };

  mockNavigation = { photoCheckIns: [{ placeName: 'Park', timestamp: Date.now() }] };

  mockSafeZoneStatus = { inside: [{ id: 'z1', name: 'Home' }], outside: [] };

    // Require ThemeProvider and component now that mocks are in place
    const { ThemeProvider } = require('@/constants/theme');
    const SafetyDashboard = require('@/components/SafetyDashboard').default;

    const { getByText, getAllByText, queryByText } = render(
      React.createElement(ThemeProvider, null, React.createElement(SafetyDashboard, { currentPlace: { id: 'p1', name: 'Cafe' } }))
    );

    // Header rendered
    expect(getByText('Safety Dashboard')).toBeTruthy();

    // Safe zone status shows the inside message for mocked zone
    expect(getByText(/You're in the Home safe zone/)).toBeTruthy();

    // Quick action button exists ("I'm OK!")
    expect(getByText("I'm OK!")).toBeTruthy();

    // Emergency contacts and Contacts stat exist
    expect(getByText('Contacts')).toBeTruthy();
  expect(getAllByText('1').length).toBeGreaterThanOrEqual(1);

    // The Photo Check-in section should be present when currentPlace provided
    expect(getByText('Check-in at Current Location')).toBeTruthy();

    // Hide quick actions and assert "I'm OK!" no longer present
    const hideButton = getByText('Hide');
    fireEvent.press(hideButton);
    expect(queryByText("I'm OK!")).toBeNull();
  });
});
// The second variant was removed to avoid duplicating requires and nested testing-library lifecycle hooks.
