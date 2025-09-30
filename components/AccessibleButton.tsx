import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, TextStyle, ViewStyle, PressableProps } from "react-native";

import { theme } from "@/constants/theme";
import { getAccessibilityHint, getAccessibilityLabel } from "@/utils/accessibility/accessibility";
import { auditTouchTarget } from "@/utils/accessibility/touchTargetAudit";

type AccessibleButtonProps = PressableProps & {
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  variant?: "primary" | "secondary" | "outline";
};

const AccessibleButton = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  variant = "primary",
  hitSlop,
  ...rest
}: AccessibleButtonProps) => {
  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primaryButton;
      case "secondary":
        return styles.secondaryButton;
      case "outline":
        return styles.outlineButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primaryText;
      case "secondary":
        return styles.secondaryText;
      case "outline":
        return styles.outlineText;
    }
  };

  useEffect(() => {
    // Pass a sensible minimum width as well as height to ensure audit
    // reflects a typical tappable target. If callers provide a hitSlop
    // we pass it through so the audit accounts for it.
    auditTouchTarget({ name: 'AccessibleButton', minHeight: 48, minWidth: 48, hitSlop: hitSlop ?? 8 });
  }, [hitSlop]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        getButtonStyle(),
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop ?? 8}
      {...rest}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || getAccessibilityLabel(title)}
      accessibilityHint={accessibilityHint || getAccessibilityHint("activate")}
      accessibilityState={{ disabled }}
    >
      <Text style={[getTextStyle(), disabled && styles.disabledText, textStyle]}>
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 24,
  paddingVertical: 12, // Updated to meet recommended 48x48 minimum
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: theme.colors.textSecondary || '/*TODO theme*/ theme.colors.placeholder /*#888888*/',
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  outlineText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  primaryText: {
  color: '#FFFFFF',
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  secondaryText: {
  color: '#FFFFFF',
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AccessibleButton;
