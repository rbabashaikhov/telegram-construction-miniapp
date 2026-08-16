import type {
  ConstructionMaterial,
  ConstructionStage,
  Customer,
  HouseProject,
  LeadWithDetails,
  Package,
  PaymentScheduleItem,
  PaymentSummary,
  ProgressUpdate,
  ProjectDocument,
  ProjectInstanceDetails,
  QuoteCalculation,
} from '../types.js';

export function serializeCustomer(customer: Customer) {
  return {
    id: customer.id,
    telegramUserId: customer.telegramUserId,
    name: customer.name,
    phone: customer.phone,
    username: customer.username,
    createdAt: customer.createdAt,
  };
}

export function serializeProject(project: HouseProject) {
  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    description: project.description,
    floors: project.floors,
    area: project.area,
    bedrooms: project.bedrooms,
    bathrooms: project.bathrooms,
    style: project.style,
    basePrice: project.basePrice,
    constructionDurationMonths: project.constructionDurationMonths,
    image: project.image,
    gallery: project.gallery,
    areaOptions: project.areaOptions,
    features: project.features,
    active: project.active,
    displayOrder: project.displayOrder,
  };
}

export function serializeMaterial(material: ConstructionMaterial) {
  return {
    id: material.id,
    name: material.name,
    slug: material.slug,
    priceModifierType: material.priceModifierType,
    priceModifierValue: material.priceModifierValue,
    durationDeltaMonths: material.durationDeltaMonths,
    description: material.description,
    active: material.active,
    displayOrder: material.displayOrder,
  };
}

export function serializePackage(pkg: Package) {
  return {
    id: pkg.id,
    name: pkg.name,
    slug: pkg.slug,
    description: pkg.description,
    multiplier: pkg.multiplier,
    durationDeltaMonths: pkg.durationDeltaMonths,
    features: pkg.features,
    active: pkg.active,
    displayOrder: pkg.displayOrder,
  };
}

export function serializeQuote(quote: QuoteCalculation) {
  return {
    displayName: quote.displayName,
    subtotal: quote.subtotal,
    priceFrom: quote.priceFrom,
    priceTo: quote.priceTo,
    durationMonthsFrom: quote.durationMonthsFrom,
    durationMonthsTo: quote.durationMonthsTo,
    breakdown: quote.breakdown,
    project: serializeProject(quote.project),
    material: serializeMaterial(quote.material),
    package: serializePackage(quote.package),
  };
}

export function serializeLead(lead: LeadWithDetails) {
  return {
    id: lead.id,
    customerId: lead.customerId,
    customer: serializeCustomer(lead.customer),
    projectId: lead.projectId,
    project: serializeProject(lead.project),
    requestedArea: lead.requestedArea,
    displayName: lead.displayName,
    materialId: lead.materialId,
    material: serializeMaterial(lead.material),
    packageId: lead.packageId,
    package: serializePackage(lead.package),
    quoteFrom: lead.quoteFrom,
    quoteTo: lead.quoteTo,
    durationMonthsFrom: lead.durationMonthsFrom,
    durationMonthsTo: lead.durationMonthsTo,
    hasLand: lead.hasLand,
    region: lead.region,
    desiredStartPeriod: lead.desiredStartPeriod,
    budgetRange: lead.budgetRange,
    score: lead.score,
    temperature: lead.temperature,
    reasons: lead.reasons,
    status: lead.status,
    notes: lead.notes,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

export function serializeInstance(instance: ProjectInstanceDetails) {
  return {
    id: instance.id,
    name: instance.name,
    region: instance.region,
    area: instance.area,
    floors: instance.floors,
    bedrooms: instance.bedrooms,
    bathrooms: instance.bathrooms,
    progress: instance.progress,
    plannedCompletionDate: instance.plannedCompletionDate,
    status: instance.status,
    contractAmount: instance.contractAmount,
    customer: serializeCustomer(instance.customer),
    project: serializeProject(instance.project),
    material: serializeMaterial(instance.material),
    package: serializePackage(instance.package),
    manager: instance.manager,
  };
}

export function serializeStage(stage: ConstructionStage) {
  return {
    id: stage.id,
    name: stage.name,
    description: stage.description,
    status: stage.status,
    progress: stage.progress,
    plannedStartDate: stage.plannedStartDate,
    plannedEndDate: stage.plannedEndDate,
    completedAt: stage.completedAt,
    displayOrder: stage.displayOrder,
  };
}

export function serializeUpdate(update: ProgressUpdate) {
  return {
    id: update.id,
    stageId: update.stageId,
    title: update.title,
    text: update.text,
    date: update.date,
    photos: update.photos,
  };
}

export function serializeDocument(doc: ProjectDocument) {
  return {
    id: doc.id,
    title: doc.title,
    type: doc.type,
    fileUrl: doc.fileUrl,
    createdAt: doc.createdAt,
  };
}

export function serializePayment(item: PaymentScheduleItem) {
  return {
    id: item.id,
    title: item.title,
    amount: item.amount,
    dueCondition: item.dueCondition,
    dueDate: item.dueDate,
    status: item.status,
    paidAt: item.paidAt,
    displayOrder: item.displayOrder,
  };
}

export function serializePaymentSummary(summary: PaymentSummary) {
  return {
    contractAmount: summary.contractAmount,
    paidAmount: summary.paidAmount,
    nextPayment: summary.nextPayment ? serializePayment(summary.nextPayment) : null,
    items: summary.items.map(serializePayment),
  };
}
