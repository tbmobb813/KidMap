import { CheckCircle, AlertCircle, Info, X } from "lucide-react-native";
import React, { useEffect, useRef, useCallback } from "react";
import { StyleSheet, Text, Animated, Platform, AccessibilityInfo, findNodeHandle } from "react-native";

import { useTheme } from "@/constants/theme";
import { announce } from "@/utils/accessibility";

type ToastType = "success" | "error" | "info" | "warning";

type ToastProps = {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
  disableAnimation?: boolean;
};

  const typeLabels: Record<ToastType, string> = {
    success: "Success",
    error: "Error",
    info: "Info",
    warning: "Warning"
  };

  const Toast: React.FC<ToastProps> = ({
    message,
    type,
    visible,
    onHide,
    duration = 3000,
    disableAnimation = false,
  }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const viewRef = useRef<any>(null);
    const announcedRef = useRef(false);
    const theme = useTheme();

    const hideToast = useCallback(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]).start(() => {
        onHide();
      });
    }, [fadeAnim, slideAnim, onHide]);

    useEffect(() => {
      if (visible) {
        if (disableAnimation) {
          if (!announcedRef.current) {
            announcedRef.current = true;
            const composed = `${typeLabels[type]}: ${message}`;
            announce(composed);
          }
        } else {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: Platform.OS !== "web",
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: Platform.OS !== "web",
            }),
          ]).start();

          if (!announcedRef.current) {
            announcedRef.current = true;
            const composed = `${typeLabels[type]}: ${message}`;
            announce(composed);
            setTimeout(() => {
              try {
                const handle = viewRef.current
                  ? findNodeHandle(viewRef.current)
                  : null;
                if (handle) {
                  (AccessibilityInfo as any)?.setAccessibilityFocus?.(handle);
                }
              } catch (_) {
                // ignored
              }
            }, 50);
          }

          const timer = setTimeout(() => {
            hideToast();
          }, duration);

          return () => clearTimeout(timer);
        }
      }
      announcedRef.current = false;
    }, [
      visible,
      fadeAnim,
      slideAnim,
      duration,
      type,
      message,
      disableAnimation,
      hideToast,
    ]);

    const getIcon = () => {
      switch (type) {
        case "success":
          return <CheckCircle size={20} color={theme.colors.success} />;
        case "error":
          return <X size={20} color={theme.colors.error} />;
        case "warning":
          return <AlertCircle size={20} color={theme.colors.warning} />;
        case "info":
          return <Info size={20} color={theme.colors.info} />;
        default:
          return null;
      }
    };

    const getBackgroundColor = () => {
      switch (type) {
        case "success":
        case "error":
        case "warning":
        case "info":
          return theme.colors.surfaceAlt;
        default:
          return theme.colors.surface;
      }
    };

    if (!visible) return null;

    return (
      <Animated.View
        ref={viewRef as any}
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: getBackgroundColor(),
          },
        ]}
        accessible
        accessibilityRole="alert"
        accessibilityLiveRegion={
          Platform.OS === "android" ? "assertive" : undefined
        }
        accessibilityLabel={`${typeLabels[type]}: ${message}`}
        testID="toast-alert"
      >
        {getIcon()}
        <Text style={[styles.message, { color: theme.colors.text }]}>
          {message}
        </Text>
      </Animated.View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      borderRadius: 12,
      elevation: 5,
      flexDirection: "row",
      gap: 12,
      left: 16,
      padding: 16,
      position: "absolute",
      right: 16,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      top: 60,
      zIndex: 1000
    },
    message: {
      flex: 1,
      fontSize: 14,
      fontWeight: "500"
    }
  });

export default Toast;
