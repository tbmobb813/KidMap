import { Clock, X, MapPin } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

import { useTheme } from "@/constants/theme";

type SmartNotificationProps = {
  title: string;
  message: string;
  type: "reminder" | "weather" | "safety" | "achievement";
  onDismiss: () => void;
  actionText?: string;
  onAction?: () => void;
};

const SmartNotification: React.FC<SmartNotificationProps> = ({
  title,
  message,
  type,
  onDismiss,
  actionText,
  onAction
}) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const getIcon = () => {
    switch (type) {
      case "reminder": return <Clock size={20} color={theme.colors.primary} />;
      case "weather": return <MapPin size={20} color={theme.colors.warning} />;
      case "safety": return <MapPin size={20} color={theme.colors.error} />;
      case "achievement": return <MapPin size={20} color={theme.colors.secondary} />;
    }
  };

  const tint = (c: string) => `${c}22`;
  const getBackgroundColor = () => {
    switch (type) {
      case "reminder": return tint(theme.colors.primary);
      case "weather": return tint(theme.colors.warning);
      case "safety": return tint(theme.colors.error);
      case "achievement": return tint(theme.colors.secondary);
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "reminder": return theme.colors.primary;
      case "weather": return theme.colors.warning;
      case "safety": return theme.colors.error;
      case "achievement": return theme.colors.secondary;
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: getBackgroundColor(),
        borderLeftColor: getBorderColor()
      }
    ]}>
      <View style={styles.content}>
        <View style={styles.header}>
          {getIcon()}
          <Text style={styles.title}>{title}</Text>
          <Pressable style={styles.dismissButton} onPress={onDismiss}>
            <X size={16} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
        
        <Text style={styles.message}>{message}</Text>
        
        {actionText && onAction && (
          <Pressable style={styles.actionButton} onPress={onAction}>
            <Text style={styles.actionText}>{actionText}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};
const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  actionButton: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionText: {
    color: theme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: "600",
  },
  container: {
    borderLeftWidth: 4,
    borderRadius: 12,
    elevation: 3,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: { padding: 16 },
  dismissButton: { padding: 4 },
  header: { alignItems: "center", flexDirection: "row", marginBottom: 8 },
  message: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  title: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default SmartNotification;
