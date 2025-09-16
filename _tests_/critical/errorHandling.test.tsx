import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import ErrorBoundary from "../../components/ErrorBoundary";
import { render, screen } from "../testUtils";


jest.mock("lucide-react-native", () => ({
  AlertTriangle: () => null,
  RefreshCw: () => null,
}));

describe("ErrorBoundary smoke", () => {
  const originalConsoleError = console.error;

  afterEach(() => {
    console.error = originalConsoleError; // restore
  });

  it("renders fallback when child throws", () => {
    console.error = () => {}; // suppress expected React error noise

    const Bomb = () => {
      throw new Error("boom");
    };

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("error-fallback-root")).toBeTruthy();
  });

  it("passes through children when no error occurs", () => {
    const OK = () => <Text>ok</Text>;

    render(
      <ErrorBoundary>
        <OK />
      </ErrorBoundary>
    );

    expect(screen.getByText(/ok/i)).toBeTruthy();
  });

  it("allows retry to recover after error", async () => {
    console.error = () => {};

    let attempt = 0;
    const BombThenOK = () => {
      if (attempt === 0) {
        attempt++;
        throw new Error("initial boom");
      }
      return <Text accessibilityLabel="recovered">Recovered</Text>;
    };

    const { queryByTestId, findByLabelText, findByTestId } = render(
      <ErrorBoundary>
        <BombThenOK />
      </ErrorBoundary>
    );

    // Fallback visible
    const retryButton = await findByTestId("error-retry-button");
    expect(retryButton).toBeTruthy();
    fireEvent.press(retryButton);

    // Await recovery
    const recovered = await findByLabelText(/recovered/i);
    expect(recovered).toBeTruthy();

    // Fallback testID should be gone now
    expect(queryByTestId("error-fallback-root")).toBeNull();
  });
});
