import { jest } from "@jest/globals";
import { fireEvent, waitFor } from "@testing-library/react-native";

import { render } from "../testUtils";

import OnboardingFlow from "@/components/OnboardingFlow";

// Mock lucide-react-native icons
jest.mock("lucide-react-native", () => ({
  MapPin: ({ size, color, ...props }: any) => {
    const { Text } = require("react-native");
    return Text({
      testID: "mappin-icon",
      children: `MapPin(${size},${color})`,
      ...props,
    });
  },
  Settings: ({ size, color, ...props }: any) => {
    const { Text } = require("react-native");
    return Text({
      testID: "settings-icon",
      children: `Settings(${size},${color})`,
      ...props,
    });
  },
  Shield: ({ size, color, ...props }: any) => {
    const { Text } = require("react-native");
    return Text({
      testID: "shield-icon",
      children: `Shield(${size},${color})`,
      ...props,
    });
  },
  CheckCircle: ({ size, color, ...props }: any) => {
    const { Text } = require("react-native");
    return Text({
      testID: "check-circle-icon",
      children: `CheckCircle(${size},${color})`,
      ...props,
    });
  },
}));

// Mock RegionSelector component
jest.mock("@/components/RegionSelector", () => {
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
          key: "title",
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
            key: "continue",
            testID: "region-continue-button",
            onPress: () => {}, // Will be handled by parent
            children: Text({ children: "Continue" }),
          }),
      ],
    });
  };
});

const mockRegions = [
  { id: "nyc", name: "New York City", country: "US" },
  { id: "sf", name: "San Francisco", country: "US" },
  { id: "london", name: "London", country: "UK" },
];

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

