import { Clock, MapPin, AlertCircle, Bell } from "lucide-react-native";
import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, Platform } from "react-native";

import LiveArrivalsCard from "@/components/LiveArrivalsCard";
import SearchBar from "@/components/SearchBar";
import { useTheme } from "@/constants/theme";
import { mockLiveArrivals, nearbyStations } from "@/mocks/liveArrivals";
import { subwayLines } from "@/mocks/transit";

const { width: screenWidth } = Dimensions.get('window');

type SubwayStatus = {
  id: string;
  name: string;
  status: string;
  message: string;
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  alertContainer: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 8,
    flexDirection: "row",
    padding: 12,
  },
  alertIcon: { marginRight: 8 },
  alertText: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 14,
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  detailsTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  lineCircle: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    marginRight: 16,
    width: 36,
  },
  lineDetailsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginTop: 8,
    padding: 16,
  },
  lineItem: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 12,
    padding: 16,
  },
  lineText: {
    color: theme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: "700",
  },
  linesContainer: {
    gap: 12,
    marginBottom: 16,
  },
  nextTrainsContainer: { marginTop: 8 },
  nextTrainsTitle: { color: theme.colors.textSecondary, fontSize: 14, marginBottom: 8 },
  quickActionButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    flex: Platform.select({
      web: screenWidth > 768 ? 1 : undefined,
      default: 1,
    }),
    gap: 8,
    minHeight: 80,
    padding: 16,
  },
  quickActionText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  quickActions: {
    flexDirection: Platform.select({
      web: screenWidth > 768 ? "row" : "column",
      default: "row",
    }),
    gap: 12,
    justifyContent: "space-between",
  },
  quickActionsContainer: { marginBottom: 16 },
  scrollContent: { flexGrow: 1, padding: 16, paddingBottom: 32 },
  searchContainer: { marginBottom: 16 },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "700", marginBottom: 16 },
  selectedLine: { borderColor: theme.colors.primary, borderWidth: 2 },
  selectedStationButton: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  selectedStationButtonText: { color: theme.colors.primaryForeground },
  stationButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 140,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stationButtonText: { color: theme.colors.text, fontSize: 14, fontWeight: "600", marginBottom: 4 },
  stationDistance: { color: theme.colors.textSecondary, fontSize: 12 },
  stationsContainer: { gap: 12, paddingHorizontal: 4 },
  stationsScroll: { marginBottom: 16 },
  statusContainer: { alignItems: "center", flex: 1, flexDirection: "row" },
  statusDot: { borderRadius: 5, height: 10, marginRight: 8, width: 10 },
  statusHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  statusSummaryContainer: { backgroundColor: theme.colors.surface, borderRadius: 12, marginBottom: 24, padding: 16 },
  statusText: { color: theme.colors.text, fontSize: 14 },
  timeContainer: { alignItems: "center", flexDirection: "row" },
  timeText: { color: theme.colors.textSecondary, fontSize: 12, marginLeft: 4 },
  trainDirectionText: { color: theme.colors.textSecondary, fontSize: 12 },
  trainTime: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 8,
    flex: Platform.select({
      web: screenWidth > 600 ? 1 : undefined,
      default: 1,
    }),
    minWidth: Platform.select({
      web: screenWidth > 600 ? 80 : "100%",
      default: 80,
    }),
    padding: 12,
  },
  trainTimeText: { color: theme.colors.primary, fontSize: 16, fontWeight: "700", marginBottom: 4 },
  trainTimesContainer: {
    flexDirection: Platform.select({
      web: screenWidth > 600 ? "row" : "column",
      default: "row",
    }),
    gap: 8,
    justifyContent: "space-between",
  },
});

