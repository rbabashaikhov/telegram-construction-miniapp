export interface AppConfig {
  businessName: string;
  businessType: string;
  businessVertical: string;
  appTitle: string;
  appDescription: string;
  timezone: string;
  demoMode: boolean;
  adminProtected: boolean;
  currency: string;
  currencySymbol: string;
  branding: { accent: string; logoUrl: string | null };
  features: { demoTour: boolean; demoAdminPreview: boolean };
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
export type LeadTemperature = 'hot' | 'warm' | 'cold';
export type HasLand = 'yes' | 'choosing' | 'no';
export type DesiredStartPeriod = 'asap' | '1_3' | '3_6' | '6_12' | 'exploring';
export type BudgetRange = 'under_7' | '7_10' | '10_15' | '15_20' | '20_plus';
export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';
export type PaymentStatus = 'planned' | 'due' | 'paid';

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
}

export interface ConstructionMaterial {
  id: number;
  name: string;
  slug: string;
  priceModifierType: 'percent' | 'fixed';
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

export interface Quote {
  displayName: string;
  subtotal: number;
  priceFrom: number;
  priceTo: number;
  durationMonthsFrom: number;
  durationMonthsTo: number;
  breakdown: {
    basePrice: number;
    area: number;
    projectArea: number;
    areaModifier: number;
    materialModifier: number;
    packageMultiplier: number;
    optionsTotal: number;
  };
  project: HouseProject;
  material: ConstructionMaterial;
  package: Package;
}

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  username: string | null;
}

export interface Lead {
  id: number;
  customer: Customer;
  project: HouseProject;
  requestedArea: number;
  displayName: string;
  material: ConstructionMaterial;
  package: Package;
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
  createdAt: string;
  updatedAt: string;
}

export interface ProjectManager {
  id: number;
  name: string;
  role: string;
  phone: string | null;
}

export interface ConstructionStage {
  id: number;
  name: string;
  description: string;
  status: StageStatus;
  progress: number;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  completedAt: string | null;
  displayOrder: number;
}

export interface ClientProject {
  id: number;
  name: string;
  region: string;
  area: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  progress: number;
  plannedCompletionDate: string;
  contractAmount: number;
  customer: Customer;
  project: HouseProject;
  material: ConstructionMaterial;
  package: Package;
  manager: ProjectManager;
  currentStage: ConstructionStage | null;
}

export interface ProgressUpdate {
  id: number;
  stageId: number | null;
  title: string;
  text: string;
  date: string;
  photos: string[];
}

export interface ProjectDocument {
  id: number;
  title: string;
  type: string;
  fileUrl: string;
  createdAt: string;
}

export interface PaymentItem {
  id: number;
  title: string;
  amount: number;
  dueCondition: string;
  dueDate: string | null;
  status: PaymentStatus;
  paidAt: string | null;
}

export interface PaymentSummary {
  contractAmount: number;
  paidAmount: number;
  nextPayment: PaymentItem | null;
  items: PaymentItem[];
}

export interface AppUser {
  id: number;
  username?: string;
  firstName?: string;
  lastName?: string;
}
