import { Train, Bus, Navigation, Ship } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";


import { useTheme } from "@/constants/theme";
import { useRegionStore } from "@/stores/regionStore";

const RegionalTransitCard: React.FC = () => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { currentRegion, getCurrentTransitSystems } = useRegionStore();
  const transitSystems = getCurrentTransitSystems();

  const getTransitIcon = (type: string) => {
    switch (type) {
      case "subway":
      case "train":
  return <Train size={20} color={theme.colors.primaryForeground} />;
      case "bus":
  return <Bus size={20} color={theme.colors.primaryForeground} />;
      case "tram":
  return <Navigation size={20} color={theme.colors.primaryForeground} />;
      case "ferry":
  return <Ship size={20} color={theme.colors.primaryForeground} />;
      default:
  return <Train size={20} color={theme.colors.primaryForeground} />;
    }
  };

  const renderTransitSystem = ({ item }: { item: typeof transitSystems[0] }) => (
    <View style={styles.transitItem}>
      <View style={[styles.transitIcon, { backgroundColor: item.color }]}>
        {getTransitIcon(item.type)}
      </View>
      <View style={styles.transitInfo}>
        <Text style={styles.transitName}>{item.name}</Text>
        <Text style={styles.transitType}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          {item.routes && ` • ${item.routes.length} lines`}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transit Systems in {currentRegion.name}</Text>
        <Text style={styles.subtitle}>{currentRegion.country}</Text>
      </View>

      <FlatList
        data={transitSystems}
        renderItem={renderTransitSystem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.transitList}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Emergency: {currentRegion.emergencyNumber}
        </Text>
      </View>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  footer: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 12,
  },
  footerText: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  header: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    marginBottom: 16,
    paddingBottom: 12,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  transitIcon: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    marginRight: 12,
    width: 40,
  },
  transitInfo: { flex: 1 },
  transitItem: { alignItems: "center", flexDirection: "row" },
  transitList: { gap: 12 },
  transitName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  transitType: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});

export default RegionalTransitCard;
