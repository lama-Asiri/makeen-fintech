/**
 * Event tracking utility for analytics instrumentation
 * Currently logs to console, ready for real analytics integration later
 */

type EventPayload = Record<string, any>;

export function trackEvent(name: string, payload?: EventPayload): void {
  console.log('[event]', name, payload || {});
}
