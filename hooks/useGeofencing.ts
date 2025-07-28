import { useEffect, useRef } from 'react';
import { useSafeZoneStore } from '@/stores/safeZoneStore';
import useLocation from '@/hooks/useLocation';

export function useGeofencing(onEnterExit: (zoneId: string, event: 'enter' | 'exit') => void) {
  const { safeZones } = useSafeZoneStore();
  const { location } = useLocation();
  const prevZoneIds = useRef<Set<string>>(new Set());

  // Haversine formula for distance in meters
  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  useEffect(() => {
    if (!location) return;
    const insideZones = new Set<string>();
    safeZones.forEach((zone) => {
      const d = getDistance(location.latitude, location.longitude, zone.latitude, zone.longitude);
      if (d <= zone.radius) insideZones.add(zone.id);
    });
    // Detect entry
    insideZones.forEach((id) => {
      if (!prevZoneIds.current.has(id)) onEnterExit(id, 'enter');
    });
    // Detect exit
    prevZoneIds.current.forEach((id) => {
      if (!insideZones.has(id)) onEnterExit(id, 'exit');
    });
    prevZoneIds.current = insideZones;
  }, [location, safeZones]);
}
