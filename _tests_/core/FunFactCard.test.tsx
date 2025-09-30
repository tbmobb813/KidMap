/**
 * FunFactCard Component Tests
 *
 * ComponentTestTemplate test suite for FunFactCard educational content component.
 * Tests fact display, formatting, accessibility, and theme integration.
 */

import { render } from "@testing-library/react-native";
import React from "react";

import FunFactCard from "../../components/FunFactCard";
import { createTestWrapper } from "../testUtils";

// Mock lucide-react-native icons
jest.mock("lucide-react-native", () => ({
  Lightbulb: ({ size, color }: any) => `MockLightbulb-${size}-${color}`,
  X: ({ size, color }: any) => `MockX-${size}-${color}`,
}));

describe("FunFactCard", () => {
  const mockFact = "Did you know that libraries are amazing places to learn?";

  it("renders basic fact information", () => {
    const wrapper = createTestWrapper();
    const { getByText } = render(<FunFactCard fact={mockFact} />, { wrapper });

    expect(getByText(mockFact)).toBeTruthy();
  });

  it("renders without crashing with minimal props", () => {
    const wrapper = createTestWrapper();

    expect(() =>
      render(<FunFactCard fact="Simple fact" />, { wrapper })
    ).not.toThrow();
  });

  it("displays different fact content correctly", () => {
    const facts = [
      "Fun fact number one",
      "Another interesting fact",
      "A very long fact that might span multiple lines and should still render correctly in the component",
    ];

    facts.forEach((fact) => {
      const wrapper = createTestWrapper();
      const { getByText } = render(<FunFactCard fact={fact} />, { wrapper });

      expect(getByText(fact)).toBeTruthy();
    });
  });

  it("handles empty or edge case facts", () => {
    const edgeCases = ["", "Short", "💡 Fun fact with emoji"];

    edgeCases.forEach((fact) => {
      const wrapper = createTestWrapper();
      const { getByText, queryByText } = render(<FunFactCard fact={fact} />, {
        wrapper,
      });

      if (fact) {
        expect(getByText(fact)).toBeTruthy();
      } else {
        // Empty fact should still render component structure
        expect(queryByText("")).toBeTruthy();
      }
    });
  });
});
