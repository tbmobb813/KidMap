import { router } from "expo-router";

import { handleDeepLink } from "@/utils/deepLinking";

jest.mock("expo-router", () => ({
    router: {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    },
}));

describe("handleDeepLink", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("navigates to route detail with id", () => {
        handleDeepLink("https://kidmap.app/route/abc123");
        expect(router.push).toHaveBeenCalledWith("/route/abc123");
    });

    it("navigates to search with category when provided", () => {
        handleDeepLink("https://kidmap.app/search?category=park");
        expect(router.push).toHaveBeenCalledWith({ pathname: "/search", params: { category: "park" } });
    });

    it("navigates to map for place links", () => {
        handleDeepLink("https://kidmap.app/place/xyz");
        expect(router.push).toHaveBeenCalledWith("/map");
    });

    it("defaults to home on unknown path", () => {
        handleDeepLink("https://kidmap.app/unknown");
        expect(router.push).toHaveBeenCalledWith("/");
    });

    it("handles malformed URLs gracefully", () => {
        handleDeepLink("not a url");
        expect(router.push).toHaveBeenCalledWith("/");
    });
});
