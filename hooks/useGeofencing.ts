import { useEffect, useRef } from 'react'
import { useSafeZoneStore } from '@/stores/safeZoneStore'
import useLocation from '@/hooks/useLocation'
import { safeZoneAlertManager } from '@/utils/safeZoneAlerts'

export function useGeofencing(
  onEnterExit?: (zoneId: string, event: 'enter' | 'exit') => void,
) {
  const { safeZones } = useSafeZoneStore()
  const { location } = useLocation()
  const prevZoneIds = useRef<Set<string>>(new Set())

  // Initialize alert manager
  useEffect(() => {
    safeZoneAlertManager.initialize()
  }, [])

  // Haversine formula for distance in meters
  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  useEffect(() => {
    if (!location) return

    const insideZones = new Set<string>()
    const currentLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
    }

    safeZones.forEach((zone) => {
      const distance = getDistance(
        location.latitude,
        location.longitude,
        zone.latitude,
        zone.longitude,
      )
      if (distance <= zone.radius) {
        insideZones.add(zone.id)
      }
    })

    // Detect entry
    insideZones.forEach((zoneId) => {
      if (!prevZoneIds.current.has(zoneId)) {
        const zone = safeZones.find((z) => z.id === zoneId)
        if (zone) {
          // Trigger callback if provided
          onEnterExit?.(zoneId, 'enter')

          // Handle alert system
          safeZoneAlertManager.handleSafeZoneEvent(
            zoneId,
            'enter',
            zone,
            currentLocation,
          )
        }
      }
    })

    // Detect exit
    prevZoneIds.current.forEach((zoneId) => {
      if (!insideZones.has(zoneId)) {
        const zone = safeZones.find((z) => z.id === zoneId)
        if (zone) {
          // Trigger callback if provided
          onEnterExit?.(zoneId, 'exit')

          // Handle alert system
          safeZoneAlertManager.handleSafeZoneEvent(
            zoneId,
            'exit',
            zone,
            currentLocation,
          )
        }
      }
    })

    prevZoneIds.current = insideZones
  }, [location, safeZones, onEnterExit])

  // Return current zone status
  return {
    currentZones: Array.from(prevZoneIds.current),
    isInSafeZone: prevZoneIds.current.size > 0,
    safeZoneCount: prevZoneIds.current.size,
  }
}
