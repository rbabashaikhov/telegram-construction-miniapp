import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Quote } from '../types';

export interface ConfiguratorDraft {
  projectId: number | null;
  projectSlug: string | null;
  area: number | null;
  materialId: number | null;
  packageId: number | null;
  quote: Quote | null;
  hasLand: string;
  region: string;
  regionCustom: string;
  desiredStartPeriod: string;
  budgetRange: string;
  name: string;
  phone: string;
}

const EMPTY: ConfiguratorDraft = {
  projectId: null,
  projectSlug: null,
  area: null,
  materialId: null,
  packageId: null,
  quote: null,
  hasLand: '',
  region: '',
  regionCustom: '',
  desiredStartPeriod: '',
  budgetRange: '',
  name: '',
  phone: '',
};

interface ConfiguratorContextValue {
  draft: ConfiguratorDraft;
  patch: (next: Partial<ConfiguratorDraft>) => void;
  reset: () => void;
  fillDemoDraft: (next: Partial<ConfiguratorDraft>) => void;
}

const ConfiguratorContext = createContext<ConfiguratorContextValue | null>(null);

export function ConfiguratorProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<ConfiguratorDraft>(EMPTY);
  const patch = useCallback((next: Partial<ConfiguratorDraft>) => {
    setDraft((current) => ({ ...current, ...next }));
  }, []);
  const reset = useCallback(() => setDraft(EMPTY), []);
  const fillDemoDraft = useCallback((next: Partial<ConfiguratorDraft>) => {
    setDraft((current) => ({ ...current, ...next }));
  }, []);
  const value = useMemo(() => ({ draft, patch, reset, fillDemoDraft }), [draft, fillDemoDraft, patch, reset]);
  return <ConfiguratorContext.Provider value={value}>{children}</ConfiguratorContext.Provider>;
}

export function useConfigurator(): ConfiguratorContextValue {
  const ctx = useContext(ConfiguratorContext);
  if (!ctx) throw new Error('useConfigurator must be used within ConfiguratorProvider');
  return ctx;
}
