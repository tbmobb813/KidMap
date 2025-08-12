import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { theme } from "@/constants/theme";
import { getAccessibilityLabel, getAccessibilityHint } from "@/utils/accessibility";

type AccessibleButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  variant?: "primary" | "secondary" | "outline";
};

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  variant = "primary",
}) => {
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44, // Minimum touch target size
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  primaryText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  outlineText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  disabledText: {
    color: theme.colors.textLight,
  },
});

export default AccessibleButton;
