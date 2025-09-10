import { jest } from "@jest/globals";
import { render } from "@testing-library/react-native";

import AIJourneyCompanion from "@/components/AIJourneyCompanion";
import { useTheme } from "@/constants/theme";

jest.mock("@/constants/theme");
jest.mock("lucide-react-native", () => ({
  Bot: () => "Bot",
}));

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

const mockTheme = {
  name: "light" as const,
  colors: { primary: "#007AFF" },
} as any;

describe("AIJourneyCompanion simplified", () => {
  beforeEach(() => {
    mockUseTheme.mockReturnValue(mockTheme as any);
    jest.clearAllMocks();
  });

  it("renders with minimal props", () => {
    expect(() =>
      render(
        <AIJourneyCompanion
          currentLocation={{ latitude: 0, longitude: 0 }}
          destination={undefined}
          isNavigating={false}
        />
      )
    ).not.toThrow();
  });
});
