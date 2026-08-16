import type {
  ConstructionMaterial,
  HouseProject,
  Package,
  QuoteBreakdown,
  QuoteCalculation,
  QuoteOption,
} from '../types.js';

export const PRICE_FROM_RATIO = 0.978;
export const PRICE_TO_RATIO = 1.106;

export function materialMultiplier(material: ConstructionMaterial): number {
  if (material.priceModifierType === 'fixed') {
    return 1;
  }
  return 1 + material.priceModifierValue / 100;
}

export function areaModifier(requestedArea: number, projectArea: number): number {
  if (projectArea <= 0) return 1;
  return requestedArea / projectArea;
}

export function displayHouseName(project: HouseProject, area: number): string {
  const trimmed = project.name.trim();
  const match = trimmed.match(/^(.*?)(\s+)(\d+)$/);
  if (match) {
    return `${match[1]} ${area}`;
  }
  return `${trimmed} ${area}`;
}

export function calculateQuote(input: {
  project: HouseProject;
  area: number;
  material: ConstructionMaterial;
  package: Package;
  options?: QuoteOption[];
}): Omit<QuoteCalculation, 'project' | 'material' | 'package'> & {
  breakdown: QuoteBreakdown;
} {
  const options = input.options ?? [];
  const areaMod = areaModifier(input.area, input.project.area);
  const materialMod = materialMultiplier(input.material);
  const packageMod = input.package.multiplier;
  const optionsTotal = options.reduce((sum, option) => sum + option.price, 0);
  const materialFixed =
    input.material.priceModifierType === 'fixed' ? input.material.priceModifierValue : 0;

  const raw =
    input.project.basePrice * areaMod * materialMod * packageMod + materialFixed + optionsTotal;
  const subtotal = Math.round(raw);
  const priceFrom = Math.round(subtotal * PRICE_FROM_RATIO);
  const priceTo = Math.round(subtotal * PRICE_TO_RATIO);

  const durationBase =
    input.project.constructionDurationMonths +
    input.material.durationDeltaMonths +
    input.package.durationDeltaMonths;
  const durationMonthsFrom = Math.max(4, durationBase);
  const durationMonthsTo = durationMonthsFrom + 2;

  return {
    subtotal,
    priceFrom,
    priceTo,
    durationMonthsFrom,
    durationMonthsTo,
    displayName: displayHouseName(input.project, input.area),
    breakdown: {
      basePrice: input.project.basePrice,
      area: input.area,
      projectArea: input.project.area,
      areaModifier: Number(areaMod.toFixed(4)),
      materialModifier: Number(materialMod.toFixed(4)),
      packageMultiplier: packageMod,
      optionsTotal,
    },
  };
}

export function buildQuoteCalculation(input: {
  project: HouseProject;
  area: number;
  material: ConstructionMaterial;
  package: Package;
  options?: QuoteOption[];
}): QuoteCalculation {
  const quote = calculateQuote(input);
  return {
    ...quote,
    project: input.project,
    material: input.material,
    package: input.package,
  };
}
