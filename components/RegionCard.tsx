import { Edit3, Trash2, Globe, MapPin } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

import Colors from "@/constants/colors";
import { RegionConfig } from "@/types/region";

type RegionCardProps = {
  region: RegionConfig;
  onEdit?: (region: RegionConfig) => void;
  onDelete?: (region: RegionConfig) => void;
  onUpdateTransit?: (region: RegionConfig) => void;
};

const RegionCard: React.FC<RegionCardProps> = ({ region, onEdit, onDelete, onUpdateTransit }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MapPin size={18} color={Colors.primary} />
        <Text style={styles.name}>{region.name}</Text>
        <Globe size={16} color={Colors.textSecondary} style={{ marginLeft: 8 }} />
        <Text style={styles.country}>{region.country}</Text>
      </View>
      <Text style={styles.transitCount}>
        {region.transitSystems?.length || 0} transit system{(region.transitSystems?.length || 0) !== 1 ? "s" : ""}
      </Text>
      <View style={styles.actions}>
        {onUpdateTransit && (
          <Pressable style={styles.actionButton} onPress={() => onUpdateTransit(region)}>
            <Text style={[styles.actionText, { color: Colors.primary }]}>Update Transit</Text>
          </Pressable>
        )}
        {onEdit && (
          <Pressable style={styles.actionButton} onPress={() => onEdit(region)}>
            <Edit3 size={16} color={Colors.primary} />
          </Pressable>
        )}
        {onDelete && (
          <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={() => onDelete(region)}>
            <Trash2 size={16} color="#FF4444" />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
    flex: 1,
  },
  country: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  transitCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 8,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#FFF0F0",
  },
});

export default RegionCard;
