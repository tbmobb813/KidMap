// fireEvent not needed; tests trigger reset via ref
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

    // Render a child that always throws to force the boundary into the
    // fallback state. Then reset and re-render with a non-throwing child to
    // simulate recovery. This avoids the concurrent-render recovery path
    // where a component throws then synchronously recovers inside the same
    // render, which is what causes flakiness.
    const Bomb = () => {
      throw new Error("initial boom");
    };

  const Recovered = () => <Text accessibilityLabel="recovered">Recovered</Text>;

    const ref = React.createRef<any>();

    const rendered = render(
      <ErrorBoundary ref={ref}>
        <Bomb />
      </ErrorBoundary>
    );

    // Confirm fallback present
    expect(rendered.getByTestId("error-fallback-root")).toBeTruthy();

    // Now clear the error state and re-render with the recovered child
    ref.current?.reset?.();
    rendered.rerender(
      <ErrorBoundary ref={ref}>
        <Recovered />
      </ErrorBoundary>
    );

    // Use a text-based query (findByText) which is available across runners.
  const recovered = await rendered.findByText(/recovered/i);
    expect(recovered).toBeTruthy();
    expect(rendered.queryByTestId("error-fallback-root")).toBeNull();
  });
});
