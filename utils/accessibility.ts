import { AccessibilityInfo, Platform } from 'react-native';

/** Announcement politeness levels */
export type Politeness = 'polite' | 'assertive';

export interface AnnouncementOptions {
  politeness?: Politeness; // default 'polite'
  /** Suppress duplicate messages within debounce window */
  dedupe?: boolean;
}

// Web live region singleton refs
let liveRegionPolite: HTMLElement | null = null;
let liveRegionAssertive: HTMLElement | null = null;
let lastMessage: string | null = null;
let lastTimestamp = 0;
const DEDUPE_WINDOW_MS = 600; // prevent rapid duplicate spam

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

/**
 * Unified announce API.
 * Native: delegates to AccessibilityInfo.announceForAccessibility.
 * Web: writes to hidden live region (polite/assertive) or logs as fallback.
 */
export async function announce(message: string, options: AnnouncementOptions = {}) {
  if (!message) return;
  const { politeness = 'polite', dedupe = true } = options;

  const now = Date.now();
  if (dedupe && message === lastMessage && now - lastTimestamp < DEDUPE_WINDOW_MS) {
    return; // suppress duplicate
  }
  lastMessage = message;
  lastTimestamp = now;

  try {
    if (Platform.OS === 'web') {
      const region = ensureLiveRegion(politeness) || null;
      if (region) {
        // Clear then set to force announcement even if string repeats after window
        region.textContent = '';
        setTimeout(() => { region.textContent = message; }, 10);
      } else {
        // eslint-disable-next-line no-console
        console.log('A11Y_ANNOUNCE:', message);
      }
    } else if ((AccessibilityInfo as any)?.announceForAccessibility) {
      await AccessibilityInfo.announceForAccessibility(message);
    }
  } catch {
    // Swallow to avoid breaking UI flow
  }
}

/**
 * @deprecated Use announce(message, { politeness }) instead. Will be removed after S3-T1.
 */
export const announceForAccessibility = (message: string) => {
  if (!message) return;
  announce(message, { politeness: 'assertive' });
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn('[deprecation] announceForAccessibility is deprecated; use announce().');
  }
};

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
