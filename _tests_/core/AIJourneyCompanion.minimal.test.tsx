  it("does not render when no destination", () => {
    const { queryByTestId } = render(
      <ThemeProvider>
        <AIJourneyCompanion
          isNavigating={true}
          destination={undefined}
          currentLocation={{ latitude: 0, longitude: 0 }}
        />
      </ThemeProvider>
    );
    // Should not render the main companion UI if destination is missing
    expect(queryByTestId("icon-Bot")).toBeNull();
  });
import React from "react";
import { render, act } from "@testing-library/react-native";
import { ThemeProvider } from "@/constants/theme";
import AIJourneyCompanion from "@/components/AIJourneyCompanion";
import type { PlaceCategory } from "@/types/navigation";
        clone: function () { return this as unknown as Response; },
describe("AIJourneyCompanion minimal render", () => {
  beforeAll(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        redirected: false,
        headers: new Headers(),
        url: "",
        type: "default",
          clone() { return this; },
        body: null,
        bodyUsed: false,
        json: () => Promise.resolve({ completion: "Test content" }),
        text: () => Promise.resolve(""),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve({
          append: () => {},
          delete: () => {},
          get: () => null,
          getAll: () => [],
          has: () => false,
          set: () => {},
          forEach: () => {},
          getParts: () => [],
        }),
        bytes: () => Promise.resolve(new Uint8Array(0)),
      })
    );
  });
  afterAll(() => {
    // @ts-ignore
    delete global.fetch;
  });

  it("does not render when no destination", () => {
    const { queryByTestId } = render(
      <ThemeProvider>
        <AIJourneyCompanion
          isNavigating={true}
          destination={undefined}
          currentLocation={{ latitude: 0, longitude: 0 }}
        />
      </ThemeProvider>
    );
    expect(queryByTestId("icon-Bot")).toBeNull();
  });

import React from "react";
import { render, act } from "@testing-library/react-native";
import { ThemeProvider } from "@/constants/theme";
import AIJourneyCompanion from "@/components/AIJourneyCompanion";
import type { PlaceCategory } from "@/types/navigation";

