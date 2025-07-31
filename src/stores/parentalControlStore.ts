// stores/parentalControlStore.ts - Zustand store for parental controls
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as LocalAuthentication from 'expo-local-authentication'
import { PendingApproval } from '@/types'

export interface ParentSettings {
  requireAuthentication: boolean
  authenticationMethod: 'pin' | 'biometric' | 'both'
  pin?: string
  allowChildCategoryCreation: boolean
  requireApprovalForNewCategories: boolean
  allowChildSafeZoneModification: boolean
  maxSafeZoneDistance: number // meters
  checkInReminders: boolean
  checkInInterval: number // minutes
  emergencyContacts: EmergencyContact[]
  restrictedHours: {
    enabled: boolean
    start: string // "HH:MM" format
    end: string // "HH:MM" format
    allowEmergencyAccess: boolean
  }
  locationSharing: {
    enabled: boolean
    frequency: number // minutes
    shareWithContacts: string[]
  }
}

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  email?: string
  relationship: string
  priority: number // 1 = highest priority
  canReceiveAlerts: boolean
  canViewLocation: boolean
}

export interface ParentSession {
  isAuthenticated: boolean
  authenticatedAt: Date
  sessionTimeout: number // minutes
  lastActivity: Date
}

interface ParentalControlState {
  // Authentication state
  session: ParentSession | null

  // Settings
  settings: ParentSettings

  // Pending approvals
  pendingApprovals: PendingApproval[]

  // Child activity monitoring
  childActivity: {
    lastSeen: Date | null
    currentLocation: [number, number] | null
    batteryLevel: number | null
    isInSafeZone: boolean
    currentSafeZone: string | null
  }

  // Actions
  authenticateParent: (pin?: string, useBiometric?: boolean) => Promise<boolean>
  logoutParent: () => void
  updateSettings: (newSettings: Partial<ParentSettings>) => void

  // Approval management
  addPendingApproval: (
    approval: Omit<PendingApproval, 'id' | 'requestedAt' | 'status'>,
  ) => void
  approveRequest: (id: string, notes?: string) => void
  rejectRequest: (id: string, notes?: string) => void

  // Emergency functions
  triggerEmergencyAlert: () => Promise<void>
  requestChildCheckIn: () => Promise<void>
  locateChild: () => Promise<[number, number] | null>

  // Activity monitoring
  updateChildActivity: (
    activity: Partial<ParentalControlState['childActivity']>,
  ) => void

  // Utility functions
  isSessionValid: () => boolean
  extendSession: () => void
  canChildPerformAction: (action: string) => boolean
}

const DEFAULT_SETTINGS: ParentSettings = {
  requireAuthentication: true,
  authenticationMethod: 'both',
  allowChildCategoryCreation: true,
  requireApprovalForNewCategories: true,
  allowChildSafeZoneModification: false,
  maxSafeZoneDistance: 500,
  checkInReminders: true,
  checkInInterval: 60, // 1 hour
  emergencyContacts: [],
  restrictedHours: {
    enabled: false,
    start: '22:00',
    end: '06:00',
    allowEmergencyAccess: true,
  },
  locationSharing: {
    enabled: true,
    frequency: 15, // 15 minutes
    shareWithContacts: [],
  },
}

