// utils/safeZoneAlerts.ts - Safe Zone Alert System for KidMap
import { SafeZone } from '@/components/SafeZoneManager';
import { speechEngine } from '@/utils/speechEngine';
import { useGamificationStore } from '@/stores/gamificationStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SafeZoneEvent {
  id: string;
  zoneId: string;
  zoneName: string;
  eventType: 'enter' | 'exit';
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
  };
  childName?: string;
}

export interface AlertSettings {
  enableVoiceAlerts: boolean;
  enableVisualAlerts: boolean;
  enableParentNotifications: boolean;
  alertCooldownMinutes: number;
  quietHours: {
    start: string; // "22:00"
    end: string;   // "07:00"
    enabled: boolean;
  };
}

class SafeZoneAlertManager {
  private static instance: SafeZoneAlertManager;
  private eventHistory: SafeZoneEvent[] = [];
  private alertSettings: AlertSettings = {
    enableVoiceAlerts: true,
    enableVisualAlerts: true,
    enableParentNotifications: true,
    alertCooldownMinutes: 5,
    quietHours: {
      start: "22:00",
      end: "07:00",
      enabled: true
    }
  };
  private lastAlertTimes: Map<string, Date> = new Map();

  static getInstance(): SafeZoneAlertManager {
    if (!SafeZoneAlertManager.instance) {
      SafeZoneAlertManager.instance = new SafeZoneAlertManager();
    }
    return SafeZoneAlertManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Load settings from storage
      const savedSettings = await AsyncStorage.getItem('safe-zone-alert-settings');
      if (savedSettings) {
        this.alertSettings = { ...this.alertSettings, ...JSON.parse(savedSettings) };
      }

      // Load event history
      const savedHistory = await AsyncStorage.getItem('safe-zone-event-history');
      if (savedHistory) {
        this.eventHistory = JSON.parse(savedHistory).map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }));
      }

      console.log('SafeZoneAlertManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SafeZoneAlertManager:', error);
      // Don't throw - allow the app to continue with default settings
      // Could send error report to parent/guardian here
      this.handleCriticalError('Initialization failed', error as Error);
    }
  }

  private handleCriticalError(context: string, error: Error): void {
    console.error(`SafeZoneAlerts Critical Error [${context}]:`, error);
    
    // In a production app, this could:
    // 1. Send error report to parents/guardians
    // 2. Log to crash reporting service
    // 3. Display user-friendly error message
    // 4. Attempt recovery actions
    
    try {
      // Could integrate with notification system
      // sendParentNotification(`Safety system error: ${context}`);
    } catch (notificationError) {
      console.error('Failed to send error notification:', notificationError);
    }
  }

  private async safeAsyncStorageOperation<T>(
    operation: () => Promise<T>,
    fallback: T,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`AsyncStorage error in ${context}:`, error);
      this.handleCriticalError(`Storage operation failed: ${context}`, error as Error);
      return fallback;
    }
  }

  async handleSafeZoneEvent(
    zoneId: string, 
    eventType: 'enter' | 'exit', 
    zone: SafeZone,
    location: { latitude: number; longitude: number }
  ): Promise<void> {
    try {
      // Validate inputs
      if (!zoneId || !eventType || !zone || !location) {
        throw new Error('Invalid parameters provided to handleSafeZoneEvent');
      }

      if (!['enter', 'exit'].includes(eventType)) {
        throw new Error(`Invalid event type: ${eventType}`);
      }

      if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        throw new Error('Invalid location coordinates');
      }

      const event: SafeZoneEvent = {
        id: `${zoneId}-${eventType}-${Date.now()}`,
        zoneId,
        zoneName: zone.name || 'Unknown Zone',
        eventType,
        timestamp: new Date(),
        location,
        childName: 'Child' // In a real app, this would come from user profile
      };

      // Add to history with error handling
      try {
        this.eventHistory.unshift(event);
        
        // Keep only last 100 events
        if (this.eventHistory.length > 100) {
          this.eventHistory = this.eventHistory.slice(0, 100);
        }

        // Save to storage with retry logic
        await this.saveEventHistoryWithRetry();
      } catch (storageError) {
        console.error('Failed to save event history:', storageError);
        // Continue processing even if storage fails
      }

      // Check if we should send alerts
      if (this.shouldSendAlert(zoneId, eventType)) {
        try {
          await this.sendAlerts(event);
          this.lastAlertTimes.set(`${zoneId}-${eventType}`, new Date());
        } catch (alertError) {
          console.error('Failed to send alerts:', alertError);
          this.handleCriticalError('Alert sending failed', alertError as Error);
        }
      }

      // Update gamification with error handling
      try {
        this.updateGamification(event);
      } catch (gamificationError) {
        console.error('Failed to update gamification:', gamificationError);
        // Non-critical error, continue processing
      }

    } catch (error) {
      console.error('Critical error in handleSafeZoneEvent:', error);
      this.handleCriticalError('Safe zone event processing failed', error as Error);
      throw error; // Re-throw to let caller handle
    }
  }

  private async saveEventHistoryWithRetry(maxRetries: number = 3): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await AsyncStorage.setItem('safe-zone-event-history', JSON.stringify(this.eventHistory));
        return; // Success
      } catch (error) {
        lastError = error as Error;
        console.warn(`Event history save attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }
    
    // All retries failed
    throw new Error(`Failed to save event history after ${maxRetries} attempts: ${lastError?.message}`);
  }

  private shouldSendAlert(zoneId: string, eventType: 'enter' | 'exit'): boolean {
    // Check quiet hours
    if (this.isQuietHours()) {
      return false;
    }

    // Check cooldown
    const lastAlert = this.lastAlertTimes.get(`${zoneId}-${eventType}`);
    if (lastAlert) {
      const minutesSinceLastAlert = (Date.now() - lastAlert.getTime()) / (60 * 1000);
      if (minutesSinceLastAlert < this.alertSettings.alertCooldownMinutes) {
        return false;
      }
    }

    return true;
  }

  private isQuietHours(): boolean {
    if (!this.alertSettings.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = this.parseTime(this.alertSettings.quietHours.start);
    const endTime = this.parseTime(this.alertSettings.quietHours.end);

    if (startTime > endTime) {
      // Overnight range (e.g., 22:00 to 07:00)
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      // Same day range
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 100 + minutes;
  }

  private async sendAlerts(event: SafeZoneEvent): Promise<void> {
    const { eventType, zoneName } = event;
    
    // Voice alerts
    if (this.alertSettings.enableVoiceAlerts) {
      const voiceMessage = this.getVoiceMessage(event);
      await speechEngine.speak(voiceMessage);
    }

    // Visual alerts would be handled by the UI components
    // Parent notifications would be sent via push notifications in a real app
    console.log(`Safe Zone Alert: ${eventType === 'enter' ? 'Entered' : 'Left'} ${zoneName}`);
  }

  private getVoiceMessage(event: SafeZoneEvent): string {
    const { eventType, zoneName } = event;
    
    if (eventType === 'enter') {
      const enterMessages = [
        `Great! You've entered the ${zoneName} safe zone. You're in a safe area!`,
        `Welcome to ${zoneName}! This is one of your safe zones.`,
        `Nice! You're now in the ${zoneName} safe area. Keep up the good work!`
      ];
      return enterMessages[Math.floor(Math.random() * enterMessages.length)];
    } else {
      const exitMessages = [
        `You've left the ${zoneName} safe zone. Stay safe on your journey!`,
        `Leaving ${zoneName} now. Remember to stay aware of your surroundings!`,
        `You're now outside the ${zoneName} safe area. Be extra careful!`
      ];
      return exitMessages[Math.floor(Math.random() * exitMessages.length)];
    }
  }

  private updateGamification(event: SafeZoneEvent): void {
    try {
      const gamificationStore = useGamificationStore.getState();
      
      // Award points for safe zone interactions
      if (event.eventType === 'enter') {
        gamificationStore.addPoints(10);
      }
      
      // Update user stats if available
      if (gamificationStore.updateStats) {
        gamificationStore.updateStats({
          safeTrips: gamificationStore.userStats.safeTrips + (event.eventType === 'enter' ? 1 : 0)
        });
      }
    } catch (error) {
      console.error('Failed to update gamification:', error);
    }
  }

  async updateSettings(newSettings: Partial<AlertSettings>): Promise<void> {
    try {
      // Validate settings
      if (newSettings.alertCooldownMinutes !== undefined) {
        if (typeof newSettings.alertCooldownMinutes !== 'number' || 
            newSettings.alertCooldownMinutes < 0 || 
            newSettings.alertCooldownMinutes > 60) {
          throw new Error('Alert cooldown must be between 0 and 60 minutes');
        }
      }

      if (newSettings.quietHours?.start && newSettings.quietHours?.end) {
        // Validate time format
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(newSettings.quietHours.start) || 
            !timeRegex.test(newSettings.quietHours.end)) {
          throw new Error('Invalid time format for quiet hours');
        }
      }

      this.alertSettings = { ...this.alertSettings, ...newSettings };
      
      await this.safeAsyncStorageOperation(
        () => AsyncStorage.setItem('safe-zone-alert-settings', JSON.stringify(this.alertSettings)),
        undefined,
        'updateSettings'
      );

      console.log('Alert settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      this.handleCriticalError('Settings update failed', error as Error);
      throw error;
    }
  }

  getSettings(): AlertSettings {
    return { ...this.alertSettings };
  }

  getEventHistory(): SafeZoneEvent[] {
    return [...this.eventHistory];
  }

  getRecentEvents(hours: number = 24): SafeZoneEvent[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.eventHistory.filter(event => event.timestamp > cutoff);
  }

  getTodaysEvents(): SafeZoneEvent[] {
    const today = new Date().toDateString();
    return this.eventHistory.filter(event => event.timestamp.toDateString() === today);
  }

  async clearEventHistory(): Promise<void> {
    this.eventHistory = [];
    await this.saveEventHistory();
  }

  private async saveEventHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem('safe-zone-event-history', JSON.stringify(this.eventHistory));
    } catch (error) {
      console.error('Failed to save event history:', error);
    }
  }

  // Get statistics for parent dashboard
  getStatistics() {
    const today = this.getTodaysEvents();
    const thisWeek = this.getRecentEvents(24 * 7);
    
    return {
      todayEvents: today.length,
      todayEnters: today.filter(e => e.eventType === 'enter').length,
      todayExits: today.filter(e => e.eventType === 'exit').length,
      weekEvents: thisWeek.length,
      mostVisitedZone: this.getMostVisitedZone(thisWeek),
      safetyScore: this.calculateSafetyScore(thisWeek)
    };
  }

  private getMostVisitedZone(events: SafeZoneEvent[]): string {
    const zoneCounts = events
      .filter(e => e.eventType === 'enter')
      .reduce((counts, event) => {
        counts[event.zoneName] = (counts[event.zoneName] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

    const mostVisited = Object.entries(zoneCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    return mostVisited ? mostVisited[0] : 'None';
  }

  private calculateSafetyScore(events: SafeZoneEvent[]): number {
    if (events.length === 0) return 100;
    
    const enters = events.filter(e => e.eventType === 'enter').length;
    const exits = events.filter(e => e.eventType === 'exit').length;
    
    // Higher score for more safe zone visits
    const baseScore = Math.min(100, 70 + (enters * 3));
    
    // Bonus for balanced enters/exits (completing journeys)
    const balanceBonus = Math.abs(enters - exits) <= 1 ? 10 : 0;
    
    return Math.min(100, baseScore + balanceBonus);
  }
}

// Export singleton instance
export const safeZoneAlertManager = SafeZoneAlertManager.getInstance();
