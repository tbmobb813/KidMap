import { Lightbulb, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

import { useTheme } from '@/constants/theme';

type FunFactCardProps = {
  fact: string;
  location?: string;
  onDismiss?: () => void;
};

const FunFactCard: React.FC<FunFactCardProps> = ({ fact, location, onDismiss }) => {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderLeftColor: theme.colors.secondary, shadowColor: theme.colors.text }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Lightbulb size={20} color={theme.colors.secondary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {location ? `Fun Fact about ${location}` : "Did You Know?"}
        </Text>
        {onDismiss && (
          <Pressable style={styles.dismissButton} onPress={onDismiss}>
            <X size={16} color={theme.colors.textSecondary} />
          </Pressable>
        )}
      </View>
      <Text style={[styles.factText, { color: theme.colors.textSecondary }]}>{fact}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    borderRadius: 12,
    elevation: 2,
    margin: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dismissButton: {
    padding: 4,
  },
  factText: {
    fontSize: 14,
    lineHeight: 20,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FunFactCard;
