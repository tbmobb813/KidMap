import { jest } from "@jest/globals";

import { render } from "../testUtils";

import OnboardingFlow from "@/components/OnboardingFlow";

const mockRegions = [
  { id: "nyc", name: "New York City" },
  { id: "sf", name: "San Francisco" },
  { id: "london", name: "London" },
];
const mockRegionStore = {
  availableRegions: mockRegions,
  userPreferences: {
    selectedRegion: null,
    preferredUnits: "imperial",
    accessibilityMode: false,
    parentalControls: false,
  },
  setRegion: jest.fn(),
  updatePreferences: jest.fn(),
  completeOnboarding: jest.fn(),
};
jest.mock("@/stores/regionStore", () => ({
  useRegionStore: () => mockRegionStore,
}));

describe("OnboardingFlow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRegionStore.userPreferences = {
      selectedRegion: null,
      preferredUnits: "imperial",
      accessibilityMode: false,
      parentalControls: false,
    };
  });
  it("renders welcome", () => {
    const { getByText } = render(<OnboardingFlow onComplete={() => {}} />);
    expect(getByText("Welcome to KidMap")).toBeTruthy();
  });
});
