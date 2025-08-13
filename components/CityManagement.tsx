import { Search, Plus, MapPin, Trash2, Edit3, Globe, Clock, Phone } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Alert } from "react-native";

import Toast from './Toast';

import Colors from "@/constants/colors"; // TODO: phase out direct Colors references
import { useTheme } from '@/constants/theme';
import { useToast } from '@/hooks/useToast';
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
    getRegionsByCountry 
  } = useRegionStore();

  const filteredRegions = searchQuery 
    ? searchRegions(searchQuery)
    : availableRegions;

  const usRegions = getRegionsByCountry("United States");
  const internationalRegions = availableRegions.filter(r => r.country !== "United States");

  const { toast, showToast, hideToast } = useToast();

  const handleDeleteRegion = (regionId: string) => {
    if (regionId === currentRegion.id) {
      showToast('Cannot delete the currently selected region', 'error');
      return;
    }
    
    Alert.alert(
      "Delete Region",
      "Are you sure you want to delete this region? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => removeRegion(regionId)
        }
      ]
    );
  };

  const handleUpdateTransitData = (_regionId: string) => {
    Alert.alert(
      "Update Transit Data",
      "This would typically connect to the region's transit API to fetch the latest schedules and route information.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Update", 
          onPress: () => {
            // In a real app, this would make API calls to update transit data
            showToast('Transit data updated', 'success');
          }
        }
      ]
    );
  };

  const RegionCard = ({ region }: { region: RegionConfig }) => (
    <View style={[
      styles.regionCard,
      region.id === currentRegion.id && styles.currentRegionCard
    ]}>
      <Pressable
        style={styles.regionHeader}
        onPress={() => setRegion(region.id)}
      >
        <View style={styles.regionInfo}>
          <View style={styles.regionTitleRow}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.regionName}>{region.name}</Text>
            {region.id === currentRegion.id && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
          </View>
          <View style={styles.regionDetails}>
            <View style={styles.detailItem}>
              <Globe size={14} color={themeCtx.colors.textSecondary} />
              <Text style={styles.detailText}>{region.country}</Text>
            </View>
            <View style={styles.detailItem}>
              <Clock size={14} color={themeCtx.colors.textSecondary} />
              <Text style={styles.detailText}>{region.timezone}</Text>
            </View>
            <View style={styles.detailItem}>
              <Phone size={14} color={themeCtx.colors.textSecondary} />
              <Text style={styles.detailText}>{region.emergencyNumber}</Text>
            </View>
          </View>
          <Text style={styles.transitCount}>
            {region.transitSystems.length} transit system{region.transitSystems.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </Pressable>
      
      <View style={styles.regionActions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => handleUpdateTransitData(region.id)}
        >
          <Text style={styles.actionButtonText}>Update Transit</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => setEditingRegion(region)}
        >
          <Edit3 size={16} color={Colors.primary} />
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteRegion(region.id)}
        >
          <Trash2 size={16} color="/*TODO theme*/ theme.colors.placeholder /*#FF4444*/" />
        </Pressable>
      </View>
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
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Plus size={20} color="/*TODO theme*/ theme.colors.placeholder /*#FFFFFF*/" />
          <Text style={styles.addButtonText}>Add City</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
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
        <Text style={[styles.sectionTitle, { color: themeCtx.colors.text }]}>United States ({usRegions.length})</Text>
        {(searchQuery ? filteredRegions.filter(r => r.country === "United States") : usRegions).map((region) => (
          <RegionCard key={region.id} region={region} />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeCtx.colors.text }]}>International ({internationalRegions.length})</Text>
        {(searchQuery ? filteredRegions.filter(r => r.country !== "United States") : internationalRegions).map((region) => (
          <RegionCard key={region.id} region={region} />
        ))}
      </View>

      <View style={styles.infoSection}>
        <Text style={[styles.infoTitle, { color: themeCtx.colors.text }]}>Transit Data Updates</Text>
        <Text style={styles.infoText}>
          Transit schedules and route information are automatically updated when available. 
          You can manually refresh data for any city by tapping &quot;Update Transit&quot;.
        </Text>
        <Text style={styles.infoText}>
          Custom cities can be added with their own transit API endpoints for real-time data integration.
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
    mapStyle: region?.mapStyle || "standard",
    transitSystems: region?.transitSystems || [],
    safetyTips: region?.safetyTips || [],
    funFacts: region?.funFacts || [],
    popularPlaces: region?.popularPlaces || []
  });

  const handleSave = () => {
    if (!formData.id || !formData.name || !formData.country) {
      // Using toast from parent not directly available here; simple fallback Alert kept or lift state.
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
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>City ID *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.id}
          onChangeText={(text) => setFormData({ ...formData, id: text })}
          placeholder="e.g., nyc, chicago"
          editable={!region}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>City Name *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="e.g., New York City"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Country *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.country}
          onChangeText={(text) => setFormData({ ...formData, country: text })}
          placeholder="e.g., United States"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Transit API Endpoint</Text>
        <TextInput
          style={styles.formInput}
          value={formData.transitApiEndpoint}
          onChangeText={(text) => setFormData({ ...formData, transitApiEndpoint: text })}
          placeholder="https://api.example.com/"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Emergency Number</Text>
        <TextInput
          style={styles.formInput}
          value={formData.emergencyNumber}
          onChangeText={(text) => setFormData({ ...formData, emergencyNumber: text })}
          placeholder="911"
        />
      </View>

      <Text style={styles.infoText}>
        Additional configuration options like transit systems, coordinates, and local information 
        can be added through the advanced settings or by importing from a configuration file.
      </Text>
    </ScrollView>
  );
}

  // NOTE: Styles below still reference legacy Colors for some non-restricted tokens. Restricted ones replaced at usage.
  const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    backgroundColor: "/*TODO theme*/ theme.colors.placeholder /*#F0F4FF*/",
    borderRadius: 8,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  addButton: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 8,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: "/*TODO theme*/ theme.colors.placeholder /*#FFFFFF*/",
    fontSize: 14,
    fontWeight: "600",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  currentBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  currentBadgeText: {
    color: "/*TODO theme*/ theme.colors.placeholder /*#FFFFFF*/",
    fontSize: 12,
    fontWeight: "600",
  },
  currentRegionCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  deleteButton: {
    backgroundColor: "/*TODO theme*/ theme.colors.placeholder /*#FFF0F0*/",
  },
  detailItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  detailText: {
    // replaced at usage site with themeCtx.colors.textSecondary
    color: Colors.textLight, // TODO: replace with theme.colors.textSecondary
    fontSize: 14,
  },
  formInput: {
    backgroundColor: Colors.card, // TODO: replace with theme.colors.surface
    borderColor: Colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: Colors.text,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  formLabel: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  formSection: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  infoSection: {
    backgroundColor: Colors.card, // TODO: replace with theme.colors.surface
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  infoText: {
    color: Colors.textLight, // TODO: replace with theme.colors.textSecondary
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  infoTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  regionActions: {
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  regionCard: {
    backgroundColor: Colors.card, // TODO: replace with theme.colors.surface
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  regionDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  regionHeader: {
    padding: 16,
  },
  regionInfo: {
    gap: 8,
  },
  regionName: {
    color: Colors.text,
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  regionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: "/*TODO theme*/ theme.colors.placeholder /*#FFFFFF*/",
    fontWeight: "600",
  },
  searchContainer: {
    alignItems: "center",
    backgroundColor: Colors.card, // TODO: replace with theme.colors.surface
    borderRadius: 12,
    flexDirection: "row",
    gap: 12,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    color: Colors.text,
    flex: 1,
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  transitCount: {
    color: Colors.textLight, // TODO: replace with theme.colors.textSecondary
    fontSize: 14,
    fontStyle: "italic",
  },
});