export const useParentalControlStore = create<ParentalControlState>()(
  persist(
    (set, get) => ({
      session: null,
      settings: DEFAULT_SETTINGS,
      pendingApprovals: [],
      childActivity: {
        lastSeen: null,
        currentLocation: null,
        batteryLevel: null,
        isInSafeZone: false,
        currentSafeZone: null,
      },

      authenticateParent: async (
        pin?: string,
        useBiometric: boolean = true,
      ) => {
        const { settings } = get()

        try {
          // Check if biometric authentication is requested and available
          if (useBiometric && settings.authenticationMethod !== 'pin') {
            const biometricResult = await LocalAuthentication.authenticateAsync(
              {
                promptMessage:
                  'Parent Access Required - Use your fingerprint or face to access parental controls',
                fallbackLabel: 'Use PIN instead',
                disableDeviceFallback: false,
              },
            )

            if (biometricResult.success) {
              const session: ParentSession = {
                isAuthenticated: true,
                authenticatedAt: new Date(),
                sessionTimeout: 30, // 30 minutes
                lastActivity: new Date(),
              }

              set({ session })
              return true
            }

            if (
              settings.authenticationMethod === 'biometric' &&
              !biometricResult.success
            ) {
              return false
            }
          }

          // PIN authentication
          if (settings.authenticationMethod !== 'biometric') {
            if (!pin || !settings.pin) {
              return false
            }

            if (pin === settings.pin) {
              const session: ParentSession = {
                isAuthenticated: true,
                authenticatedAt: new Date(),
                sessionTimeout: 30,
                lastActivity: new Date(),
              }

              set({ session })
              return true
            }
          }

          return false
        } catch (error) {
          console.error('Authentication error:', error)
          return false
        }
      },

      logoutParent: () => {
        set({ session: null })
      },

      updateSettings: (newSettings: Partial<ParentSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },

      addPendingApproval: (approval) => {
        const newApproval: PendingApproval = {
          ...approval,
          id: Date.now().toString(),
          timestamp: Date.now(),
          status: 'pending',
        }

        set((state) => ({
          pendingApprovals: [...state.pendingApprovals, newApproval],
        }))
      },

      approveRequest: (id: string, notes?: string) => {
        set((state) => ({
          pendingApprovals: state.pendingApprovals.map((approval) =>
            approval.id === id
              ? { ...approval, status: 'approved' as const, parentNotes: notes }
              : approval,
          ),
        }))
      },

      rejectRequest: (id: string, notes?: string) => {
        set((state) => ({
          pendingApprovals: state.pendingApprovals.map((approval) =>
            approval.id === id
              ? { ...approval, status: 'rejected' as const, parentNotes: notes }
              : approval,
          ),
        }))
      },

      triggerEmergencyAlert: async () => {
        const { settings, childActivity } = get()

        // Send emergency alerts to all emergency contacts
        for (const contact of settings.emergencyContacts) {
          if (contact.canReceiveAlerts) {
            try {
              // In a real implementation, this would send SMS/email
              console.log(
                `Emergency alert sent to ${contact.name}: ${contact.phone}`,
              )

              // Include child's location if available
              if (childActivity.currentLocation) {
                console.log(
                  `Child location: ${childActivity.currentLocation[0]}, ${childActivity.currentLocation[1]}`,
                )
              }
            } catch (error) {
              console.error(
                `Failed to send emergency alert to ${contact.name}:`,
                error,
              )
            }
          }
        }
      },

      requestChildCheckIn: async () => {
        try {
          // In a real implementation, this would send a push notification to the child's device
          console.log('Check-in request sent to child')

          // Set a reminder to follow up if no response
          setTimeout(
            () => {
              const { childActivity } = get()
              const timeSinceLastSeen = childActivity.lastSeen
                ? Date.now() - childActivity.lastSeen.getTime()
                : Infinity

              if (timeSinceLastSeen > 10 * 60 * 1000) {
                // 10 minutes
                console.log('Child has not responded to check-in request')
                // Could trigger additional alerts here
              }
            },
            10 * 60 * 1000,
          )
        } catch (error) {
          console.error('Failed to request child check-in:', error)
        }
      },

      locateChild: async () => {
        try {
          // In a real implementation, this would request the child's current location
          const { childActivity } = get()

          if (childActivity.currentLocation) {
            return childActivity.currentLocation
          }

          // Trigger location request
          console.log('Location request sent to child device')

          // Return null if location is not immediately available
          return null
        } catch (error) {
          console.error('Failed to locate child:', error)
          return null
        }
      },

      updateChildActivity: (activity) => {
        set((state) => ({
          childActivity: { ...state.childActivity, ...activity },
        }))
      },

      isSessionValid: () => {
        const { session } = get()

        if (!session || !session.isAuthenticated) {
          return false
        }

        const now = new Date()
        const sessionAge = now.getTime() - session.lastActivity.getTime()
        const timeoutMs = session.sessionTimeout * 60 * 1000

        return sessionAge < timeoutMs
      },

      extendSession: () => {
        set((state) => ({
          session: state.session
            ? {
                ...state.session,
                lastActivity: new Date(),
              }
            : null,
        }))
      },

      canChildPerformAction: (action: string) => {
        const { settings } = get()

        switch (action) {
          case 'createCategory':
            return settings.allowChildCategoryCreation
          case 'modifySafeZone':
            return settings.allowChildSafeZoneModification
          default:
            return true
        }
      },
    }),
    {
      name: 'parental-control-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist session for security
      partialize: (state) => ({
        settings: state.settings,
        pendingApprovals: state.pendingApprovals,
        childActivity: state.childActivity,
      }),
    },
  ),
)

// Add missing interface methods for backward compatibility
export const useParentalControlStoreWithHelpers = () => {
  const store = useParentalControlStore()
  return {
    ...store,
    getPendingApprovalsCount: () => store.pendingApprovals?.length || 0,
    approvalHistory: [], // Placeholder for approval history
  }
}
