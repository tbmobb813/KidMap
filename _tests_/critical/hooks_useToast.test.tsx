/**
 * HOOK TEST: useToast - Toast Notification Management Tests
 * 
 * Testing the useToast hook following HookTestTemplate pattern.
 * This hook is critical for user feedback - manages toast state and actions.
 * 
 * Key test areas:
 * - Toast state management (visibility, message, type)
 * - Show toast functionality with different types
 * - Hide toast functionality  
 * - State persistence and updates
 * - Hook return value structure
 */

import { jest } from '@jest/globals';
import { act, renderHook } from "@testing-library/react-native";

import { useToast } from "@/hooks/useToast";

// ===== MOCK SECTION =====
// Note: useToast is a pure React hook with no external dependencies,
// so no mocking is required for this test suite.

// ===== TEST UTILITIES =====
/**
 * Renders the useToast hook and returns the result
 */
const renderToastHook = () => {
  return renderHook(() => useToast());
};

// ===== TEST SETUP =====
describe('useToast Hook - Toast Notification Management Tests', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  // ===== CORE FUNCTIONALITY TESTS =====

  it('should return initial toast state', () => {
    const { result } = renderToastHook();

    // Verify initial state
    expect(result.current.toast).toEqual({
      message: "",
      type: "info",
      visible: false,
    });

    // Verify function availability
    expect(typeof result.current.showToast).toBe('function');
    expect(typeof result.current.hideToast).toBe('function');
  });

  it('should show toast with default info type', () => {
    const { result } = renderToastHook();
    const testMessage = "Test notification message";

    act(() => {
      result.current.showToast(testMessage);
    });

    // Verify toast state after showing
    expect(result.current.toast).toEqual({
      message: testMessage,
      type: "info",
      visible: true,
    });
  });

  it('should show toast with specified type', () => {
    const { result } = renderToastHook();
    const testMessage = "Success message";

    act(() => {
      result.current.showToast(testMessage, "success");
    });

    // Verify toast state with custom type
    expect(result.current.toast).toEqual({
      message: testMessage,
      type: "success",
      visible: true,
    });
  });

  it('should handle all toast types correctly', () => {
    const { result } = renderToastHook();
    const toastTypes = ["success", "error", "info", "warning"] as const;

    toastTypes.forEach((type) => {
      const message = `${type} message`;
      
      act(() => {
        result.current.showToast(message, type);
      });

      expect(result.current.toast).toEqual({
        message,
        type,
        visible: true,
      });
    });
  });

  it('should hide toast while preserving message and type', () => {
    const { result } = renderToastHook();
    const testMessage = "Test message";
    const testType = "error";

    // First show a toast
    act(() => {
      result.current.showToast(testMessage, testType);
    });

    // Verify it's visible
    expect(result.current.toast.visible).toBe(true);

    // Hide the toast
    act(() => {
      result.current.hideToast();
    });

    // Verify toast is hidden but message and type are preserved
    expect(result.current.toast).toEqual({
      message: testMessage,
      type: testType,
      visible: false,
    });
  });

  it('should update toast when showToast is called multiple times', () => {
    const { result } = renderToastHook();

    // Show first toast
    act(() => {
      result.current.showToast("First message", "info");
    });

    expect(result.current.toast.message).toBe("First message");
    expect(result.current.toast.type).toBe("info");

    // Show second toast (should replace first)
    act(() => {
      result.current.showToast("Second message", "error");
    });

    expect(result.current.toast).toEqual({
      message: "Second message",
      type: "error",
      visible: true,
    });
  });

  // ===== EDGE CASES =====

  it('should handle empty message', () => {
    const { result } = renderToastHook();

    act(() => {
      result.current.showToast("");
    });

    expect(result.current.toast).toEqual({
      message: "",
      type: "info",
      visible: true,
    });
  });

  it('should handle very long messages', () => {
    const { result } = renderToastHook();
    const longMessage = "A".repeat(1000);

    act(() => {
      result.current.showToast(longMessage, "warning");
    });

    expect(result.current.toast).toEqual({
      message: longMessage,
      type: "warning",
      visible: true,
    });
  });

  it('should handle rapid show/hide operations', () => {
    const { result } = renderToastHook();

    // Rapid sequence of operations
    act(() => {
      result.current.showToast("Message 1", "info");
      result.current.hideToast();
      result.current.showToast("Message 2", "success");
      result.current.hideToast();
      result.current.showToast("Final message", "error");
    });

    // Should end with the final state
    expect(result.current.toast).toEqual({
      message: "Final message",
      type: "error",
      visible: true,
    });
  });

  // ===== FUNCTION REFERENCE STABILITY =====

  it('should maintain stable function references', () => {
  const { result, rerender } = renderToastHook();
    
    const initialShowToast = result.current.showToast;
    const initialHideToast = result.current.hideToast;

  // Trigger re-render (no props to pass, provide a noop object to satisfy types)
  rerender({});

    // Function references should be stable
    expect(result.current.showToast).toBe(initialShowToast);
    expect(result.current.hideToast).toBe(initialHideToast);
  });
});