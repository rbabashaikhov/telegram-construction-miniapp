function boolEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}

const nodeEnv = process.env.NODE_ENV || 'development';
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || '';
const allowDemoMode =
  process.env.ALLOW_DEMO_MODE === 'true' ||
  nodeEnv !== 'production' ||
  !telegramBotToken;

export type DataModeName = 'local' | 'crm';
export type EventAdapterName = 'local' | 'webhook' | 'mock';

function dataModeName(value: string | undefined): DataModeName {
  if (value === 'crm' || value === 'local') return value;
  return 'local';
}

function eventAdapterName(value: string | undefined): EventAdapterName {
  if (value === 'webhook' || value === 'mock' || value === 'local') return value;
  return 'local';
}

export const config = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: Number(process.env.API_PORT || process.env.PORT || 3000),
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  databasePath: process.env.DATABASE_PATH || '',
  publicDir: process.env.PUBLIC_DIR || '',
  telegramBotToken,
  allowDemoMode,
  timezone: process.env.TZ || 'Europe/Moscow',
  dataMode: dataModeName(process.env.DATA_MODE),
  crmAdapter: process.env.CRM_ADAPTER || 'local',
  eventAdapter: eventAdapterName(process.env.EVENT_ADAPTER),
  eventWebhookUrl: (process.env.EVENT_WEBHOOK_URL || '').trim(),
  business: {
    name: process.env.BUSINESS_NAME || 'Nordhaus',
    vertical: process.env.BUSINESS_VERTICAL || 'construction',
    type: process.env.BUSINESS_TYPE || 'homebuilder',
    title: process.env.APP_TITLE || 'Nordhaus',
    description:
      process.env.APP_DESCRIPTION || 'Постройте дом, который подходит именно вам.',
    currency: process.env.CURRENCY || 'RUB',
    currencySymbol: process.env.CURRENCY_SYMBOL || '₽',
    brandAccent: process.env.BRAND_ACCENT || '#3D5A4C',
    logoUrl: process.env.BRAND_LOGO_URL || '',
  },
  features: {
    demoTour: boolEnv(process.env.FEATURE_DEMO_TOUR, true),
    demoAdminPreview: boolEnv(process.env.FEATURE_DEMO_ADMIN_PREVIEW, true),
  },
  admin: {
    token: (process.env.ADMIN_TOKEN || '').trim(),
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    max: Number(process.env.RATE_LIMIT_MAX || 20),
  },
};

export function publicAppConfig() {
  return {
    businessName: config.business.name,
    businessType: config.business.type,
    businessVertical: config.business.vertical,
    appTitle: config.business.title,
    appDescription: config.business.description,
    timezone: config.timezone,
    demoMode: config.allowDemoMode,
    adminProtected: config.isProduction || Boolean(config.admin.token),
    currency: config.business.currency,
    currencySymbol: config.business.currencySymbol,
    branding: {
      accent: config.business.brandAccent,
      logoUrl: config.business.logoUrl || null,
    },
    features: {
      demoTour: config.features.demoTour,
      demoAdminPreview: config.features.demoAdminPreview,
    },
  };
}

export function isDemoAdminPreviewEnabled(
  cfg: {
    allowDemoMode: boolean;
    features: { demoAdminPreview: boolean };
  } = config,
): boolean {
  return cfg.allowDemoMode && cfg.features.demoAdminPreview;
}
