// Archived: merged into `_tests_/core/OnboardingFlow.test.tsx`
// Original moved here on 2025-09-09 by automated dedupe assistant.
// File preserved for reference; delete after human review if no longer needed.

/**
 * COMPREHENSIVE TEST SUITE: OnboardingFlow Component
 *
 * This component is COMPLEX with 243 lines, multi-step wizard workflow,
 * state management, region integration, and preferences handling. Requires thorough testing.
 *
 * Features tested:
 * - Multi-step workflow navigation
 * - State management across steps
 * - Region selector integration
 * - User preferences handling
 * - Safety feature configuration
 * - Theme integration
 * - Accessibility features
 * - Complete onboarding workflow
 */

import { jest } from "@jest/globals";

import { render } from "../../testUtils";

import OnboardingFlow from "@/components/OnboardingFlow";

// ===== MOCK SECTION =====
// Mock RegionSelector component
const mockRegions = [
  { id: "nyc", name: "New York City", country: "US" },
  { id: "sf", name: "San Francisco", country: "US" },
  { id: "london", name: "London", country: "UK" },
];

jest.mock("../../components/RegionSelector", () => {
  return function MockRegionSelector({
    regions,
    selectedRegion,
    onSelectRegion,
  }: any) {
    const { View, Text, Pressable } = require("react-native");
    return View({
      testID: "region-selector",
      children: [
        Text({
          testID: "region-selector-title",
          children: "Select your region",
        }),
        ...regions.map((region: any) =>
          Pressable({
            key: region.id,
            testID: `region-option-${region.id}`,
            onPress: () => onSelectRegion(region.id),
            children: Text({
              children: region.name,
              style: selectedRegion === region.id ? { fontWeight: "bold" } : {},
            }),
          })
        ),
        selectedRegion &&
          Pressable({
            testID: "region-continue-button",
            onPress: () => {}, // Will be handled by parent
            children: Text({ children: "Continue" }),
          }),
      ],
    });
  };
});

// Mock lucide-react-native icons
jest.mock("lucide-react-native", () => ({
  MapPin: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "mappin-icon",
      children: `MapPin(${size},${color})`,
      ...props,
    }),
  Settings: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "settings-icon",
      children: `Settings(${size},${color})`,
      ...props,
    }),
  Shield: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "shield-icon",
      children: `Shield(${size},${color})`,
      ...props,
    }),
  CheckCircle: ({ size, color, ...props }: any) =>
    require("react-native").Text({
      testID: "check-circle-icon",
      children: `CheckCircle(${size},${color})`,
      ...props,
    }),
}));

// Mock region store
const mockRegionStore = {
  availableRegions: mockRegions,
  userPreferences: {
    selectedRegion: null as string | null,
    preferredUnits: "imperial" as "imperial" | "metric",
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

// ===== TEST SETUP =====
describe("OnboardingFlow", () => {
  // Mock functions

  // Default props for the component
  // Removed unused defaultProps variable

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Reset store state
    mockRegionStore.userPreferences = {
      selectedRegion: null,
      preferredUnits: "imperial",
      accessibilityMode: false,
      parentalControls: false,
    };
  });

  // ===== ORIGINAL TEST (Enhanced) =====
  describe("Basic Rendering (Original)", () => {
    it("renders without crashing", () => {
      const { getByText } = render(<OnboardingFlow onComplete={() => {}} />);
      expect(getByText("Welcome to KidMap")).toBeTruthy();
    });
  });

  // ...existing code...
});
