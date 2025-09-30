import { Alert, AlertButton } from "react-native";

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

/**
 * Standardized confirmation dialog component to replace ad-hoc Alert.confirm patterns.
 * Wraps React Native Alert with consistent styling and behavior.
 */
export const ConfirmDialog = {
  show: ({
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    destructive = false,
    onConfirm,
    onCancel,
  }: ConfirmDialogOptions) => {
    const buttons: AlertButton[] = [
      {
        text: cancelText,
        style: "cancel",
        onPress: onCancel,
      },
      {
        text: confirmText,
        style: destructive ? "destructive" : "default",
        onPress: () => {
          Promise.resolve(onConfirm()).catch(console.error);
        },
      },
    ];

    Alert.alert(title, message, buttons);
  },
};

export default ConfirmDialog;
