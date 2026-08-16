import { logger } from '../../logger.js';
import type { OutboundEvent, OutboundEventName } from '../../types.js';
import type { OutboundEventPublisher } from '../types.js';

export function createWebhookEventPublisher(
  inner: OutboundEventPublisher,
  webhookUrl: string,
): OutboundEventPublisher {
  return {
    publish(name: OutboundEventName, payload: Record<string, unknown>): OutboundEvent {
      const event = inner.publish(name, payload);
      if (!webhookUrl) {
        logger.warn('EVENT_ADAPTER=webhook but EVENT_WEBHOOK_URL is empty; event stored locally only', {
          name,
        });
        return event;
      }
      void fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: name,
          id: event.id,
          createdAt: event.createdAt,
          payload,
        }),
      }).catch((error) => {
        logger.warn('Outbound webhook delivery failed', {
          name,
          error: error instanceof Error ? error.message : String(error),
        });
      });
      return event;
    },
    list(limit) {
      return inner.list(limit);
    },
  };
}
