/**
 * Accessibility utilities for screen reader announcements and focus management.
 * 
 * S3-T1 Complete: Legacy announceForAccessibility function removed.
 * Use announce(message, { politeness }) instead.
 */
import { AccessibilityInfo, Platform } from 'react-native';

/** Announcement politeness levels */
export type Politeness = 'polite' | 'assertive';

/** Cancellation handle for long-running announcements */
export interface AnnouncementHandle {
  cancel: () => void;
}

export interface AnnouncementOptions {
  politeness?: Politeness; // default 'polite'
  /** Suppress duplicate messages within debounce window */
  dedupe?: boolean;
  /** For queue management - set to true for voice navigation sequences */
  queueable?: boolean;
}

// Web live region singleton refs
let liveRegionPolite: HTMLElement | null = null;
let liveRegionAssertive: HTMLElement | null = null;
let lastMessage: string | null = null;
let lastTimestamp = 0;
const DEDUPE_WINDOW_MS = 600; // prevent rapid duplicate spam

// Announcement queue for voice navigation
interface QueuedAnnouncement {
  id: string;
  message: string;
  options: AnnouncementOptions;
  cancelled: boolean;
}
let announcementQueue: QueuedAnnouncement[] = [];
let queueProcessing = false;
let currentAnnouncementId: string | null = null;

function ensureLiveRegion(politeness: Politeness): HTMLElement | null {
  if (Platform.OS !== 'web') return null;
  const id = politeness === 'assertive' ? '__a11y_live_assertive' : '__a11y_live_polite';
  let el = document.getElementById(id) as HTMLElement | null;
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.setAttribute('aria-live', politeness);
    el.setAttribute('aria-atomic', 'true');
    el.style.position = 'absolute';
    el.style.width = '1px';
    el.style.height = '1px';
    el.style.margin = '-1px';
    el.style.padding = '0';
    el.style.overflow = 'hidden';
    el.style.clip = 'rect(0 0 0 0)';
    el.style.whiteSpace = 'nowrap';
    document.body.appendChild(el);
  }
  if (politeness === 'assertive') liveRegionAssertive = el; else liveRegionPolite = el;
  return el;
}

async function processAnnouncementQueue(): Promise<void> {
  if (queueProcessing || announcementQueue.length === 0) return;

  queueProcessing = true;

  while (announcementQueue.length > 0 && queueProcessing) {
    const item = announcementQueue.shift()!;
    if (item.cancelled || !queueProcessing) continue;

    currentAnnouncementId = item.id;

    try {
      const { politeness = 'polite' } = item.options;

      if (Platform.OS === 'web') {
        const region = ensureLiveRegion(politeness);
        if (region && !item.cancelled && queueProcessing) {
          region.textContent = '';
          await new Promise(resolve => setTimeout(() => {
            if (!item.cancelled && queueProcessing) {
              region.textContent = item.message;
            }
            resolve(void 0);
          }, 10));
          // Allow time for screen reader to process
          if (!item.cancelled && queueProcessing) {
            await new Promise(resolve => setTimeout(resolve, Math.max(1000, item.message.length * 50)));
          }
        }
      } else if ((AccessibilityInfo as any)?.announceForAccessibility) {
        if (!item.cancelled && queueProcessing) {
          await AccessibilityInfo.announceForAccessibility(item.message);
        }
      }
    } catch {
      // Continue processing queue even if one item fails
    }

    if (currentAnnouncementId === item.id) {
      currentAnnouncementId = null;
    }
  }

  queueProcessing = false;
}

/**
 * Cancel all pending announcements in the queue
 */
export function cancelAllAnnouncements(): void {
  announcementQueue.forEach(item => { item.cancelled = true; });
  announcementQueue = [];
  currentAnnouncementId = null;
  queueProcessing = false; // Reset processing flag to stop current queue
}

/**
 * Unified announce API.
 * Native: delegates to AccessibilityInfo.announceForAccessibility.
 * Web: writes to hidden live region (polite/assertive) or logs as fallback.
 * Returns a handle for cancellation of queueable announcements.
 */
export async function announce(message: string, options: AnnouncementOptions = {}): Promise<AnnouncementHandle | void> {
  if (!message) return;
  const { politeness = 'polite', dedupe = true, queueable = false } = options;

  const now = Date.now();
  if (dedupe && message === lastMessage && now - lastTimestamp < DEDUPE_WINDOW_MS) {
    return; // suppress duplicate
  }
  lastMessage = message;
  lastTimestamp = now;

  // For queueable announcements (voice navigation), add to queue
  if (queueable) {
    const id = `announce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const queuedItem: QueuedAnnouncement = {
      id,
      message,
      options,
      cancelled: false
    };

    announcementQueue.push(queuedItem);
    processAnnouncementQueue().catch(() => { }); // Fire and forget

    return {
      cancel: () => {
        queuedItem.cancelled = true;
        if (currentAnnouncementId === id) {
          currentAnnouncementId = null;
        }
      }
    };
  }

  // For immediate announcements (existing behavior)
  try {
    if (Platform.OS === 'web') {
      const region = ensureLiveRegion(politeness) || null;
      if (region) {
        // Clear then set to force announcement even if string repeats after window
        region.textContent = '';
        setTimeout(() => { region.textContent = message; }, 10);
      } else {
        console.log('A11Y_ANNOUNCE:', message);
      }
    } else if ((AccessibilityInfo as any)?.announceForAccessibility) {
      await AccessibilityInfo.announceForAccessibility(message);
    }
  } catch {
    // Swallow to avoid breaking UI flow
  }
}

// Legacy announceForAccessibility has been removed in S3-T1
// Use announce(message, { politeness: 'assertive' }) instead

export const isScreenReaderEnabled = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false; // Web screen reader detection is complex
  }

  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch {
    return false;
  }
};

export const getAccessibilityLabel = (
  text: string,
  context?: string
): string => {
  if (context) {
    return `${text}, ${context}`;
  }
  return text;
};

export const getAccessibilityHint = (action: string): string => {
  return `Double tap to ${action}`;
};
