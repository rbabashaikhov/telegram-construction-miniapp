import { describe, expect, it } from 'vitest';
import { calculateQuote, PRICE_FROM_RATIO, PRICE_TO_RATIO } from './pricing.js';
import type { ConstructionMaterial, HouseProject, Package } from '../types.js';

const project: HouseProject = {
  id: 1,
  slug: 'nordic-125',
  name: 'Nordic 125',
  description: '',
  floors: 1,
  area: 125,
  bedrooms: 3,
  bathrooms: 2,
  style: 'nordic',
  basePrice: 6_150_000,
  constructionDurationMonths: 7,
  image: '',
  gallery: [],
  areaOptions: [125, 142, 155],
  features: [],
  active: true,
  displayOrder: 1,
  createdAt: '',
  updatedAt: '',
};

const gasbeton: ConstructionMaterial = {
  id: 1,
  name: 'Газобетон',
  slug: 'gasbeton',
  priceModifierType: 'percent',
  priceModifierValue: 0,
  durationDeltaMonths: 0,
  description: '',
  active: true,
  displayOrder: 1,
};

const brick: ConstructionMaterial = {
  ...gasbeton,
  id: 2,
  name: 'Кирпич',
  slug: 'brick',
  priceModifierValue: 12,
  durationDeltaMonths: 1,
};

const frame: ConstructionMaterial = {
  ...gasbeton,
  id: 4,
  name: 'Каркас',
  slug: 'frame',
  priceModifierValue: -8,
  durationDeltaMonths: -1,
};

const warm: Package = {
  id: 1,
  name: 'Тёплый контур',
  slug: 'warm-shell',
  description: '',
  multiplier: 1,
  durationDeltaMonths: 0,
  features: [],
  active: true,
  displayOrder: 1,
};

const prefinish: Package = {
  ...warm,
  id: 2,
  name: 'Предчистовая',
  slug: 'prefinish',
  multiplier: 1.35,
  durationDeltaMonths: 1,
};

describe('pricing engine', () => {
  it('changes quote when material changes', () => {
    const base = calculateQuote({ project, area: 125, material: gasbeton, package: warm });
    const withBrick = calculateQuote({ project, area: 125, material: brick, package: warm });
    const withFrame = calculateQuote({ project, area: 125, material: frame, package: warm });
    expect(withBrick.subtotal).toBeGreaterThan(base.subtotal);
    expect(withFrame.subtotal).toBeLessThan(base.subtotal);
  });

  it('changes quote when package changes', () => {
    const warmQuote = calculateQuote({ project, area: 125, material: gasbeton, package: warm });
    const prefinishQuote = calculateQuote({ project, area: 125, material: gasbeton, package: prefinish });
    expect(prefinishQuote.subtotal).toBe(Math.round(warmQuote.subtotal * 1.35));
  });

  it('changes quote when area changes', () => {
    const small = calculateQuote({ project, area: 125, material: gasbeton, package: prefinish });
    const large = calculateQuote({ project, area: 142, material: gasbeton, package: prefinish });
    expect(large.subtotal).toBeGreaterThan(small.subtotal);
    expect(large.displayName).toBe('Nordic 142');
  });

  it('does not accept a frontend-supplied final price', () => {
    const quote = calculateQuote({ project, area: 142, material: gasbeton, package: prefinish });
    expect(quote.priceFrom).toBe(Math.round(quote.subtotal * PRICE_FROM_RATIO));
    expect(quote.priceTo).toBe(Math.round(quote.subtotal * PRICE_TO_RATIO));
    expect(quote.subtotal).not.toBe(1);
  });
});
