import type {
  BudgetRange,
  DesiredStartPeriod,
  HasLand,
  LeadScore,
  LeadTemperature,
} from '../types.js';

export interface ScoreInput {
  hasLand: HasLand;
  desiredStartPeriod: DesiredStartPeriod;
  budgetRange: BudgetRange;
  quoteFrom: number;
  quoteTo: number;
  hasProject: boolean;
  hasMaterial: boolean;
  hasPackage: boolean;
}

const LAND_POINTS: Record<HasLand, number> = {
  yes: 25,
  choosing: 12,
  no: 0,
};

const LAND_REASONS: Record<HasLand, string | null> = {
  yes: 'Участок уже есть',
  choosing: 'Участок в процессе выбора',
  no: null,
};

const START_POINTS: Record<DesiredStartPeriod, number> = {
  asap: 30,
  '1_3': 25,
  '3_6': 15,
  '6_12': 7,
  exploring: 0,
};

const START_REASONS: Record<DesiredStartPeriod, string | null> = {
  asap: 'Строительство планируется как можно скорее',
  '1_3': 'Строительство планируется в ближайшие 3 месяца',
  '3_6': 'Старт строительства в горизонте 3–6 месяцев',
  '6_12': 'Старт строительства в горизонте 6–12 месяцев',
  exploring: null,
};

export const BUDGET_BOUNDS: Record<BudgetRange, { min: number; max: number }> = {
  under_7: { min: 0, max: 7_000_000 },
  '7_10': { min: 7_000_000, max: 10_000_000 },
  '10_15': { min: 10_000_000, max: 15_000_000 },
  '15_20': { min: 15_000_000, max: 20_000_000 },
  '20_plus': { min: 20_000_000, max: Number.POSITIVE_INFINITY },
};

export function temperatureFromScore(score: number): LeadTemperature {
  if (score >= 75) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}

export function budgetCompatibility(
  budgetRange: BudgetRange,
  quoteFrom: number,
  quoteTo: number,
): { points: number; reason: string | null } {
  const bounds = BUDGET_BOUNDS[budgetRange];
  const midpoint = (quoteFrom + quoteTo) / 2;

  const coversFrom = bounds.max >= quoteFrom;
  const midpointInside = midpoint >= bounds.min && midpoint <= bounds.max;
  const fromInside = quoteFrom >= bounds.min && quoteFrom <= bounds.max;

  if (coversFrom || midpointInside || fromInside) {
    return {
      points: 30,
      reason: 'Бюджет соответствует выбранной конфигурации',
    };
  }

  if (bounds.max >= quoteFrom * 0.85) {
    return {
      points: 15,
      reason: 'Бюджет немного ниже ориентировочной стоимости',
    };
  }

  return {
    points: 0,
    reason: 'Заявленный бюджет заметно ниже расчета',
  };
}

export function scoreLead(input: ScoreInput): LeadScore {
  const reasons: string[] = [];
  let score = 0;

  const landPoints = LAND_POINTS[input.hasLand];
  score += landPoints;
  const landReason = LAND_REASONS[input.hasLand];
  if (landReason) reasons.push(landReason);

  const startPoints = START_POINTS[input.desiredStartPeriod];
  score += startPoints;
  const startReason = START_REASONS[input.desiredStartPeriod];
  if (startReason) reasons.push(startReason);

  const budget = budgetCompatibility(input.budgetRange, input.quoteFrom, input.quoteTo);
  score += budget.points;
  if (budget.reason) reasons.push(budget.reason);

  const specific = input.hasProject && input.hasMaterial && input.hasPackage;
  if (specific) {
    score += 15;
    reasons.push('Выбран конкретный проект и комплектация');
  }

  const clamped = Math.max(0, Math.min(100, score));
  return {
    score: clamped,
    temperature: temperatureFromScore(clamped),
    reasons,
  };
}
