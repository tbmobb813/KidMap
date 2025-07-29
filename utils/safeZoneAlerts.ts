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
    } catch (error) {
      console.error('Failed to initialize SafeZoneAlertManager:', error);
    }
  }

  async handleSafeZoneEvent(
    zoneId: string, 
    eventType: 'enter' | 'exit', 
    zone: SafeZone,
    location: { latitude: number; longitude: number }
  ): Promise<void> {
    const event: SafeZoneEvent = {
      id: `${zoneId}-${eventType}-${Date.now()}`,
      zoneId,
      zoneName: zone.name,
      eventType,
      timestamp: new Date(),
      location,
      childName: 'Child' // In a real app, this would come from user profile
    };

    // Add to history
    this.eventHistory.unshift(event);
    
    // Keep only last 100 events
    if (this.eventHistory.length > 100) {
      this.eventHistory = this.eventHistory.slice(0, 100);
    }

    // Save to storage
    await this.saveEventHistory();

    // Check if we should send alerts
    if (this.shouldSendAlert(zoneId, eventType)) {
      await this.sendAlerts(event);
      this.lastAlertTimes.set(`${zoneId}-${eventType}`, new Date());
    }

    // Update gamification
    this.updateGamification(event);
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
    this.alertSettings = { ...this.alertSettings, ...newSettings };
    try {
      await AsyncStorage.setItem('safe-zone-alert-settings', JSON.stringify(this.alertSettings));
    } catch (error) {
      console.error('Failed to save alert settings:', error);
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
