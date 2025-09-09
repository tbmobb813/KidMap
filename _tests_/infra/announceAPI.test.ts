/**
 * Tests for unified announce API (S3-4).
 */
import {
  announce,
  cancelAllAnnouncements,
} from "../../utils/accessibility/accessibility";

// Mock react-native minimally to force Platform.OS = 'web' so live region path executes.
jest.mock("react-native", () => ({
  Platform: { OS: "web", select: (sel: any) => sel.web },
  AccessibilityInfo: { announceForAccessibility: jest.fn() },
}));

describe("announce API (web live regions)", () => {
  beforeEach(() => {
    // Clear any prior regions
    document.getElementById("__a11y_live_polite")?.remove();
    document.getElementById("__a11y_live_assertive")?.remove();
    jest.useFakeTimers();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    cancelAllAnnouncements(); // Clear queue
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    (console.warn as jest.Mock).mockRestore?.();
  });

  it("creates polite live region and injects message", () => {
    announce("Hello world");
    const region = document.getElementById("__a11y_live_polite");
    expect(region).toBeTruthy();
    expect(region!.textContent).toBe("");
    jest.advanceTimersByTime(15);
    expect(region!.textContent).toBe("Hello world");
  });

  it("dedupes rapid identical messages within window", () => {
    announce("Repeat");
    jest.advanceTimersByTime(15);
    const region = document.getElementById("__a11y_live_polite")!;
    expect(region.textContent).toBe("Repeat");
    announce("Repeat");
    jest.advanceTimersByTime(30);
    expect(region.textContent).toBe("Repeat");
  });

  it("creates assertive region when politeness=assertive", () => {
    announce("Important", { politeness: "assertive" });
    const region = document.getElementById("__a11y_live_assertive");
    expect(region).toBeTruthy();
    jest.advanceTimersByTime(15);
    expect(region!.textContent).toBe("Important");
  });

  it("supports queueable announcements with cancellation", async () => {
    const handle = await announce("First queued message", { queueable: true });
    expect(handle).toBeDefined();
    expect(typeof handle?.cancel).toBe("function");

    // Cancel immediately
    handle?.cancel();

    // Advance time to allow queue processing
    jest.advanceTimersByTime(100);

    // Should not appear in any region since cancelled
    const polite = document.getElementById("__a11y_live_polite");
    const assertive = document.getElementById("__a11y_live_assertive");
    expect(polite?.textContent || "").toBe("");
    expect(assertive?.textContent || "").toBe("");
  });

  it("cancels all announcements in queue", async () => {
    await announce("First", { queueable: true });
    await announce("Second", { queueable: true });

    // Cancel immediately before any processing
    cancelAllAnnouncements();

    // Advance time to ensure any pending processing completes
    jest.advanceTimersByTime(2500);

    const polite = document.getElementById("__a11y_live_polite");
    const assertive = document.getElementById("__a11y_live_assertive");
    expect(polite?.textContent || "").toBe("");
    expect(assertive?.textContent || "").toBe("");
  });
});
