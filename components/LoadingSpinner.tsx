import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Animated, Platform } from "react-native";

import { useTheme } from "@/constants/theme";

type LoadingSpinnerProps = {
  size?: "small" | "medium" | "large";
  color?: string;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  color,
}) => {
  const theme = useTheme();
  const resolvedColor = color || theme.colors.primary;
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: Platform.OS !== "web",
      }).start(() => spin());
    };
    spin();
  }, [spinValue]);

  // Some test mocks replace Animated.Value with objects that don't implement
  // interpolate. Be defensive: if interpolate isn't present, fall back to a
  // static rotation so tests won't throw.
  const spin = (spinValue && typeof (spinValue as any).interpolate === 'function')
    ? (spinValue as any).interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
      })
    : '0deg';

  const getSize = () => {
    switch (size) {
      case "small":
        return 20;
      case "medium":
        return 32;
      case "large":
        return 48;
    }
  };

  const dimensions = getSize();

  return (
    <View style={styles.container} testID="loading-spinner">
      <Animated.View
        testID="loading-spinner-animation"
        style={[
          styles.spinner,
          {
            width: dimensions,
            height: dimensions,
            borderColor: `${resolvedColor}20`,
            borderTopColor: resolvedColor,
            transform: [{ rotate: spin }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    borderRadius: 50,
    borderWidth: 3,
  },
});

export default LoadingSpinner;
