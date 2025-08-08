import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native'
import Colors from '../../src/constants/colors'
import SearchBar from '../../src/components/SearchBar'
import { Clock, RefreshCw } from 'lucide-react-native'
import LiveArrivalsCard from '../../src/components/LiveArrivalsCard'
import useLocation from '../../src/hooks/useLocation'
import {
  getNearbyTransitStations,
  getTransitLineStatus,
  TransitStation,
  TransitLine,
} from '../../src/utils/transitApi'

export default function TransitScreen() {
  const { location } = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLine, setSelectedLine] = useState<string | null>(null)
  const [selectedStation, setSelectedStation] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Real transit data states
  const [transitLines, setTransitLines] = useState<TransitLine[]>([])
  const [nearbyStations, setNearbyStations] = useState<TransitStation[]>([])
  const [loadingLines, setLoadingLines] = useState(true)
  const [loadingStations, setLoadingStations] = useState(true)

  // Load transit data on component mount and location change
  useEffect(() => {
    loadTransitData()
  }, [])

  useEffect(() => {
    if (location) {
      loadNearbyStations()
    }
  }, [location])

  // Auto-refresh arrivals every 30 seconds
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
        1000, // 1km radius
      )
      setNearbyStations(stations)

      // Auto-select first station if none selected
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
      // Reload both transit lines and nearby stations
      await Promise.all([loadTransitData(), loadNearbyStations()])
    } catch (error) {
      console.error('Error refreshing transit data:', error)
    } finally {
      // Add a small delay to show the refresh animation
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return Colors.success
      case 'delayed':
        return Colors.warning
      case 'alert':
      case 'suspended':
        return Colors.error
      default:
        return Colors.textLight
    }
  }

  const filteredLines = transitLines.filter((line) =>
    line.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedStationData = nearbyStations.find(
    (station) => station.id === selectedStation,
  )

  return (
    <View style={styles.container}>
      {/* Header */}
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
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search transit lines..."
          />
        </View>

        {/* Last Updated */}
        <View style={styles.lastUpdatedContainer}>
          <Clock size={14} color={Colors.textLight} />
          <Text style={styles.lastUpdatedText}>
            Last updated {getTimeAgo(lastRefresh)}
          </Text>
        </View>

        {/* Nearby Stations */}
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

        {/* Live Arrivals */}
        {selectedStationData && (
          <LiveArrivalsCard
            stationName={selectedStationData.name}
            arrivals={(selectedStationData.arrivals || []).map((arrival) => ({
              id: arrival.route,
              line: arrival.route,
              color: '#4A80F0',
              destination: arrival.destination,
              arrivalTime: arrival.arrivalTime.includes('min')
                ? parseInt(arrival.arrivalTime) || 0
                : 0,
              type: 'subway' as const,
            }))}
            lastUpdated={getTimeAgo(lastRefresh)}
            onRefresh={handleRefreshArrivals}
            isRefreshing={isRefreshing}
          />
        )}

        {/* Transit Lines Status */}
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
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(line.status) },
                ]}
              />
              <Text style={styles.statusText}>
                {line.message || 'No status information'}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.card,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  stationsScroll: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  stationsContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
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
  selectedStationButtonText: {
    color: '#FFFFFF',
  },
  stationDistance: {
    fontSize: 12,
    color: Colors.textLight,
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  selectedLine: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  lineCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lineText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statusContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
})