describe("AIJourneyCompanion minimal render", () => {
  beforeAll(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        redirected: false,
        headers: new Headers(),
        url: "",
        type: "default",
        clone() { return this; },
        body: null,
        bodyUsed: false,
        json: () => Promise.resolve({ completion: "Test content" }),
        text: () => Promise.resolve("")
      })
    );
  });
  afterAll(() => {
    // @ts-ignore
    delete global.fetch;
  });

  it("does not render when no destination", () => {
    const { queryByTestId } = render(
      <ThemeProvider>
        <AIJourneyCompanion
          isNavigating={true}
          destination={undefined}
          currentLocation={{ latitude: 0, longitude: 0 }}
        />
      </ThemeProvider>
    );
    expect(queryByTestId("icon-Bot")).toBeNull();
  });

  it("does not render when not navigating", () => {
    const { queryByTestId } = render(
      <ThemeProvider>
        <AIJourneyCompanion
          isNavigating={false}
          destination={{
            id: "test",
            name: "Test Place",
            address: "123 Test St",
            category: "park" as PlaceCategory,
            coordinates: { latitude: 1, longitude: 2 }
          }}
          currentLocation={{ latitude: 0, longitude: 0 }}
        />
      </ThemeProvider>
    );
    expect(queryByTestId("icon-Bot")).toBeNull();
  });

  it("renders without crashing (minimal)", () => {
    render(
      <ThemeProvider>
        <AIJourneyCompanion
          isNavigating={true}
          destination={{
            id: "test",
            name: "Test Place",
            address: "123 Test St",
            category: "park" as PlaceCategory,
            coordinates: { latitude: 1, longitude: 2 }
          }}
          currentLocation={{ latitude: 0, longitude: 0 }}
        />
      </ThemeProvider>
    );
  });

  it("displays AI generated message after navigation starts", async () => {
    const { findByText } = render(
      <ThemeProvider>
        <AIJourneyCompanion
          isNavigating={true}
          destination={{
            id: "test",
            name: "Test Place",
            address: "123 Test St",
            category: "park" as PlaceCategory,
            coordinates: { latitude: 1, longitude: 2 }
          }}
          currentLocation={{ latitude: 0, longitude: 0 }}
        />
      </ThemeProvider>
    );
    expect(await findByText(/Test content/)).toBeTruthy();
  });

  it('displays quiz question after navigation starts', async () => {
    const mockDestination = {
      id: 'dest1',
      name: 'Museum',
      address: '1 Main St',
      category: 'library' as PlaceCategory,
      coordinates: { latitude: 0, longitude: 0 }
    };
    const { findByText, getByText } = render(
      <ThemeProvider>
        <AIJourneyCompanion
          isNavigating={true}
          destination={mockDestination}
          currentLocation={{ latitude: 0, longitude: 0 }}
        />
      </ThemeProvider>
    );
    // Expand the companion to show action buttons
    const buddy = getByText('Buddy');
    act(() => {
      buddy.parent?.props?.onPress?.();
    });
    // Press the Quiz Me! button
    const quizButton = getByText('Quiz Me!');
    act(() => {
      quizButton.parent?.props?.onPress?.();
    });
    const quizText = await findByText(/Quiz Time!/i);
    expect(quizText).toBeTruthy();
  });
});
  it("displays AI generated message after navigation starts", async () => {
    const { findByText } = render(
      <ThemeProvider>
        <AIJourneyCompanion
          isNavigating={true}
          destination={{
            id: "test",
            name: "Test Place",
            address: "123 Test St",
            category: "park" as PlaceCategory,
            coordinates: { latitude: 1, longitude: 2 }
          }}
          currentLocation={{ latitude: 0, longitude: 0 }}
        />
      </ThemeProvider>
    );
    expect(await findByText(/Test content/)).toBeTruthy();
  });

  it('displays quiz question after navigation starts', async () => {
    const mockDestination = {
      id: 'dest1',
      name: 'Museum',
      address: '1 Main St',
      category: 'library' as PlaceCategory,
      coordinates: { latitude: 0, longitude: 0 }
    };
    const { findByText, getByText } = render(
      <ThemeProvider>
        <AIJourneyCompanion
          isNavigating={true}
          destination={mockDestination}
          currentLocation={{ latitude: 0, longitude: 0 }}
        />
      </ThemeProvider>
    );
    // Expand the companion to show action buttons
    const buddy = getByText('Buddy');
    act(() => {
      buddy.parent?.props?.onPress?.();
    });
    // Press the Quiz Me! button
    const quizButton = getByText('Quiz Me!');
    act(() => {
      quizButton.parent?.props?.onPress?.();
    });
    const quizText = await findByText(/Quiz Time!/i);
    expect(quizText).toBeTruthy();
  });
});
        body: null,
        bodyUsed: false,
        json: () => Promise.resolve({ completion: "Test content" }),
        text: () => Promise.resolve(""),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve({
          append: () => {},
          delete: () => {},
          get: () => null,
          getAll: () => [],
          has: () => false,
          set: () => {},
          forEach: () => {},
          getParts: () => [],
        }),
        bytes: () => Promise.resolve(new Uint8Array(0)),
      })
    );
  });
  afterAll(() => {
    // @ts-ignore
    delete global.fetch;
  });
import type { PlaceCategory } from "@/types/navigation";

