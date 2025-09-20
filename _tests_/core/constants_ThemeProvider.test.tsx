/**
 * ThemeProvider test following Basic Template pattern
 * Special case: Tests ThemeProvider directly without AllTheProviders wrapper
 */

import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Text, View, TouchableOpacity } from "react-native";

import {
  ThemeProvider,
  useTheme,
  useThemeControls,
} from "../../constants/theme";

// ===== TEST HELPER COMPONENT =====
const TestConsumer: React.FC = () => {
  const theme = useTheme();
  const { toggleDarkMode, enableHighContrast, setScheme } = useThemeControls();
  return (
    <View>
      <Text testID="themeName">{theme.name}</Text>
      <TouchableOpacity testID="toggle-btn" onPress={toggleDarkMode}>
        <Text>Toggle</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="contrast-btn"
        onPress={() => enableHighContrast(true)}
      >
        <Text>HighContrast</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="dark-btn" onPress={() => setScheme("dark")}>
        <Text>SetDark</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="light-btn" onPress={() => setScheme("light")}>
        <Text>SetLight</Text>
      </TouchableOpacity>
    </View>
  );
};

// ===== BASIC TEST SETUP =====
describe("ThemeProvider - Basic Tests", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  // ===== ESSENTIAL TESTS ONLY =====

  it("renders without crashing", () => {
    const { getByTestId } = render(
      <ThemeProvider initial="light">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(getByTestId("themeName")).toBeTruthy();
  });

  it("displays theme name correctly", () => {
    const { getByTestId } = render(
      <ThemeProvider initial="light">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(getByTestId("themeName").props.children).toBe("light");
  });

  it("handles primary user interaction - toggle dark mode", () => {
    const { getByTestId } = render(
      <ThemeProvider initial="light">
        <TestConsumer />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.press(getByTestId("toggle-btn"));
    });

    expect(getByTestId("themeName").props.children).toBe("dark");
  });

  it("handles different theme variations - high contrast", () => {
    const { getByTestId } = render(
      <ThemeProvider initial="light">
        <TestConsumer />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.press(getByTestId("contrast-btn"));
    });

    expect(getByTestId("themeName").props.children).toBe("highContrast");
  });

  it("handles setScheme functionality", () => {
    const { getByTestId } = render(
      <ThemeProvider initial="light">
        <TestConsumer />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.press(getByTestId("dark-btn"));
    });

    expect(getByTestId("themeName").props.children).toBe("dark");
  });

  it("handles reverse setScheme functionality", () => {
    const { getByTestId } = render(
      <ThemeProvider initial="dark">
        <TestConsumer />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.press(getByTestId("light-btn"));
    });

    expect(getByTestId("themeName").props.children).toBe("light");
  });
});
