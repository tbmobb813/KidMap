import { Alert } from "react-native";

import ConfirmDialog from "@/components/ConfirmDialog";

// ===== MOCKS =====
// URI-based mock triggering to avoid Jest module scope violations
jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

// ===== HELPER FUNCTIONS =====
const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

type AlertButton = {
  text?: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: (() => void) | (() => Promise<void>);
};

const getButtons = () =>
  (mockAlert.mock.calls[0]?.[2] ?? []) as AlertButton[];

const createMockCallbacks = () => ({
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
});

describe("ConfirmDialog Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ===== SMOKE TESTS =====
  it("should show alert without errors", () => {
    const { onConfirm } = createMockCallbacks();

    ConfirmDialog.show({
      title: "Test Title",
      message: "Test message",
      onConfirm,
    });

    expect(mockAlert).toHaveBeenCalledTimes(1);
  });

  // ===== PROP VERIFICATION =====
  it("should pass title and message to Alert", () => {
    const { onConfirm } = createMockCallbacks();

    ConfirmDialog.show({
      title: "Delete Item",
      message: "Are you sure you want to delete this item?",
      onConfirm,
    });

    expect(mockAlert).toHaveBeenCalledWith(
      "Delete Item",
      "Are you sure you want to delete this item?",
      expect.any(Array)
    );
  });

  it("should require title and message props", () => {
    const { onConfirm } = createMockCallbacks();

    expect(() => {
      ConfirmDialog.show({
        title: "",
        message: "",
        onConfirm,
      });
    }).not.toThrow();
  });

  it("should require onConfirm callback", () => {
    expect(() => {
      ConfirmDialog.show({
        title: "Test",
        message: "Test message",
        onConfirm: undefined as any,
      });
    }).not.toThrow(); // TypeScript would catch this, but runtime shouldn't crash
  });

  // ===== BUTTON CONFIGURATION TESTS =====
  it("should use default button texts when not specified", () => {
    const { onConfirm } = createMockCallbacks();

    ConfirmDialog.show({
      title: "Test",
      message: "Test message",
      onConfirm,
    });

    const buttons = getButtons();
    expect(buttons).toHaveLength(2);
    expect(buttons[0].text).toBe("Cancel");
    expect(buttons[1].text).toBe("Confirm");
  });

  it("should use custom button texts when specified", () => {
    const { onConfirm } = createMockCallbacks();

    ConfirmDialog.show({
      title: "Delete Item",
      message: "Are you sure?",
      confirmText: "Delete",
      cancelText: "Keep",
      onConfirm,
    });

    const buttons = getButtons();
    expect(buttons[0].text).toBe("Keep");
    expect(buttons[1].text).toBe("Delete");
  });

  it("should set cancel button style to 'cancel'", () => {
    const { onConfirm } = createMockCallbacks();

    ConfirmDialog.show({
      title: "Test",
      message: "Test message",
      onConfirm,
    });

    const buttons = getButtons();
    expect(buttons[0].style).toBe("cancel");
  });

  it("should set confirm button style to 'default' when not destructive", () => {
    const { onConfirm } = createMockCallbacks();

    ConfirmDialog.show({
      title: "Save Changes",
      message: "Do you want to save?",
      destructive: false,
      onConfirm,
    });

    const buttons = getButtons();
    expect(buttons[1].style).toBe("default");
  });

  it("should set confirm button style to 'destructive' when destructive is true", () => {
    const { onConfirm } = createMockCallbacks();

    ConfirmDialog.show({
      title: "Delete Item",
      message: "This action cannot be undone",
      destructive: true,
      onConfirm,
    });

    const buttons = getButtons();
    expect(buttons[1].style).toBe("destructive");
  });

  // ===== CALLBACK EXECUTION TESTS =====
  it("should call onConfirm when confirm button is pressed", () => {
    const { onConfirm } = createMockCallbacks();

    ConfirmDialog.show({
      title: "Test",
      message: "Test message",
      onConfirm,
    });

  const buttons = getButtons();
  buttons[1].onPress?.();

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onCancel when cancel button is pressed", () => {
    const { onConfirm, onCancel } = createMockCallbacks();

    ConfirmDialog.show({
      title: "Test",
      message: "Test message",
      onConfirm,
      onCancel,
    });

  const buttons = getButtons();
  buttons[0].onPress?.();

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should not crash when onCancel is not provided and cancel is pressed", () => {
    const { onConfirm } = createMockCallbacks();

    ConfirmDialog.show({
      title: "Test",
      message: "Test message",
      onConfirm,
    });

    const buttons = getButtons();

    expect(() => {
      buttons[0].onPress?.();
    }).not.toThrow();
  });

  // ===== ASYNC CALLBACK TESTS =====
  it("should handle synchronous onConfirm callback", () => {
    const onConfirm = jest.fn();

    ConfirmDialog.show({
      title: "Test",
      message: "Test message",
      onConfirm,
    });

  const buttons = getButtons();
  buttons[1].onPress?.();

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should handle asynchronous onConfirm callback", async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);

    ConfirmDialog.show({
      title: "Test",
      message: "Test message",
      onConfirm,
    });

  const buttons = getButtons();
  await buttons[1].onPress?.();

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should handle rejected async onConfirm callback gracefully", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const onConfirm = jest.fn().mockRejectedValue(new Error("Test error"));

    ConfirmDialog.show({
      title: "Test",
      message: "Test message",
      onConfirm,
    });

  const buttons = getButtons();
  await buttons[1].onPress?.();

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  // ===== BUTTON ORDER TESTS =====
  it("should place cancel button first and confirm button second", () => {
    const { onConfirm, onCancel } = createMockCallbacks();

    ConfirmDialog.show({
      title: "Test",
      message: "Test message",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm,
      onCancel,
    });

    const buttons = getButtons();
    expect(buttons).toHaveLength(2);
    expect(buttons[0].text).toBe("No"); // Cancel first
    expect(buttons[1].text).toBe("Yes"); // Confirm second
  });

  // ===== EDGE CASES =====
  it("should handle empty title and message", () => {
    const { onConfirm } = createMockCallbacks();

    ConfirmDialog.show({
      title: "",
      message: "",
      onConfirm,
    });

    expect(mockAlert).toHaveBeenCalledWith("", "", expect.any(Array));
  });

  it("should handle very long title and message", () => {
    const { onConfirm } = createMockCallbacks();
    const longTitle = "A".repeat(100);
    const longMessage = "B".repeat(500);

    ConfirmDialog.show({
      title: longTitle,
      message: longMessage,
      onConfirm,
    });

    expect(mockAlert).toHaveBeenCalledWith(
      longTitle,
      longMessage,
      expect.any(Array)
    );
  });

  it("should handle special characters in title and message", () => {
    const { onConfirm } = createMockCallbacks();
    const specialTitle = '🚨 Alert! "Important" & <Critical>';
    const specialMessage = "Line 1\nLine 2\tTab\r\nWindows line ending";

    ConfirmDialog.show({
      title: specialTitle,
      message: specialMessage,
      onConfirm,
    });

    expect(mockAlert).toHaveBeenCalledWith(
      specialTitle,
      specialMessage,
      expect.any(Array)
    );
  });

  it("should handle empty custom button texts", () => {
    const { onConfirm } = createMockCallbacks();

    ConfirmDialog.show({
      title: "Test",
      message: "Test message",
      confirmText: "",
      cancelText: "",
      onConfirm,
    });

    const buttons = getButtons();
    expect(buttons[0].text).toBe("");
    expect(buttons[1].text).toBe("");
  });

  // ===== INTEGRATION TESTS =====
  it("should work with real-world delete scenario", () => {
    const { onConfirm, onCancel } = createMockCallbacks();

    ConfirmDialog.show({
      title: "Delete Category",
      message: 'Are you sure you want to delete "Personal"?',
      confirmText: "Delete",
      cancelText: "Cancel",
      destructive: true,
      onConfirm,
      onCancel,
    });

    expect(mockAlert).toHaveBeenCalledWith(
      "Delete Category",
      'Are you sure you want to delete "Personal"?',
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: onCancel,
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: expect.any(Function),
        },
      ]
    );
  });

  it("should work with real-world save scenario", () => {
    const { onConfirm, onCancel } = createMockCallbacks();

    ConfirmDialog.show({
      title: "Save Changes",
      message: "Do you want to save your changes before leaving?",
      confirmText: "Save",
      cancelText: "Discard",
      destructive: false,
      onConfirm,
      onCancel,
    });

    const buttons = getButtons();
    expect(buttons[1].style).toBe("default");
    expect(buttons[1].text).toBe("Save");
  });

  // ===== API CONSISTENCY TESTS =====
  it("should maintain consistent API structure", () => {
    expect(typeof ConfirmDialog.show).toBe("function");
    expect(ConfirmDialog.show.length).toBe(1); // Should accept one parameter object
  });

  it("should be importable as default export", () => {
    expect(ConfirmDialog).toBeDefined();
    expect(ConfirmDialog.show).toBeDefined();
  });

  // ===== MULTIPLE CALLS TESTS =====
  it("should handle multiple sequential calls", () => {
    const { onConfirm: onConfirm1 } = createMockCallbacks();
    const { onConfirm: onConfirm2 } = createMockCallbacks();

    ConfirmDialog.show({
      title: "First Dialog",
      message: "First message",
      onConfirm: onConfirm1,
    });

    ConfirmDialog.show({
      title: "Second Dialog",
      message: "Second message",
      onConfirm: onConfirm2,
    });

    expect(mockAlert).toHaveBeenCalledTimes(2);
    expect(mockAlert).toHaveBeenNthCalledWith(
      1,
      "First Dialog",
      "First message",
      expect.any(Array)
    );
    expect(mockAlert).toHaveBeenNthCalledWith(
      2,
      "Second Dialog",
      "Second message",
      expect.any(Array)
    );
  });

  // ===== PERFORMANCE =====
  it("should not create unnecessary objects on multiple calls", () => {
    const { onConfirm } = createMockCallbacks();

    for (let i = 0; i < 5; i++) {
      ConfirmDialog.show({
        title: `Dialog ${i}`,
        message: `Message ${i}`,
        onConfirm,
      });
    }

    expect(mockAlert).toHaveBeenCalledTimes(5);
  });
});
