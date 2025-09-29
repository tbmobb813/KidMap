import React from "react";

import PhotoCheckInHistory from "../../components/PhotoCheckInHistory";
import { render } from "../testUtils";

jest.mock("@/stores/navigationStore", () => ({
  useNavigationStore: () => ({
    photoCheckIns: [{ id: 'test-1', placeName: "Test Place", timestamp: Date.now(), photoUrl: 'https://example.com/photo.jpg' }],
  }),
}));

describe("PhotoCheckInHistory", () => {
  it("renders without crashing", () => {
    const { getByText } = render(<PhotoCheckInHistory />);

    // The mocked check-in includes a placeName and timestamp. Assert the
    // place name is rendered and that a time-like string (HH:MM) appears.
    expect(getByText("Test Place")).toBeTruthy();
    // Timestamp rendering depends on locale, so assert a time-like pattern
    // (hours:minutes) appears somewhere in the rendered output.
    expect(getByText(/\d{1,2}:\d{2}/)).toBeTruthy();
  });
});
