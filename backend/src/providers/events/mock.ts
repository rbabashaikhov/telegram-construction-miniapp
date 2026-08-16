import type { OutboundEvent, OutboundEventName } from '../../types.js';
import type { OutboundEventPublisher } from '../types.js';

export function createMockEventPublisher(): OutboundEventPublisher {
  const events: OutboundEvent[] = [];
  let nextId = 1;
  return {
    publish(name: OutboundEventName, payload: Record<string, unknown>) {
      const event: OutboundEvent = {
        id: nextId++,
        name,
        payload,
        createdAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
      };
      events.unshift(event);
      return event;
    },
    list(limit = 50) {
      return events.slice(0, limit);
    },
  };
}
