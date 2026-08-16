import { describe, expect, it } from 'vitest';
import { scoreLead, temperatureFromScore } from './scoring.js';

describe('lead scoring', () => {
  it('scores a hot lead', () => {
    const result = scoreLead({
      hasLand: 'yes',
      desiredStartPeriod: '1_3',
      budgetRange: '10_15',
      quoteFrom: 9_200_000,
      quoteTo: 10_400_000,
      hasProject: true,
      hasMaterial: true,
      hasPackage: true,
    });
    expect(result.score).toBe(95);
    expect(result.temperature).toBe('hot');
    expect(result.reasons).toContain('Участок уже есть');
    expect(result.reasons).toContain('Строительство планируется в ближайшие 3 месяца');
    expect(result.reasons).toContain('Бюджет соответствует выбранной конфигурации');
    expect(result.reasons).toContain('Выбран конкретный проект и комплектация');
  });

  it('scores a warm lead', () => {
    const result = scoreLead({
      hasLand: 'choosing',
      desiredStartPeriod: '3_6',
      budgetRange: '7_10',
      quoteFrom: 6_800_000,
      quoteTo: 7_700_000,
      hasProject: true,
      hasMaterial: true,
      hasPackage: true,
    });
    expect(result.temperature).toBe('warm');
    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.score).toBeLessThan(75);
  });

  it('scores a cold lead', () => {
    const result = scoreLead({
      hasLand: 'no',
      desiredStartPeriod: 'exploring',
      budgetRange: 'under_7',
      quoteFrom: 8_100_000,
      quoteTo: 9_200_000,
      hasProject: false,
      hasMaterial: false,
      hasPackage: false,
    });
    expect(result.temperature).toBe('cold');
    expect(result.score).toBeLessThan(40);
  });

  it('gives full budget points when budget covers the quote', () => {
    const result = scoreLead({
      hasLand: 'no',
      desiredStartPeriod: 'exploring',
      budgetRange: '10_15',
      quoteFrom: 9_200_000,
      quoteTo: 10_400_000,
      hasProject: true,
      hasMaterial: true,
      hasPackage: true,
    });
    expect(result.reasons).toContain('Бюджет соответствует выбранной конфигурации');
    expect(result.score).toBe(45);
  });

  it('gives partial budget points when budget is slightly below', () => {
    const result = scoreLead({
      hasLand: 'no',
      desiredStartPeriod: 'exploring',
      budgetRange: '7_10',
      quoteFrom: 10_200_000,
      quoteTo: 11_500_000,
      hasProject: false,
      hasMaterial: false,
      hasPackage: false,
    });
    expect(result.reasons).toContain('Бюджет немного ниже ориентировочной стоимости');
    expect(result.score).toBe(15);
  });

  it('gives land and start period points independently', () => {
    const withLand = scoreLead({
      hasLand: 'yes',
      desiredStartPeriod: 'asap',
      budgetRange: 'under_7',
      quoteFrom: 20_000_000,
      quoteTo: 22_000_000,
      hasProject: false,
      hasMaterial: false,
      hasPackage: false,
    });
    expect(withLand.score).toBe(55);
    expect(withLand.reasons).toContain('Участок уже есть');
    expect(withLand.reasons).toContain('Строительство планируется как можно скорее');
  });

  it('maps score bands to temperature', () => {
    expect(temperatureFromScore(75)).toBe('hot');
    expect(temperatureFromScore(40)).toBe('warm');
    expect(temperatureFromScore(39)).toBe('cold');
  });
});
