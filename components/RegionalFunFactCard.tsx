import { Lightbulb, X } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/constants/theme";
import { useRegionalData } from "@/hooks/useRegionalData";
import { tint } from "@/utils/color/color";

type RegionalFunFactCardProps = {
  onDismiss?: () => void;
};

const RegionalFunFactCard: React.FC<RegionalFunFactCardProps> = ({ onDismiss }) => {
  const { regionalContent, currentRegion } = useRegionalData();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  
  // Get a random fun fact from the current region
  const randomFact = regionalContent.funFacts[
    Math.floor(Math.random() * regionalContent.funFacts.length)
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Lightbulb size={20} color={theme.colors.secondary} />
        </View>
        <Text style={styles.title}>
          Fun Fact about {currentRegion.name}
        </Text>
        {onDismiss && (
          <Pressable style={styles.dismissButton} onPress={onDismiss}>
            <X size={16} color={theme.colors.textSecondary} />
          </Pressable>
        )}
      </View>
      
      <Text style={styles.factText}>{randomFact}</Text>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    backgroundColor: tint(theme.colors.secondary),
    borderLeftColor: theme.colors.secondary,
    borderLeftWidth: 4,
    borderRadius: 12,
    elevation: 2,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dismissButton: {
    padding: 4,
  },
  factText: {
    color: theme.colors.text,
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
    color: theme.colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default RegionalFunFactCard;
