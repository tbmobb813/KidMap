// utils/devicePing.ts - Device ping and locate functionality
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { Vibration, Alert } from 'react-native';
import { useParentalControlStore } from '../stores/parentalControlStore';
import { speechEngine } from './speechEngine';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PingRequest {
  id: string;
  type: 'ring' | 'locate' | 'check-in' | 'emergency';
  parentId: string;
  timestamp: number;
  message?: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  expiresAt: number; // Auto-expire after certain time
  acknowledged?: boolean;
  acknowledgedAt?: number;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
  batteryLevel?: number;
  networkStatus: 'connected' | 'disconnected' | 'limited';
}

class DevicePingManager {
  private sound: Audio.Sound | null = null;
  private isRinging = false;
  private ringTimeout: NodeJS.Timeout | null = null;
  private pendingRequests: Map<string, PingRequest> = new Map();
  
  async initialize() {
    // Request permissions
    await this.requestPermissions();
    
    // Set up notification listeners
    this.setupNotificationListeners();
    
    // Load ring sound
    await this.loadRingSound();
  }

  private async requestPermissions() {
    // Location permission
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== 'granted') {
      console.warn('Location permission not granted for ping functionality');
    }

    // Background location for emergency pings
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      console.warn('Background location permission not granted');
    }

    // Notification permissions
    const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
    if (notificationStatus !== 'granted') {
      console.warn('Notification permission not granted for ping functionality');
    }

    // Audio permissions for ring sound
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.warn('Audio permission setup failed:', error);
    }
  }

  private setupNotificationListeners() {
    // Listen for foreground notifications
    Notifications.addNotificationReceivedListener(async (notification) => {
      const data = notification.request.content.data as any;
      if (data?.type === 'ping') {
        await this.handleIncomingPing(data);
      }
    });

    // Listen for notification interactions
    Notifications.addNotificationResponseReceivedListener(async (response) => {
      const data = response.notification.request.content.data as any;
      if (data?.type === 'ping') {
        await this.handlePingResponse(data, response.actionIdentifier);
      }
    });
  }

  private async loadRingSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        // In a real app, you'd load a custom ring sound file
        require('../assets/sounds/ring.mp3'), // This would need to be added
        { shouldPlay: false, isLooping: true }
      );
      this.sound = sound;
    } catch (error) {
      console.warn('Could not load ring sound:', error);
      // Fallback to system vibration only
    }
  }

  async sendPingToChild(type: PingRequest['type'], message?: string, urgency: PingRequest['urgency'] = 'medium'): Promise<string> {
    const pingId = Date.now().toString();
    const expiresAt = Date.now() + (urgency === 'emergency' ? 30 * 60 * 1000 : 15 * 60 * 1000); // 30min for emergency, 15min for others

    const pingRequest: PingRequest = {
      id: pingId,
      type,
      parentId: 'parent_user_id', // Would come from auth context
      timestamp: Date.now(),
      message,
      urgency,
      expiresAt,
    };

    this.pendingRequests.set(pingId, pingRequest);

    // Send push notification (in a real app, this would go through a server)
    await this.sendLocalNotification(pingRequest);

    // For immediate local handling (same device testing)
    await this.handleIncomingPing(pingRequest);

    return pingId;
  }

  private async sendLocalNotification(pingRequest: PingRequest) {
    const title = this.getPingTitle(pingRequest);
    const body = pingRequest.message || this.getPingMessage(pingRequest);

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { ...pingRequest, type: 'ping' },
        priority: pingRequest.urgency === 'emergency' ? 
          Notifications.AndroidNotificationPriority.MAX : 
          Notifications.AndroidNotificationPriority.HIGH,
        sound: pingRequest.type === 'ring' ? 'default' : undefined,
      },
      trigger: null, // Show immediately
    });
  }

  private async handleIncomingPing(pingRequest: PingRequest) {
    // Check if request is expired
    if (Date.now() > pingRequest.expiresAt) {
      console.log('Ping request expired:', pingRequest.id);
      return;
    }

    switch (pingRequest.type) {
      case 'ring':
        await this.startRing(pingRequest);
        break;
      case 'locate':
        await this.sendLocationUpdate(pingRequest);
        break;
      case 'check-in':
        await this.promptCheckIn(pingRequest);
        break;
      case 'emergency':
        await this.handleEmergencyPing(pingRequest);
        break;
    }
  }

  private async startRing(pingRequest: PingRequest) {
    if (this.isRinging) {
      await this.stopRing();
    }

    this.isRinging = true;

    // Voice announcement
    await speechEngine.speak("Your parent is trying to reach you! Tap the notification to respond.");

    // Start vibration pattern
    const pattern = pingRequest.urgency === 'emergency' ? 
      [0, 1000, 500, 1000, 500, 1000] : // Emergency: Long vibrations
      [0, 300, 200, 300, 200]; // Normal: Short vibrations

    Vibration.vibrate(pattern, true);

    // Play sound if available
    if (this.sound) {
      try {
        await this.sound.playAsync();
      } catch (error) {
        console.warn('Could not play ring sound:', error);
      }
    }

    // Auto-stop after timeout
    const timeout = pingRequest.urgency === 'emergency' ? 60000 : 30000; // 1min emergency, 30sec normal
    this.ringTimeout = setTimeout(() => {
      this.stopRing();
    }, timeout);

    // Show interactive alert
    Alert.alert(
      'Parent Ping',
      pingRequest.message || 'Your parent is trying to reach you',
      [
        { text: 'Stop Ring', onPress: () => this.stopRing() },
        { text: 'Respond', onPress: () => this.respondToPing(pingRequest.id) }
      ],
      { cancelable: false }
    );
  }

  private async stopRing() {
    if (!this.isRinging) return;

    this.isRinging = false;

    // Stop vibration
    Vibration.cancel();

    // Stop sound
    if (this.sound) {
      try {
        await this.sound.stopAsync();
      } catch (error) {
        console.warn('Error stopping ring sound:', error);
      }
    }

    // Clear timeout
    if (this.ringTimeout) {
      clearTimeout(this.ringTimeout);
      this.ringTimeout = null;
    }
  }

  private async sendLocationUpdate(pingRequest: PingRequest) {
    try {
      // Get current location with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      // Get address if possible
      let address: string | undefined;
      try {
        const [addressResult] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (addressResult) {
          address = [
            addressResult.streetNumber,
            addressResult.street,
            addressResult.city,
            addressResult.region
          ].filter(Boolean).join(', ');
        }
      } catch (error) {
        console.warn('Could not get address:', error);
      }

      // Get battery level (would need expo-battery)
      // const batteryLevel = await Battery.getBatteryLevelAsync();

      const locationUpdate: LocationUpdate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: location.timestamp,
        address,
        // batteryLevel: batteryLevel * 100,
        networkStatus: 'connected', // Would check actual network status
      };

      // In a real app, send to parent via server
      console.log('Location update sent:', locationUpdate);

      // Acknowledge the ping
      await this.acknowledgePing(pingRequest.id);

      // Notify child
      await speechEngine.speak("Your location has been shared with your parent.");

    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert(
        'Location Error', 
        'Could not get your current location. Please make sure location services are enabled.'
      );
    }
  }

  private async promptCheckIn(pingRequest: PingRequest) {
    Alert.alert(
      'Check-in Request',
      pingRequest.message || 'Your parent has requested a check-in. How are you doing?',
      [
        { text: "I'm OK", onPress: () => this.sendCheckInResponse(pingRequest.id, "I'm OK") },
        { text: "I'm Safe", onPress: () => this.sendCheckInResponse(pingRequest.id, "I'm safe and doing well") },
        { text: "Need Help", onPress: () => this.sendCheckInResponse(pingRequest.id, "I need help", true) },
        { text: 'Custom Message', onPress: () => this.promptCustomCheckIn(pingRequest.id) }
      ]
    );
  }

  private async promptCustomCheckIn(pingId: string) {
    // In a real app, this would show a text input modal
    Alert.prompt(
      'Check-in Message',
      'Send a message to your parent:',
      (message) => {
        if (message) {
          this.sendCheckInResponse(pingId, message);
        }
      },
      'plain-text',
      "I'm doing well!"
    );
  }

  private async sendCheckInResponse(pingId: string, message: string, needsHelp = false) {
    const response = {
      pingId,
      message,
      timestamp: Date.now(),
      needsHelp,
      location: await this.getCurrentLocationSafe(),
    };

    // In a real app, send to parent via server
    console.log('Check-in response sent:', response);

    await this.acknowledgePing(pingId);

    // Voice confirmation
    const confirmationMessage = needsHelp ? 
      "Help request sent to your parent." :
      "Check-in message sent to your parent.";
    
    await speechEngine.speak(confirmationMessage);
  }

  private async handleEmergencyPing(pingRequest: PingRequest) {
    // Emergency pings get highest priority
    Alert.alert(
      '🚨 EMERGENCY PING',
      pingRequest.message || 'Your parent has sent an emergency ping. Please respond immediately.',
      [
        { text: "I'm Safe", onPress: () => this.sendEmergencyResponse(pingRequest.id, 'safe') },
        { text: 'I Need Help', onPress: () => this.sendEmergencyResponse(pingRequest.id, 'help') },
        { text: 'Call Parent', onPress: () => this.initiateEmergencyCall(pingRequest.parentId) }
      ],
      { cancelable: false }
    );

    // Immediate location sharing for emergency
    await this.sendLocationUpdate(pingRequest);

    // Emergency voice alert
    await speechEngine.speak("EMERGENCY: Your parent needs to know you are safe. Please respond right away.");
  }

  private async sendEmergencyResponse(pingId: string, status: 'safe' | 'help') {
    const response = {
      pingId,
      status,
      timestamp: Date.now(),
      location: await this.getCurrentLocationSafe(),
      message: status === 'safe' ? "I'm safe and OK" : "I need help right now",
    };

    // In a real app, send immediately to parent and emergency services if needed
    console.log('Emergency response sent:', response);

    await this.acknowledgePing(pingId);

    if (status === 'help') {
      // In a real emergency, this might contact emergency services
      Alert.alert('Help Request Sent', 'Your parent and emergency contacts have been notified.');
    }
  }

  private async initiateEmergencyCall(parentId: string) {
    // In a real app, this would initiate a call to the parent
    Alert.alert('Emergency Call', 'Calling your parent now...');
  }

  private async getCurrentLocationSafe(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.warn('Could not get location for response:', error);
      return null;
    }
  }

  private async acknowledgePing(pingId: string) {
    const ping = this.pendingRequests.get(pingId);
    if (ping) {
      ping.acknowledged = true;
      ping.acknowledgedAt = Date.now();
      this.pendingRequests.set(pingId, ping);
    }
  }

  private async respondToPing(pingId: string) {
    const ping = this.pendingRequests.get(pingId);
    if (ping) {
      await this.stopRing();
      
      switch (ping.type) {
        case 'ring':
          Alert.alert('Response Sent', 'Your parent has been notified that you received their ping.');
          break;
        case 'locate':
          await this.sendLocationUpdate(ping);
          break;
        case 'check-in':
          await this.promptCheckIn(ping);
          break;
        case 'emergency':
          await this.handleEmergencyPing(ping);
          break;
      }
    }
  }

  private async handlePingResponse(pingData: any, actionIdentifier: string) {
    if (actionIdentifier === 'RESPOND') {
      await this.respondToPing(pingData.id);
    } else if (actionIdentifier === 'DISMISS') {
      await this.stopRing();
    }
  }

  private getPingTitle(pingRequest: PingRequest): string {
    switch (pingRequest.type) {
      case 'ring':
        return 'Parent Ping 📞';
      case 'locate':
        return 'Location Request 📍';
      case 'check-in':
        return 'Check-in Request ✅';
      case 'emergency':
        return '🚨 EMERGENCY PING 🚨';
      default:
        return 'Parent Notification';
    }
  }

  private getPingMessage(pingRequest: PingRequest): string {
    switch (pingRequest.type) {
      case 'ring':
        return 'Your parent is trying to reach you. Tap to respond.';
      case 'locate':
        return 'Your parent would like to know your current location.';
      case 'check-in':
        return 'Your parent has requested a check-in. Let them know how you\'re doing.';
      case 'emergency':
        return 'URGENT: Your parent needs to know you are safe immediately.';
      default:
        return 'Your parent has sent you a notification.';
    }
  }

  // Public methods for parent interface
  async ringChild(message?: string): Promise<string> {
    return this.sendPingToChild('ring', message, 'medium');
  }

  async requestLocation(message?: string): Promise<string> {
    return this.sendPingToChild('locate', message, 'medium');
  }

  async requestCheckIn(message?: string): Promise<string> {
    return this.sendPingToChild('check-in', message, 'low');
  }

  async sendEmergencyPing(message?: string): Promise<string> {
    return this.sendPingToChild('emergency', message, 'emergency');
  }

  getPendingRequests(): PingRequest[] {
    return Array.from(this.pendingRequests.values())
      .filter(ping => !ping.acknowledged && Date.now() < ping.expiresAt)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  getPingHistory(limit = 20): PingRequest[] {
    return Array.from(this.pendingRequests.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  cleanup() {
    this.stopRing();
    if (this.sound) {
      this.sound.unloadAsync();
    }
    this.pendingRequests.clear();
  }
}

// Singleton instance
export const devicePingManager = new DevicePingManager();
