import React from "react";

import PhotoCheckInButton from "../../components/PhotoCheckInButton";
import { render } from "../testUtils";

jest.mock("@/stores/navigationStore", () => ({
  useNavigationStore: () => ({
    addPhotoCheckIn: jest.fn(),
  }),
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    toast: { message: "", type: "info", visible: false },
    showToast: jest.fn(),
    hideToast: jest.fn(),
  }),
}));

describe("PhotoCheckInButton", () => {
  it("renders and is accessible", () => {
    const { getByText } = render(
      <PhotoCheckInButton placeName="Test Place" placeId="p1" />
    );
    expect(getByText("Photo Check-in")).toBeTruthy();
  });
});
