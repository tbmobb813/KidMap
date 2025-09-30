import { useEffect, useRef, useState, useCallback } from 'react';

import type { SafeZone } from '../types/parental';

// Use alias path for easier mocking in tests
import { SafeZoneSchema } from '@/core/validation/safetySchemas';
import useLocation from '@/hooks/useLocation';
import { useParentalStore } from '@/modules/safety/stores/parentalStore';

export type SafeZoneStatus = {
    inside: SafeZone[];
    outside: SafeZone[];
    totalActive: number;
    currentLocation: { timestamp: number };
} | null;

type ZoneEvent = {
    id: string;
    zoneId: string;
    zoneName: string;
    type: 'entry' | 'exit';
    timestamp: number;
};

export const useSafeZoneMonitor = (): {
    isMonitoring: boolean;
    getCurrentSafeZoneStatus: () => SafeZoneStatus;
    startMonitoring: () => void;
    stopMonitoring: () => void;
    events: ZoneEvent[];
    forceRefresh: () => void;
} => {
    const { safeZones } = useParentalStore();
    const { location, hasLocation } = useLocation();
    const [isMonitoring, setIsMonitoring] = useState(false);
    const lastUpdateRef = useRef<number>(Date.now());
    const [cachedStatus, setCachedStatus] = useState<SafeZoneStatus>(null);
    const eventsRef = useRef<ZoneEvent[]>([]);
    // Works across platforms
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastInsideIdsRef = useRef<Set<string>>(new Set());

    const clearTick = () => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Keep latest values in refs so callbacks invoked from stale instances
    // still use up-to-date state (important for tests calling old monitor refs).
    const locationRef = useRef(location);
    const hasLocationRef = useRef(hasLocation);
    const safeZonesRef = useRef(safeZones);
    useEffect(() => { locationRef.current = location; }, [location]);
    useEffect(() => { hasLocationRef.current = hasLocation; }, [hasLocation]);
    useEffect(() => { safeZonesRef.current = safeZones; }, [safeZones]);

    useEffect(() => {
        if (isMonitoring) {
            intervalRef.current = setInterval(() => {
                forceRefresh();
            }, 10000); // 10s cadence; could be made configurable
        }
        return () => clearTick();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMonitoring]);

    const computeStatus = useCallback((): SafeZoneStatus => {
        const currentZones = safeZonesRef.current || [];
        const active = currentZones.filter(z => z.isActive);
        // Validate active zones defensively (skip invalid)
        const validated: SafeZone[] = [];
        for (const z of active) {
            const parse = SafeZoneSchema.safeParse({
                id: z.id,
                name: z.name,
                center: { latitude: z.latitude, longitude: z.longitude },
                radius: z.radius,
                isActive: z.isActive,
            });
            if (parse.success) validated.push(z);
        }
    const curHasLocation = hasLocationRef.current;
    const curLocation: any = locationRef.current as any;
        if (!curHasLocation || curLocation?.error) {
            return {
                inside: [],
                outside: validated,
                totalActive: validated.length,
                currentLocation: { timestamp: lastUpdateRef.current },
            };
        }

        const { latitude, longitude } = curLocation;
        const inside: SafeZone[] = [];
        const outside: SafeZone[] = [];
        for (const zone of validated) {
            const dx = zone.latitude - latitude;
            const dy = zone.longitude - longitude;
            const distanceMeters = Math.sqrt(dx * dx + dy * dy) * 111_000; // coarse meter conversion
            if (distanceMeters <= zone.radius) {
                inside.push(zone);
            } else {
                outside.push(zone);
            }
        }
        return {
            inside,
            outside,
            totalActive: validated.length,
            currentLocation: { timestamp: lastUpdateRef.current },
        };
    }, []);

    const recordEvents = useCallback((nextInside: SafeZone[]) => {
        // Read the previous set at invocation time and compute diffs.
        const prevInside = new Set(Array.from(lastInsideIdsRef.current));
        const nextSet = new Set(nextInside.map(z => z.id));
        const newEvents: ZoneEvent[] = [];
        // Entries
        for (const zone of nextInside) {
            if (!prevInside.has(zone.id)) {
                newEvents.push({
                    id: `evt_${Date.now()}_${zone.id}_entry`,
                    zoneId: zone.id,
                    zoneName: zone.name,
                    type: 'entry',
                    timestamp: Date.now(),
                });
            }
        }
        // Exits
        for (const id of prevInside) {
            if (!nextSet.has(id)) {
                const zone = (safeZonesRef.current || []).find(z => z.id === id);
                if (zone) {
                    newEvents.push({
                        id: `evt_${Date.now()}_${zone.id}_exit`,
                        zoneId: zone.id,
                        zoneName: zone.name,
                        type: 'exit',
                        timestamp: Date.now(),
                    });
                }
            }
        }
        if (newEvents.length) {
            // Mutate the existing array in-place so callers holding a
            // reference (like tests that read monitor.events) observe the
            // updates without needing a new array identity.
            eventsRef.current.unshift(...newEvents);
            if (eventsRef.current.length > 20) eventsRef.current.length = 20;
        }
        // Update ref after recording so subsequent comparisons are correct.
        lastInsideIdsRef.current = nextSet;
    }, []);

    const forceRefresh = useCallback(() => {
        lastUpdateRef.current = Date.now();
        const status = computeStatus();
        if (status) {
            recordEvents(status.inside);
        }
        setCachedStatus(status);
    }, [computeStatus, recordEvents]);

    const getCurrentSafeZoneStatus = (): SafeZoneStatus => {
        if (!cachedStatus) return computeStatus();
        return cachedStatus;
    };

    const startMonitoring = () => {
        if (!isMonitoring) {
            setIsMonitoring(true);
            forceRefresh();
        }
    };
    const stopMonitoring = () => {
        clearTick();
        setIsMonitoring(false);
    };

    return { isMonitoring, getCurrentSafeZoneStatus, startMonitoring, stopMonitoring, events: eventsRef.current, forceRefresh };
};
