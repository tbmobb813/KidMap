import { Platform, Alert } from 'react-native';

type NotificationOptions = {
  title: string;
  body: string;
  icon?: string;
  priority?: 'high' | 'normal';
};

// Check if we're running in Expo Go (which has notification limitations)
const isExpoGo = __DEV__ && Platform.OS !== 'web';

export const showNotification = async (options: NotificationOptions) => {
  const { title, body, icon = '/icon.png', priority = 'normal' } = options;
  
  if (Platform.OS === 'web') {
    // Web notification
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon });
      } else if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body, icon });
        }
      }
    }
  } else {
    if (isExpoGo) {
      // Expo Go fallback: Use Alert for important notifications
      if (priority === 'high') {
        Alert.alert(title, body, [{ text: 'OK' }]);
      } else {
        // For normal priority, just log (to avoid too many alerts)
        console.log(`📱 Notification: ${title} - ${body}`);
      }
    } else {
      // Production build: Use expo-notifications
      // Production build: notifications not supported in this codebase
      // Fallback to alert for critical notifications
      if (priority === 'high') {
        Alert.alert(title, body, [{ text: 'OK' }]);
      }
    }
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  } else {
    if (isExpoGo) {
      // Expo Go: Limited notification support
      console.log('⚠️ Running in Expo Go - notifications limited to alerts');
      console.log('💡 For full notification support, use a development build');
      return true; // We can show alerts
    } else {
      // Production build: Request proper permissions
  // Production build: notification permissions not supported in this codebase
  return true;
    }
  }
};

export const hasNotificationPermission = (): boolean => {
  if (Platform.OS === 'web') {
    return 'Notification' in window && Notification.permission === 'granted';
  } else {
    if (isExpoGo) {
      // Expo Go: We can show alerts
      return true;
    } else {
      // Production build: Check actual permissions
  // Production build: notification permissions not supported in this codebase
  return true;
    }
  }
};

// Helper function to show development build recommendation
export const showDevelopmentBuildRecommendation = () => {
  if (isExpoGo) {
    Alert.alert(
      '📱 Enhanced Features Available',
      'For the best experience with notifications and background features, consider using a development build instead of Expo Go.\n\nLearn more at: docs.expo.dev/develop/development-builds/',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Learn More', onPress: () => console.log('Open development build docs') }
      ]
    );
  }
};
