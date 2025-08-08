import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null, // immediate
  })
}

// Call this once in your app entry point to set up notification handling
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: Platform.OS !== 'web',
      shouldSetBadge: false,
    }),
  })
}
