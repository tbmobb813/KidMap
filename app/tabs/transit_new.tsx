import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  RefreshControl,
} from 'react-native'
import Colors from '../../src/constants/colors'
import SearchBar from '../../src/components/SearchBar'
import { Clock, AlertCircle, RefreshCw } from 'lucide-react-native'
import LiveArrivalsCard from '../../src/components/LiveArrivalsCard'
import useLocation from '../../src/hooks/useLocation'
import {
  getNearbyTransitStations,
  getTransitLineStatus,
  TransitStation,
  TransitLine,
} from '../../src/utils/transitApi'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const TransitScreen = () => {
  const { location } = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLine, setSelectedLine] = useState<string | null>(null)
  const [selectedStation, setSelectedStation] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const [transitLines, setTransitLines] = useState<TransitLine[]>([])
  const [nearbyStations, setNearbyStations] = useState<TransitStation[]>([])
  const [loadingLines, setLoadingLines] = useState(true)
  const [loadingStations, setLoadingStations] = useState(true)

  useEffect(() => {
    loadTransitData()
  }, [])

  useEffect(() => {
    if (location) {
      loadNearbyStations()
    }
  }, [location])

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefreshArrivals()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadTransitData = async () => {
    setLoadingLines(true)
    try {
      const lines = await getTransitLineStatus()
      setTransitLines(lines)
    } catch (error) {
      console.error('Error loading transit lines:', error)
    } finally {
      setLoadingLines(false)
    }
  }

  const loadNearbyStations = async () => {
    if (!location) return
    setLoadingStations(true)
    try {
      const stations = await getNearbyTransitStations(
        { lat: location.latitude, lng: location.longitude },
        1000,
      )
      setNearbyStations(stations)
      if (stations.length > 0 && !selectedStation) {
        setSelectedStation(stations[0].id)
      }
    } catch (error) {
      console.error('Error loading nearby stations:', error)
    } finally {
      setLoadingStations(false)
    }
  }

  const handleRefreshArrivals = async () => {
    setIsRefreshing(true)
    setLastRefresh(new Date())
    try {
      await Promise.all([loadTransitData(), loadNearbyStations()])
    } catch (error) {
      console.error('Error refreshing transit data:', error)
    } finally {
      setTimeout(() => {
        setIsRefreshing(false)
      }, 1000)
    }
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds} sec ago`
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min ago`
  }

  const getStatusIcon = (status: string) => {
    const colorMap = {
      normal: Colors.success,
      delayed: Colors.warning,
      alert: Colors.error,
      suspended: Colors.error,
    }
    const color = colorMap[status] || Colors.textLight
    const Icon =
      status === 'alert' || status === 'suspended' ? AlertCircle : Clock
    return <Icon size={16} color={color} />
  }

  const filteredLines = transitLines.filter((line) =>
    line.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedStationData = nearbyStations.find(
    (station) => station.id === selectedStation,
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transit</Text>
        <Pressable
          style={styles.refreshButton}
          onPress={handleRefreshArrivals}
          disabled={isRefreshing}
        >
          <RefreshCw
            size={20}
            color={Colors.primary}
            style={{ opacity: isRefreshing ? 0.5 : 1 }}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefreshArrivals}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search transit lines..."
          />
        </View>

        <View style={styles.lastUpdatedContainer}>
          <Clock size={14} color={Colors.textLight} />
          <Text style={styles.lastUpdatedText}>
            Last updated {getTimeAgo(lastRefresh)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Nearby Stations</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stationsScroll}
          contentContainerStyle={styles.stationsContainer}
        >
          {nearbyStations.map((station) => (
            <Pressable
              key={station.id}
              style={[
                styles.stationButton,
                selectedStation === station.id && styles.selectedStationButton,
              ]}
              onPress={() => setSelectedStation(station.id)}
            >
              <Text
                style={[
                  styles.stationButtonText,
                  selectedStation === station.id &&
                    styles.selectedStationButtonText,
                ]}
              >
                {station.name}
              </Text>
              <Text style={styles.stationDistance}>
                {(station.distance * 1000).toFixed(0)}m
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {selectedStationData && (
          <LiveArrivalsCard
            stationName={selectedStationData.name}
            arrivals={selectedStationData.arrivals || []}
            lastUpdated={getTimeAgo(lastRefresh)}
            onRefresh={handleRefreshArrivals}
            isRefreshing={isRefreshing}
          />
        )}

        <Text style={styles.sectionTitle}>Transit Lines</Text>
        {filteredLines.map((line) => (
          <Pressable
            key={line.id}
            style={[
              styles.lineItem,
              selectedLine === line.id && styles.selectedLine,
            ]}
            onPress={() => setSelectedLine(line.id)}
          >
            <View style={[styles.lineCircle, { backgroundColor: line.color }]}>
              <Text style={styles.lineText}>{line.name}</Text>
            </View>
            <View style={styles.statusContainer}>
              <View style={styles.statusInfo}>
                {getStatusIcon(line.status)}
                <Text style={styles.statusText}>{line.statusMessage}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.text },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.card,
  },
  searchContainer: { marginBottom: 16 },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  lastUpdatedText: { fontSize: 12, color: Colors.textLight, marginLeft: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  stationsScroll: { marginBottom: 16 },
  stationsContainer: { paddingHorizontal: 4, gap: 12 },
  stationButton: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 140,
  },
  selectedStationButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedStationButtonText: { color: '#FFFFFF' },
  stationDistance: { fontSize: 12, color: Colors.textLight },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedLine: { borderWidth: 2, borderColor: Colors.primary },
  lineCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lineText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  statusContainer: { flex: 1 },
  statusInfo: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 14, color: Colors.text, marginLeft: 8 },
})

export default TransitScreen
