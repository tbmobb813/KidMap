import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { Clock, X, MapPin } from "@expo/vector-icons";

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
  const getIcon = () => {
    switch (type) {
      case "reminder": return <Clock size={20} color={Colors.primary} />;
      case "weather": return <MapPin size={20} color={Colors.warning} />;
      case "safety": return <MapPin size={20} color={Colors.error} />;
      case "achievement": return <MapPin size={20} color={Colors.secondary} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "reminder": return "#F0F4FF";
      case "weather": return "#FFF9E6";
      case "safety": return "#FFE6E6";
      case "achievement": return "#F0FFF4";
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "reminder": return Colors.primary;
      case "weather": return Colors.warning;
      case "safety": return Colors.error;
      case "achievement": return Colors.secondary;
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
            <X size={16} color={Colors.textLight} />
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 8,
  },
  dismissButton: {
    padding: 4,
  },
  message: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default SmartNotification;