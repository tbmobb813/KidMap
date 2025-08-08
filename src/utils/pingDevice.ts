import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import useLocation from '@/hooks/useLocation'

export async function pingDevice() {
  // Send a notification with sound to make the device ring
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Device Ping',
      body: 'This is a ping from the parent.',
      sound: 'default',
    },
    trigger: null, // Immediate
  })
}

export async function sendLocationUpdate() {
  const { location } = useLocation()
  if (!location) {
    console.error('Location not available')
    return
  }

  // Simulate sending location to parent (e.g., via SMS or backend API)
  console.log(`Sending location: ${location.latitude}, ${location.longitude}`)
}
