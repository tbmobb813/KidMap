import { Globe, X } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, Modal } from "react-native";

import RegionSelector from "./RegionSelector";

import { useTheme } from "@/constants/theme";
import { useRegionStore } from "@/stores/regionStore";

const RegionSwitcher: React.FC = () => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [showModal, setShowModal] = useState(false);
  const { currentRegion, availableRegions, userPreferences, setRegion } = useRegionStore();

  const handleRegionSelect = (regionId: string) => {
    setRegion(regionId);
    setShowModal(false);
  };

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setShowModal(true)}>
  <Globe size={20} color={theme.colors.primary} />
        <Text style={styles.triggerText}>{currentRegion.name}</Text>
      </Pressable>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Switch Region</Text>
            <Pressable style={styles.closeButton} onPress={() => setShowModal(false)}>
              <X size={24} color={theme.colors.text} />
            </Pressable>
          </View>
          
          <RegionSelector
            regions={availableRegions}
            selectedRegion={userPreferences.selectedRegion}
            onSelectRegion={handleRegionSelect}
          />
        </View>
      </Modal>
    </>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  closeButton: { padding: 4 },
  modalContainer: { backgroundColor: theme.colors.background, flex: 1 },
  modalHeader: {
    alignItems: "center",
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  modalTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "600" },
  trigger: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  triggerText: { color: theme.colors.text, fontSize: 14, fontWeight: "500" },
});

export default RegionSwitcher;
