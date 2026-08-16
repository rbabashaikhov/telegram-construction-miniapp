import type {
  AppConfig,
  ClientProject,
  ConstructionMaterial,
  ConstructionStage,
  HouseProject,
  Lead,
  LeadStatus,
  Package,
  PaymentSummary,
  ProgressUpdate,
  ProjectDocument,
  Quote,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

let initData = '';
let adminToken = '';

if (typeof sessionStorage !== 'undefined') {
  adminToken = sessionStorage.getItem('admin_token') || '';
}

export function setTelegramInitData(value: string): void {
  initData = value;
}

export function setAdminToken(value: string): void {
  adminToken = value;
  if (typeof sessionStorage !== 'undefined') {
    if (value) sessionStorage.setItem('admin_token', value);
    else sessionStorage.removeItem('admin_token');
  }
}

export function getAdminToken(): string {
  return adminToken;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (initData) headers.set('x-telegram-init-data', initData);
  if (adminToken && path.startsWith('/api/admin')) headers.set('x-admin-token', adminToken);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload.error || `Request failed (${response.status})`, response.status);
  }
  return payload as T;
}

export interface CalculateInput {
  projectId: number;
  area: number;
  materialId: number;
  packageId: number;
}

export interface CreateLeadInput extends CalculateInput {
  hasLand: string;
  region: string;
  desiredStartPeriod: string;
  budgetRange: string;
  name?: string;
  phone?: string;
  username?: string;
}

export const api = {
  getConfig: () => request<{ data: AppConfig }>('/api/config'),
  getProjects: () => request<{ data: HouseProject[] }>('/api/projects'),
  getProject: (id: string | number) => request<{ data: HouseProject }>(`/api/projects/${id}`),
  getMaterials: () => request<{ data: ConstructionMaterial[] }>('/api/materials'),
  getPackages: () => request<{ data: Package[] }>('/api/packages'),
  calculateQuote: (body: CalculateInput) =>
    request<{ data: Quote }>('/api/quotes/calculate', { method: 'POST', body: JSON.stringify(body) }),
  createLead: (body: CreateLeadInput) =>
    request<{ data: Lead }>('/api/leads', { method: 'POST', body: JSON.stringify(body) }),
  getLead: (id: number) => request<{ data: Lead }>(`/api/leads/${id}`),
  getMyProject: () => request<{ data: ClientProject }>('/api/me/project'),
  getMyStages: () => request<{ data: ConstructionStage[] }>('/api/me/project/stages'),
  getMyUpdates: () => request<{ data: ProgressUpdate[] }>('/api/me/project/updates'),
  getMyDocuments: () => request<{ data: ProjectDocument[] }>('/api/me/project/documents'),
  getMyPayments: () => request<{ data: PaymentSummary }>('/api/me/project/payments'),
  getAdminLeads: (query = '') => request<{ data: Lead[] }>(`/api/admin/leads${query}`),
  getAdminLead: (id: number) => request<{ data: Lead }>(`/api/admin/leads/${id}`),
  patchLeadStatus: (id: number, status: LeadStatus) =>
    request<{ data: Lead }>(`/api/admin/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getAdminProjects: () => request<{ data: HouseProject[] }>('/api/admin/projects'),
  patchAdminProject: (id: number, body: Partial<HouseProject>) =>
    request<{ data: HouseProject }>(`/api/admin/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  getAdminMaterials: () => request<{ data: ConstructionMaterial[] }>('/api/admin/materials'),
  patchAdminMaterial: (id: number, body: Partial<ConstructionMaterial>) =>
    request<{ data: ConstructionMaterial }>(`/api/admin/materials/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  getAdminPackages: () => request<{ data: Package[] }>('/api/admin/packages'),
  patchAdminPackage: (id: number, body: Partial<Package>) =>
    request<{ data: Package }>(`/api/admin/packages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  getDemoAdminLeads: (query = '') => request<{ data: Lead[] }>(`/api/demo-admin/leads${query}`),
  getDemoAdminLead: (id: number) => request<{ data: Lead }>(`/api/demo-admin/leads/${id}`),
};
