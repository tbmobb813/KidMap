import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

export async function triggerDevicePing() {
  // Send a local notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Device Ping',
      body: 'Your parent is trying to locate your device!',
      sound: true,
    },
    trigger: null,
  });

  // Play a sound (simple beep)
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/ping.mp3'),
      { shouldPlay: true }
    );
    // Optionally unload after playing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    // Fallback: vibrate or ignore
  }
}
