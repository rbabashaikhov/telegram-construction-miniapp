import { config } from './config.js';
import { db } from './db/schema.js';
import { logger } from './logger.js';
import { createCrmProviders } from './providers/crm/stub.js';
import { createMockEventPublisher } from './providers/events/mock.js';
import { createWebhookEventPublisher } from './providers/events/webhook.js';
import { createLocalProviders } from './providers/local/sqlite.js';
import type { Providers } from './providers/types.js';

function composeProviders(): Providers {
  const data =
    config.dataMode === 'crm'
      ? (() => {
          logger.warn(
            'DATA_MODE=crm: using documented CRM provider stub. Partner API adapter is not implemented.',
          );
          return createCrmProviders();
        })()
      : (() => {
          logger.info('DATA_MODE=local: SQLite is the source of truth');
          return createLocalProviders(db);
        })();

  if (config.dataMode === 'crm') {
    return data;
  }

  if (config.eventAdapter === 'mock') {
    return { ...data, events: createMockEventPublisher() };
  }

  if (config.eventAdapter === 'webhook') {
    return {
      ...data,
      events: createWebhookEventPublisher(data.events, config.eventWebhookUrl),
    };
  }

  return data;
}

export const providers: Providers = composeProviders();
