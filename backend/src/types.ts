export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
export type LeadTemperature = 'hot' | 'warm' | 'cold';
export type HasLand = 'yes' | 'choosing' | 'no';
export type DesiredStartPeriod = 'asap' | '1_3' | '3_6' | '6_12' | 'exploring';
export type BudgetRange = 'under_7' | '7_10' | '10_15' | '15_20' | '20_plus';
export type PriceModifierType = 'percent' | 'fixed';
export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';
export type PaymentStatus = 'planned' | 'due' | 'paid';
export type DocumentType = 'contract' | 'project' | 'estimate' | 'act' | 'other';
export type OutboundEventName =
  | 'lead.created'
  | 'lead.updated'
  | 'lead.qualified'
  | 'project.customer_created';

export const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'won',
  'lost',
];

export const LEAD_TEMPERATURES: LeadTemperature[] = ['hot', 'warm', 'cold'];
export const HAS_LAND_VALUES: HasLand[] = ['yes', 'choosing', 'no'];
export const START_PERIODS: DesiredStartPeriod[] = ['asap', '1_3', '3_6', '6_12', 'exploring'];
export const BUDGET_RANGES: BudgetRange[] = ['under_7', '7_10', '10_15', '15_20', '20_plus'];

export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthContext {
  telegramUser: TelegramUser;
  isDemo: boolean;
}

export interface Customer {
  id: number;
  telegramUserId: number | null;
  name: string;
  phone: string | null;
  username: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HouseProject {
  id: number;
  slug: string;
  name: string;
  description: string;
  floors: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  style: string;
  basePrice: number;
  constructionDurationMonths: number;
  image: string;
  gallery: string[];
  areaOptions: number[];
  features: string[];
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConstructionMaterial {
  id: number;
  name: string;
  slug: string;
  priceModifierType: PriceModifierType;
  priceModifierValue: number;
  durationDeltaMonths: number;
  description: string;
  active: boolean;
  displayOrder: number;
}

export interface Package {
  id: number;
  name: string;
  slug: string;
  description: string;
  multiplier: number;
  durationDeltaMonths: number;
  features: string[];
  active: boolean;
  displayOrder: number;
}

export interface QuoteOption {
  id: string;
  name: string;
  price: number;
}

export interface QuoteBreakdown {
  basePrice: number;
  area: number;
  projectArea: number;
  areaModifier: number;
  materialModifier: number;
  packageMultiplier: number;
  optionsTotal: number;
}

export interface Quote {
  id: number;
  customerId: number | null;
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
  breakdown: QuoteBreakdown;
  createdAt: string;
}

export interface QuoteCalculation {
  subtotal: number;
  priceFrom: number;
  priceTo: number;
  durationMonthsFrom: number;
  durationMonthsTo: number;
  breakdown: QuoteBreakdown;
  project: HouseProject;
  material: ConstructionMaterial;
  package: Package;
  displayName: string;
}

export interface LeadScore {
  score: number;
  temperature: LeadTemperature;
  reasons: string[];
}

export interface Lead {
  id: number;
  customerId: number;
  projectId: number;
  requestedArea: number;
  materialId: number;
  packageId: number;
  quoteId: number | null;
  quoteFrom: number;
  quoteTo: number;
  durationMonthsFrom: number;
  durationMonthsTo: number;
  hasLand: HasLand;
  region: string;
  desiredStartPeriod: DesiredStartPeriod;
  budgetRange: BudgetRange;
  score: number;
  temperature: LeadTemperature;
  reasons: string[];
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadWithDetails extends Lead {
  customer: Customer;
  project: HouseProject;
  material: ConstructionMaterial;
  package: Package;
  displayName: string;
}

export interface ProjectManager {
  id: number;
  name: string;
  role: string;
  phone: string | null;
}

export interface ProjectInstance {
  id: number;
  customerId: number;
  projectId: number;
  leadId: number | null;
  name: string;
  region: string;
  area: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  materialId: number;
  packageId: number;
  contractAmount: number;
  progress: number;
  plannedCompletionDate: string;
  managerId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInstanceDetails extends ProjectInstance {
  customer: Customer;
  project: HouseProject;
  material: ConstructionMaterial;
  package: Package;
  manager: ProjectManager;
}

export interface ConstructionStage {
  id: number;
  projectInstanceId: number;
  name: string;
  description: string;
  status: StageStatus;
  progress: number;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  completedAt: string | null;
  displayOrder: number;
}

export interface ProgressUpdate {
  id: number;
  projectInstanceId: number;
  stageId: number | null;
  title: string;
  text: string;
  date: string;
  photos: string[];
}

export interface ProjectDocument {
  id: number;
  projectInstanceId: number;
  title: string;
  type: DocumentType;
  fileUrl: string;
  createdAt: string;
}

export interface PaymentScheduleItem {
  id: number;
  projectInstanceId: number;
  title: string;
  amount: number;
  dueCondition: string;
  dueDate: string | null;
  status: PaymentStatus;
  paidAt: string | null;
  displayOrder: number;
}

export interface OutboundEvent {
  id: number;
  name: OutboundEventName;
  payload: Record<string, unknown>;
  createdAt: string;
  deliveredAt: string | null;
}

export interface PaymentSummary {
  contractAmount: number;
  paidAmount: number;
  nextPayment: PaymentScheduleItem | null;
  items: PaymentScheduleItem[];
}
