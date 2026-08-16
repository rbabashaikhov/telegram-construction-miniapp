import { createContext, useContext } from 'react';
import type { AppConfig } from '../types';

export const DEFAULT_APP_CONFIG: AppConfig = {
  businessName: 'Nordhaus',
  businessType: 'homebuilder',
  businessVertical: 'construction',
  appTitle: 'Nordhaus',
  appDescription: 'Постройте дом, который подходит именно вам.',
  timezone: 'Europe/Moscow',
  demoMode: true,
  adminProtected: false,
  currency: 'RUB',
  currencySymbol: '₽',
  branding: { accent: '#3D5A4C', logoUrl: null },
  features: { demoTour: true, demoAdminPreview: true },
};

export const BusinessContext = createContext<AppConfig>(DEFAULT_APP_CONFIG);

export function useBusiness(): AppConfig {
  return useContext(BusinessContext);
}
