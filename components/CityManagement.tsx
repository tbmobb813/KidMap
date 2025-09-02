import { Search, Plus, MapPin, Trash2, Edit3, Globe, Clock, Phone } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Alert } from "react-native";

import Toast from "./Toast";

import Colors from "@/constants/colors"; // TODO: phase out direct Colors references
import { useTheme } from "@/constants/theme";
import { useToast } from "@/hooks/useToast";
import { useRegionStore } from "@/stores/regionStore";
import { RegionConfig } from "@/types/region";

type CityManagementProps = {
  onBack: () => void;
};

export default function CityManagement({ onBack }: CityManagementProps) {
  const themeCtx = useTheme();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingRegion, setEditingRegion] = useState<RegionConfig | null>(null);

  const {
    availableRegions,
    currentRegion,
    setRegion,
    addCustomRegion,
    removeRegion,
    updateRegionTransitData,
    searchRegions,
    getRegionsByCountry,
  } = useRegionStore();

  const { toast, showToast, hideToast } = useToast();

  // --- Helpers / derived data
  const filteredRegions = searchQuery ? searchRegions(searchQuery) : availableRegions;
  const usRegions = getRegionsByCountry("United States");
  const internationalRegions = availableRegions.filter((r) => r.country !== "United States");

  // Place handleUpdateTransitData after useToast and showToast definition
  const handleUpdateTransitData = (_regionId: string) => {
    // In a real app, this would make API calls to update transit data
    showToast("Transit data updated", "success");
    // Optionally:
    // updateRegionTransitData(regionId, ...payload)
  };

  const handleDeleteRegion = (regionId: string) => {
    if (regionId === currentRegion.id) {
      showToast("Cannot delete current region", "error");
      return;
    }
    Alert.alert("Delete Region", "Are you sure you want to delete this region?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => removeRegion(regionId) },
    ]);
  };

  const RegionCard = ({ region }: { region: RegionConfig }) => (
    <View
      style={[
        styles.regionCard,
        region.id === currentRegion.id && styles.currentRegionCard,
        { backgroundColor: themeCtx.colors.surface },
      ]}
    >
      <Pressable style={styles.regionHeader} onPress={() => setRegion(region.id)}>
        <View style={styles.regionTitleRow}>
          <MapPin size={20} color={themeCtx.colors.primary} />
          <Text style={styles.regionName}>{region.name}</Text>
          {region.id === currentRegion.id && (
            <View style={[styles.currentBadge, { backgroundColor: themeCtx.colors.primary }]}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
        </View>

        <View style={styles.regionDetails}>
          <View style={styles.detailItem}>
            <Globe size={14} color={themeCtx.colors.textSecondary} />
            <Text style={[styles.detailText, { color: themeCtx.colors.textSecondary }]}>
              {region.country}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={14} color={themeCtx.colors.textSecondary} />
            <Text style={[styles.detailText, { color: themeCtx.colors.textSecondary }]}>
              {region.timezone}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Phone size={14} color={themeCtx.colors.textSecondary} />
            <Text style={[styles.detailText, { color: themeCtx.colors.textSecondary }]}>
              {region.emergencyNumber}
            </Text>
          </View>
        </View>

        <Text style={[styles.transitCount, { color: themeCtx.colors.textSecondary }]}>
          {region.transitSystems.length} transit system
          {region.transitSystems.length !== 1 ? "s" : ""}
        </Text>

        <View style={styles.regionActions}>
          <Pressable style={styles.actionButton} onPress={() => handleUpdateTransitData(region.id)}>
            <Text style={[styles.actionButtonText, { color: themeCtx.colors.primary }]}>
              Update Transit
            </Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={() => setEditingRegion(region)}>
            <Edit3 size={16} color={themeCtx.colors.primary} />
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteRegion(region.id)}
          >
            <Trash2 size={16} color="#FF4444" />
          </Pressable>
        </View>
      </Pressable>
    </View>
  );

  if (showAddForm || editingRegion) {
    return (
      <AddEditRegionForm
        region={editingRegion}
        onSave={(region) => {
          if (editingRegion) {
            updateRegionTransitData(region.id, region);
          } else {
            addCustomRegion(region);
          }
          setShowAddForm(false);
          setEditingRegion(null);
        }}
        onCancel={() => {
          setShowAddForm(false);
          setEditingRegion(null);
        }}
      />
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeCtx.colors.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>City Management</Text>

        <Pressable
          style={[styles.addButton, { backgroundColor: themeCtx.colors.primary }]}
          onPress={() => setShowAddForm(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add City</Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: themeCtx.colors.surface, borderColor: Colors.border, borderWidth: 1 },
        ]}
      >
        <Search size={20} color={themeCtx.colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cities..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={themeCtx.colors.textSecondary}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeCtx.colors.text }]}>
          United States ({usRegions.length})
        </Text>
        {(searchQuery ? filteredRegions.filter((r) => r.country === "United States") : usRegions).map(
          (region) => (
            <RegionCard key={region.id} region={region} />
          )
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeCtx.colors.text }]}>
          International ({internationalRegions.length})
        </Text>
        {(searchQuery
          ? filteredRegions.filter((r) => r.country !== "United States")
          : internationalRegions
        ).map((region) => (
          <RegionCard key={region.id} region={region} />
        ))}
      </View>

      <View style={[styles.infoSection, { backgroundColor: themeCtx.colors.surface }]}>
        <Text style={[styles.infoTitle, { color: themeCtx.colors.text }]}>Transit Data Updates</Text>
        <Text style={[styles.infoText, { color: themeCtx.colors.textSecondary }]}>
          Transit schedules and route information are automatically updated when available. You can
          manually refresh data for any city by tapping &quot;Update Transit&quot;.
        </Text>
        <Text style={[styles.infoText, { color: themeCtx.colors.textSecondary }]}>
          Custom cities can be added with their own transit API endpoints for real-time data integration.
          You can import a configuration file with advanced options (e.g., &quot;nyc.json&quot;, &quot;sf.json&quot;).
        </Text>
      </View>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </ScrollView>
  );
}

