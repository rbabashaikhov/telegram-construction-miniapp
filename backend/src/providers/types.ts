import type {
  ConstructionMaterial,
  ConstructionStage,
  Customer,
  HouseProject,
  Lead,
  LeadStatus,
  LeadTemperature,
  LeadWithDetails,
  OutboundEvent,
  OutboundEventName,
  Package,
  PaymentScheduleItem,
  ProgressUpdate,
  ProjectDocument,
  ProjectInstance,
  ProjectInstanceDetails,
  ProjectManager,
  Quote,
  QuoteOption,
  TelegramUser,
} from '../types.js';

export interface CatalogFilters {
  activeOnly?: boolean;
}

export interface LeadListFilters {
  status?: LeadStatus;
  temperature?: LeadTemperature;
  projectId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface CustomerProvider {
  upsert(user: TelegramUser, extras?: { name?: string; phone?: string }): { id: number; created: boolean };
  getByTelegramUserId(telegramUserId: number): Customer | undefined;
  getById(id: number): Customer | undefined;
  listAll(): Customer[];
  update(id: number, patch: Partial<{ name: string; phone: string | null; username: string | null }>): Customer;
}

export interface CatalogProvider {
  listProjects(filters?: CatalogFilters): HouseProject[];
  getProject(id: number): HouseProject | undefined;
  getProjectBySlug(slug: string): HouseProject | undefined;
  createProject(params: Omit<HouseProject, 'id' | 'createdAt' | 'updatedAt'>): HouseProject;
  updateProject(id: number, patch: Partial<Omit<HouseProject, 'id' | 'createdAt' | 'updatedAt'>>): HouseProject;
  listMaterials(filters?: CatalogFilters): ConstructionMaterial[];
  getMaterial(id: number): ConstructionMaterial | undefined;
  createMaterial(params: Omit<ConstructionMaterial, 'id'>): ConstructionMaterial;
  updateMaterial(
    id: number,
    patch: Partial<Omit<ConstructionMaterial, 'id'>>,
  ): ConstructionMaterial;
  listPackages(filters?: CatalogFilters): Package[];
  getPackage(id: number): Package | undefined;
  createPackage(params: Omit<Package, 'id'>): Package;
  updatePackage(id: number, patch: Partial<Omit<Package, 'id'>>): Package;
}

export interface QuoteProvider {
  insert(params: {
    customerId?: number | null;
    projectId: number;
    area: number;
    materialId: number;
    packageId: number;
    options: QuoteOption[];
    subtotal: number;
    priceFrom: number;
    priceTo: number;
    durationMonthsFrom: number;
    durationMonthsTo: number;
    breakdown: Quote['breakdown'];
  }): Quote;
  getById(id: number): Quote | undefined;
}

export interface LeadProvider {
  createLead(params: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead;
  getLead(id: number): LeadWithDetails | undefined;
  listLeads(filters?: LeadListFilters): LeadWithDetails[];
  updateLeadStatus(id: number, status: LeadStatus): LeadWithDetails;
  updateLead(id: number, patch: Partial<Pick<Lead, 'notes' | 'status'>>): LeadWithDetails;
}

export interface ConstructionProvider {
  getManager(id: number): ProjectManager | undefined;
  createManager(params: Omit<ProjectManager, 'id'>): ProjectManager;
  getInstanceByCustomer(customerId: number): ProjectInstanceDetails | undefined;
  getInstance(id: number): ProjectInstanceDetails | undefined;
  listInstances(): ProjectInstanceDetails[];
  createInstance(params: Omit<ProjectInstance, 'id' | 'createdAt' | 'updatedAt'>): ProjectInstance;
  listStages(projectInstanceId: number): ConstructionStage[];
  createStage(params: Omit<ConstructionStage, 'id'>): ConstructionStage;
  listUpdates(projectInstanceId: number): ProgressUpdate[];
  createUpdate(params: Omit<ProgressUpdate, 'id'>): ProgressUpdate;
  listDocuments(projectInstanceId: number): ProjectDocument[];
  createDocument(params: Omit<ProjectDocument, 'id' | 'createdAt'>): ProjectDocument;
  listPayments(projectInstanceId: number): PaymentScheduleItem[];
  createPayment(params: Omit<PaymentScheduleItem, 'id'>): PaymentScheduleItem;
}

export interface OutboundEventPublisher {
  publish(name: OutboundEventName, payload: Record<string, unknown>): OutboundEvent;
  list(limit?: number): OutboundEvent[];
}

export interface Providers {
  customers: CustomerProvider;
  catalog: CatalogProvider;
  quotes: QuoteProvider;
  leads: LeadProvider;
  construction: ConstructionProvider;
  events: OutboundEventPublisher;
  transaction<T>(fn: () => T): T;
}