describe("AIJourneyCompanion minimal render", () => {
  beforeAll(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        redirected: false,
  headers: new Headers(),
        url: "",
        type: "default",
  clone: function () { return this as unknown as Response; },
        body: null,
        bodyUsed: false,
        json: () => Promise.resolve({ completion: "Test content" }),
        text: () => Promise.resolve(""),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve({
          append: () => {},
          delete: () => {},
          get: () => null,
          getAll: () => [],
          has: () => false,
          set: () => {},
          forEach: () => {},
          getParts: () => [],
        }),
        bytes: () => Promise.resolve(new Uint8Array(0)),
      })
    );
  });
  afterAll(() => {
    // @ts-ignore
    delete global.fetch;
  });
  it("renders without crashing (minimal)", () => {
    render(
      <ThemeProvider>
        <AIJourneyCompanion
          isNavigating={true}
          destination={{
            id: "test",
            name: "Test Place",
            address: "123 Test St",
            category: "park",
            coordinates: { latitude: 1, longitude: 2 }
          }}
          currentLocation={{ latitude: 0, longitude: 0 }}
        />
      </ThemeProvider>
    );
  });

  it("displays AI generated message after navigation starts", async () => {
    const { findByText } = render(
      <ThemeProvider>
        <AIJourneyCompanion
          isNavigating={true}
          destination={{
            id: "test",
            name: "Test Place",
            address: "123 Test St",
            category: "park",
            coordinates: { latitude: 1, longitude: 2 }
          }}
          currentLocation={{ latitude: 0, longitude: 0 }}
        />
      </ThemeProvider>
    );
    // Wait for the mocked AI message to appear
          it("displays AI generated message after navigation starts", async () => {
            const { findByText } = render(
              <ThemeProvider>
                <AIJourneyCompanion
                  isNavigating={true}
                  destination={{
                    id: "test",
                    name: "Test Place",
                    address: "123 Test St",
                    category: "park" as PlaceCategory,
                    coordinates: { latitude: 1, longitude: 2 }
                  }}
                  currentLocation={{ latitude: 0, longitude: 0 }}
                />
              </ThemeProvider>
            );
            // Wait for the mocked AI message to appear
            expect(await findByText(/Test content/)).toBeTruthy();
          });
            buddy.parent?.props?.onPress?.(); // Simulate press to expand (if possible)
          it('displays quiz question after navigation starts', async () => {
            const mockDestination = {
              id: 'dest1',
              name: 'Museum',
              address: '1 Main St',
              category: 'library' as PlaceCategory,
              coordinates: { latitude: 0, longitude: 0 }
            };
            const { findByText, getByText } = render(
              <ThemeProvider>
                <AIJourneyCompanion
                  isNavigating={true}
                  destination={mockDestination}
                  currentLocation={{ latitude: 0, longitude: 0 }}
                />
              </ThemeProvider>
            );
            // Expand the companion to show action buttons
            const buddy = getByText('Buddy');
            act(() => {
              buddy.parent?.props?.onPress?.();
            });
            // Press the Quiz Me! button
            const quizButton = getByText('Quiz Me!');
            act(() => {
              quizButton.parent?.props?.onPress?.();
            });
            // Wait for quiz question to appear
            const quizText = await findByText(/Quiz Time!/i);
            expect(quizText).toBeTruthy();
          });
          it('displays quiz question after navigation starts', async () => {
            const mockDestination = {
              id: 'dest1',
              name: 'Museum',
              address: '1 Main St',
              category: 'library', // valid PlaceCategory
              coordinates: { latitude: 0, longitude: 0 }
            };
            const { findByText, getByText } = render(
              <ThemeProvider>
                <AIJourneyCompanion
                  isNavigating={true}
                  destination={mockDestination}
                  currentLocation={{ latitude: 0, longitude: 0 }}
                />
              </ThemeProvider>
            );
            // Expand the companion to show action buttons
            const buddy = getByText('Buddy');
            buddy.parent?.props?.onPress?.(); // Simulate press to expand (if possible)
            // If not, use fireEvent
            // fireEvent.press(buddy.parent);
            // Press the Quiz Me! button
            const quizButton = getByText('Quiz Me!');
            quizButton.parent?.props?.onPress?.(); // Simulate press
            // Wait for quiz question to appear
            const quizText = await findByText(/Quiz Time!/i);
            expect(quizText).toBeTruthy();
          });
            // If not, use fireEvent
            // fireEvent.press(buddy.parent);
            // Press the Quiz Me! button
            const quizButton = getByText('Quiz Me!');
            quizButton.parent?.props?.onPress?.(); // Simulate press
            // Wait for quiz question to appear
            const quizText = await findByText(/Quiz Time!/i);
            expect(quizText).toBeTruthy();
          });
    expect(await findByText(/Test content/)).toBeTruthy();
  });
});
