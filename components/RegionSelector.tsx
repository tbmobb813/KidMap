import { Check, MapPin } from "lucide-react-native";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/constants/theme";
import { RegionConfig } from "@/types/region";
import { tint } from "@/utils/color/color";

type RegionSelectorProps = {
  regions: RegionConfig[];
  selectedRegion: string;
  onSelectRegion: (regionId: string) => void;
};

const RegionSelector: React.FC<RegionSelectorProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
}) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const renderRegion = ({ item }: { item: RegionConfig }) => (
    <Pressable
      style={[
        styles.regionItem,
        selectedRegion === item.id && styles.selectedRegion
      ]}
      onPress={() => onSelectRegion(item.id)}
    >
      <View style={styles.regionInfo}>
        <MapPin size={24} color={theme.colors.primary} />
        <View style={styles.regionText}>
          <Text style={styles.regionName}>{item.name}</Text>
          <Text style={styles.regionCountry}>{item.country}</Text>
          <Text style={styles.regionDetails}>
            {item.transitSystems.length} transit systems • {item.currency}
          </Text>
        </View>
      </View>
      {selectedRegion === item.id && (
        <Check size={24} color={theme.colors.success} />
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Region</Text>
      <Text style={styles.subtitle}>
        Select your city to get accurate transit information and local content.
      </Text>
      
      <FlatList
        data={regions}
        renderItem={renderRegion}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.regionsList}
      />
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  regionCountry: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 2,
  },
  regionDetails: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  regionInfo: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },
  regionItem: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: "transparent",
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    padding: 16,
  },
  regionName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  regionText: {
    flex: 1,
    marginLeft: 16,
  },
  regionsList: {
    paddingBottom: 16,
  },
  selectedRegion: {
    backgroundColor: tint(theme.colors.primary),
    borderColor: theme.colors.primary,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
});

export default RegionSelector;
