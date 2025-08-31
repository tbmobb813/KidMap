import {
  auditTouchTarget,
  MIN_TOUCH_TARGET,
} from "@/utils/accessibility/touchTargetAudit";

describe("touchTargetAudit", () => {
  const originalEnv = process.env.NODE_ENV;
  beforeAll(() => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "test",
      configurable: true,
    });
  });
  afterAll(() => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      configurable: true,
    });
  });

  it("passes components meeting minimum size", () => {
    const result = auditTouchTarget({
      name: "BigButton",
      width: MIN_TOUCH_TARGET,
      height: MIN_TOUCH_TARGET,
    });
    expect(result).toBe(true);
  });

  it("warns for undersized components", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const result = auditTouchTarget({
      name: "TinyButton",
      width: 30,
      height: 30,
    });
    expect(result).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("passes when hitSlop compensates for small visual size", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const result = auditTouchTarget({
      name: "SlopButton",
      width: 36,
      height: 36,
      hitSlop: 8,
    }); // 36 + (8*2)=52
    expect(result).toBe(true);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