type AddEditRegionFormProps = {
  region?: RegionConfig | null;
  onSave: (region: RegionConfig) => void;
  onCancel: () => void;
};

function AddEditRegionForm({ region, onSave, onCancel }: AddEditRegionFormProps) {
  const [formData, setFormData] = useState<Partial<RegionConfig>>({
    id: region?.id || "",
    name: region?.name || "",
    country: region?.country || "United States",
    timezone: region?.timezone || "America/New_York",
    currency: region?.currency || "USD",
    language: region?.language || "en",
    coordinates: region?.coordinates || { latitude: 0, longitude: 0 },
    emergencyNumber: region?.emergencyNumber || "911",
    transitApiEndpoint: region?.transitApiEndpoint || "",
    mapStyle: region?.mapStyle || "light",
    transitSystems: region?.transitSystems || [],
    safetyTips: region?.safetyTips || [],
    funFacts: region?.funFacts || [],
    popularPlaces: region?.popularPlaces || [],
  });

  const handleSave = () => {
    if (!formData.id || !formData.name || !formData.country) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    onSave(formData as RegionConfig);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onCancel}>
          <Text style={styles.backButtonText}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>{region ? "Edit" : "Add"} City</Text>
        <Pressable style={[styles.saveButton, { backgroundColor: Colors.primary }]} onPress={handleSave}>
          <Text style={[styles.saveButtonText, { color: "#FFFFFF" }]}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>City ID *</Text>
        <TextInput
          style={[styles.formInput, { borderColor: Colors.border }]}
          value={formData.id}
          onChangeText={(text) => setFormData({ ...formData, id: text })}
          placeholder="e.g., nyc, chicago"
          editable={!region}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>City Name *</Text>
        <TextInput
          style={[styles.formInput, { borderColor: Colors.border }]}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="e.g., New York City"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Country *</Text>
        <TextInput
          style={[styles.formInput, { borderColor: Colors.border }]}
          value={formData.country}
          onChangeText={(text) => setFormData({ ...formData, country: text })}
          placeholder="e.g., United States"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Transit API Endpoint</Text>
        <TextInput
          style={[styles.formInput, { borderColor: Colors.border }]}
          value={formData.transitApiEndpoint}
          onChangeText={(text) => setFormData({ ...formData, transitApiEndpoint: text })}
          placeholder="https://api.example.com/"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Emergency Number</Text>
        <TextInput
          style={[styles.formInput, { borderColor: Colors.border }]}
          value={formData.emergencyNumber}
          onChangeText={(text) => setFormData({ ...formData, emergencyNumber: text })}
          placeholder="911"
        />
      </View>

      <Text style={styles.infoText}>
        Additional configuration options like transit systems, coordinates, and local information can be
        added through the advanced settings or by importing from a configuration file.
      </Text>
    </ScrollView>
  );
}

// NOTE: Styles below still reference legacy Colors for some non-restricted tokens. Restricted ones replaced at usage.
const styles = StyleSheet.create({
  formSection: {
    padding: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  formInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  addButton: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 12,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  infoSection: {
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  saveButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontWeight: "600",
  },
  regionCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  currentRegionCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  regionHeader: {
    padding: 16,
  },
  regionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  regionName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  currentBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  currentBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  regionDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  detailItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  detailText: {
    fontSize: 14,
  },
  transitCount: {
    fontSize: 14,
    fontStyle: "italic",
  },
  regionActions: {
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    borderRadius: 8,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#FFF0F0",
  },
  container: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: "center",
    // ⬇️ removed Colors.textLight (you override with theme.colors.textSecondary at usage)
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 12,
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: Colors.primary, // overridden with theme.colors.primary
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  preferenceSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 8,
    borderWidth: 2,
    flex: 1,
    padding: 16,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedOption: {
    backgroundColor: "#F0F4FF",
    borderColor: Colors.primary,
  },
  safetyFeatures: {
    marginBottom: 24,
  },
  featureItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    fontWeight: "500",
  },
  toggleOption: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectedToggle: {
    backgroundColor: "#F0FFF4",
    borderColor: Colors.success,
  },
});