describe("OnboardingFlow", () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRegionStore.userPreferences = {
      selectedRegion: null,
      preferredUnits: "imperial",
      accessibilityMode: false,
      parentalControls: false,
    };
  });

  describe("Basic Rendering", () => {
    it("renders welcome step", () => {
      const { getByText } = render(
        <OnboardingFlow onComplete={mockOnComplete} />
      );
      expect(getByText("Welcome to KidMap")).toBeTruthy();
    });

    it("renders without crashing", () => {
      expect(() =>
        render(<OnboardingFlow onComplete={mockOnComplete} />)
      ).not.toThrow();
    });

    it("displays welcome message and map icon", () => {
      const { getByText, getByTestId } = render(
        <OnboardingFlow onComplete={mockOnComplete} />
      );

      expect(getByText("Welcome to KidMap")).toBeTruthy();
      expect(getByTestId("mappin-icon")).toBeTruthy();
    });
  });

  describe("Step Navigation", () => {
    it("navigates from welcome to region selection", async () => {
      const { getByText, getByTestId } = render(
        <OnboardingFlow onComplete={mockOnComplete} />
      );

      // Start on welcome step
      expect(getByText("Welcome to KidMap")).toBeTruthy();

      // Find and press Get Started button
      const getStartedButton = getByText("Get Started");
      fireEvent.press(getStartedButton);

      // Should navigate to region selection
      await waitFor(() => {
        expect(getByTestId("region-selector")).toBeTruthy();
      });
    });

    it("allows region selection and updates store", async () => {
      const { getByText, getByTestId } = render(
        <OnboardingFlow onComplete={mockOnComplete} />
      );

      // Navigate to region step
      fireEvent.press(getByText("Get Started"));

      await waitFor(() => {
        expect(getByTestId("region-selector")).toBeTruthy();
      });

      // Select a region
      const nycOption = getByTestId("region-option-nyc");
      fireEvent.press(nycOption);

      // Should update the store
      expect(mockRegionStore.setRegion).toHaveBeenCalledWith("nyc");
    });
  });

  describe("Multi-Step Workflow", () => {
    it("progresses through all onboarding steps", async () => {
      const { getByText, getByTestId } = render(
        <OnboardingFlow onComplete={mockOnComplete} />
      );

      // Step 1: Welcome
      expect(getByText("Welcome to KidMap")).toBeTruthy();
      fireEvent.press(getByText("Get Started"));

      // Step 2: Region Selection
      await waitFor(() => {
        expect(getByTestId("region-selector")).toBeTruthy();
      });

      // Select region and continue
      fireEvent.press(getByTestId("region-option-nyc"));

      // Step 3: Look for preferences step
      await waitFor(
        () => {
          expect(getByTestId("settings-icon")).toBeTruthy();
        },
        { timeout: 2000 }
      );
    });

    it("handles preference configuration", async () => {
      // Set up to start at preferences step
      mockRegionStore.userPreferences.selectedRegion = "nyc";

      const { getByText } = render(
        <OnboardingFlow onComplete={mockOnComplete} />
      );

      fireEvent.press(getByText("Get Started"));

      // Look for units selection
      await waitFor(
        () => {
          const metricButton = getByText("Metric");
          fireEvent.press(metricButton);

          expect(mockRegionStore.updatePreferences).toHaveBeenCalledWith(
            expect.objectContaining({ preferredUnits: "metric" })
          );
        },
        { timeout: 2000 }
      );
    });
  });

  describe("Safety Features", () => {
    it("displays safety configuration step", async () => {
      mockRegionStore.userPreferences.selectedRegion = "nyc";

      const { getByText, getByTestId } = render(
        <OnboardingFlow onComplete={mockOnComplete} />
      );

      fireEvent.press(getByText("Get Started"));

      // Navigate through to safety step
      await waitFor(
        () => {
          expect(getByTestId("shield-icon")).toBeTruthy();
          expect(getByText("Safety Features")).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });

    it("enables parental controls", async () => {
      mockRegionStore.userPreferences.selectedRegion = "nyc";

      const { getByText } = render(
        <OnboardingFlow onComplete={mockOnComplete} />
      );

      fireEvent.press(getByText("Get Started"));

      await waitFor(
        () => {
          const parentalControlsToggle = getByText("Enable Parental Controls");
          fireEvent.press(parentalControlsToggle);

          expect(mockRegionStore.updatePreferences).toHaveBeenCalledWith(
            expect.objectContaining({ parentalControls: true })
          );
        },
        { timeout: 3000 }
      );
    });
  });

  describe("Onboarding Completion", () => {
    it("completes the full onboarding flow", async () => {
      mockRegionStore.userPreferences.selectedRegion = "nyc";

      const { getByText, getByTestId } = render(
        <OnboardingFlow onComplete={mockOnComplete} />
      );

      fireEvent.press(getByText("Get Started"));

      // Navigate to final completion step
      await waitFor(
        () => {
          expect(getByTestId("check-circle-icon")).toBeTruthy();
          expect(getByText("You're All Set!")).toBeTruthy();
        },
        { timeout: 4000 }
      );

      const finishButton = getByText("Get Exploring!");
      fireEvent.press(finishButton);

      expect(mockRegionStore.completeOnboarding).toHaveBeenCalled();
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("handles missing regions gracefully", () => {
      mockRegionStore.availableRegions = [];

      expect(() =>
        render(<OnboardingFlow onComplete={mockOnComplete} />)
      ).not.toThrow();
    });

    it("handles store failures gracefully", () => {
      mockRegionStore.setRegion.mockImplementation(() => {
        throw new Error("Store error");
      });

      const { getByText } = render(
        <OnboardingFlow onComplete={mockOnComplete} />
      );

      expect(() => {
        fireEvent.press(getByText("Get Started"));
      }).not.toThrow();
    });

    it("handles accessibility mode toggle", async () => {
      const { getByText } = render(
        <OnboardingFlow onComplete={mockOnComplete} />
      );

      fireEvent.press(getByText("Get Started"));

      await waitFor(
        () => {
          const accessibilityToggle = getByText("Enable Accessibility Mode");
          fireEvent.press(accessibilityToggle);

          expect(mockRegionStore.updatePreferences).toHaveBeenCalledWith(
            expect.objectContaining({ accessibilityMode: true })
          );
        },
        { timeout: 3000 }
      );
    });
  });
});
