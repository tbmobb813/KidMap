import { LucideIcon } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

import { useTheme } from '@/constants/theme';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }] }>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }] }>
        <Icon size={48} color={theme.colors.textSecondary} />
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{description}</Text>
      {actionText && onAction && (
        <Pressable style={[styles.actionButton, { backgroundColor: theme.colors.primary }]} onPress={onAction}>
          <Text style={[styles.actionText, { color: theme.colors.primaryForeground }]}>{actionText}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 32,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    marginBottom: 24,
    width: 96,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default EmptyState;
