import React from "react";

import PhotoCheckInHistory from "../../components/PhotoCheckInHistory";
import { render } from "../testUtils";

jest.mock("@/stores/navigationStore", () => ({
  useNavigationStore: () => ({
    photoCheckIns: [{ placeName: "Test Place", timestamp: Date.now() }],
  }),
}));

describe("PhotoCheckInHistory", () => {
  it("renders without crashing", () => {
    render(<PhotoCheckInHistory />);
  });
});
