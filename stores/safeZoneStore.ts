import { create } from 'zustand'
import { SafeZone } from '@/components/SafeZoneManager'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface SafeZoneState {
  safeZones: SafeZone[]
  addSafeZone: (zone: SafeZone) => void
  updateSafeZone: (zone: SafeZone) => void
  removeSafeZone: (id: string) => void
  setSafeZones: (zones: SafeZone[]) => void
}

export const useSafeZoneStore = create<SafeZoneState>()(
  persist(
    (set, get) => ({
      safeZones: [],
      addSafeZone: (zone) =>
        set((state) => ({ safeZones: [...state.safeZones, zone] })),
      updateSafeZone: (zone) =>
        set((state) => ({
          safeZones: state.safeZones.map((z) => (z.id === zone.id ? zone : z)),
        })),
      removeSafeZone: (id) =>
        set((state) => ({
          safeZones: state.safeZones.filter((z) => z.id !== id),
        })),
      setSafeZones: (zones) => set({ safeZones: zones }),
    }),
    {
      name: 'safe-zones',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