export default function TransitScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]); // styles already theme-based
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<string | null>("main-st-station");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh arrivals every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefreshArrivals();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefreshArrivals = () => {
    setIsRefreshing(true);
    setLastRefresh(new Date());
    
    // Simulate API call delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min ago`;
  };

  // Mock subway status data
  const subwayStatus: SubwayStatus[] = [
    { id: "a", name: "A", status: "normal", message: "Good service" },
    { id: "b", name: "B", status: "delayed", message: "Delays of 10-15 minutes" },
    { id: "c", name: "C", status: "normal", message: "Good service" },
    { id: "d", name: "D", status: "normal", message: "Good service" },
    { id: "e", name: "E", status: "alert", message: "Service changes this weekend" },
    { id: "f", name: "F", status: "normal", message: "Good service" },
    { id: "g", name: "G", status: "normal", message: "Good service" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return theme.colors.success;
      case "delayed": return theme.colors.warning;
      case "alert": return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const renderStationButton = (station: typeof nearbyStations[0]) => (
    <Pressable
      key={station.id}
      style={[
        styles.stationButton,
        selectedStation === station.id && styles.selectedStationButton
      ]}
      onPress={() => setSelectedStation(station.id)}
    >
      <Text style={[
        styles.stationButtonText,
        selectedStation === station.id && styles.selectedStationButtonText
      ]}>
        {station.name}
      </Text>
      <Text style={styles.stationDistance}>{station.distance}</Text>
    </Pressable>
  );

  const renderLineItem = (item: typeof subwayLines[0]) => {
    const status = subwayStatus.find(s => s.id === item.id);
    
    return (
      <Pressable
        key={item.id}
        style={[
          styles.lineItem,
          selectedLine === item.id && styles.selectedLine
        ]}
        onPress={() => setSelectedLine(item.id)}
      >
        <View style={[styles.lineCircle, { backgroundColor: item.color }]}>
          <Text style={styles.lineText}>{item.name}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(status?.status || 'normal') }]} />
          <Text style={styles.statusText}>{status?.message || 'No information available'}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder="Search for subway or train lines"
        />
      </View>

  <Text style={styles.sectionTitle}>Live Arrivals</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.stationsScroll}
        contentContainerStyle={styles.stationsContainer}
      >
        {nearbyStations.map(renderStationButton)}
      </ScrollView>

      {selectedStation && (
        <LiveArrivalsCard
          stationName={nearbyStations.find(s => s.id === selectedStation)?.name || "Station"}
          arrivals={mockLiveArrivals[selectedStation] || []}
          lastUpdated={getTimeAgo(lastRefresh)}
          onRefresh={handleRefreshArrivals}
          isRefreshing={isRefreshing}
        />
      )}

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Pressable style={styles.quickActionButton}>
            <Bell size={20} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Set Alerts</Text>
          </Pressable>
          <Pressable style={styles.quickActionButton}>
            <MapPin size={20} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Find Station</Text>
          </Pressable>
          <Pressable style={styles.quickActionButton}>
            <Clock size={20} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Schedule</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.statusSummaryContainer}>
        <View style={styles.statusHeader}>
          <Text style={styles.sectionTitle}>Subway Status</Text>
          <View style={styles.timeContainer}>
            <Clock size={14} color={theme.colors.textSecondary} />
            <Text style={styles.timeText}>Updated 5 min ago</Text>
          </View>
        </View>

        <View style={styles.alertContainer}>
          <AlertCircle size={20} color={theme.colors.warning} style={styles.alertIcon} />
          <Text style={styles.alertText}>
            Some lines are experiencing delays or service changes
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Subway Lines</Text>
      <View style={styles.linesContainer}>
        {subwayLines.map(renderLineItem)}
      </View>

      {selectedLine && (
        <View style={styles.lineDetailsContainer}>
          <Text style={styles.detailsTitle}>
            Line {subwayLines.find(l => l.id === selectedLine)?.name} Details
          </Text>
          <View style={styles.nextTrainsContainer}>
            <Text style={styles.nextTrainsTitle}>Next trains:</Text>
            <View style={styles.trainTimesContainer}>
              <View style={styles.trainTime}>
                <Text style={styles.trainTimeText}>3 min</Text>
                <Text style={styles.trainDirectionText}>Uptown</Text>
              </View>
              <View style={styles.trainTime}>
                <Text style={styles.trainTimeText}>7 min</Text>
                <Text style={styles.trainDirectionText}>Downtown</Text>
              </View>
              <View style={styles.trainTime}>
                <Text style={styles.trainTimeText}>12 min</Text>
                <Text style={styles.trainDirectionText}>Uptown</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
