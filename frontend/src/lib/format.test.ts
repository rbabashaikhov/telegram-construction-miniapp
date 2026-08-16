import { describe, expect, it } from 'vitest';
import { formatMoney, formatMoneyRange } from './format';

describe('format', () => {
  it('formats rubles with grouping', () => {
    expect(formatMoney(10460000).replace(/\s/g, ' ')).toMatch(/10 460 000 ₽/);
  });

  it('formats a compact price range', () => {
    expect(formatMoneyRange(9_200_000, 10_400_000)).toMatch(/9,2|9.2/);
    expect(formatMoneyRange(9_200_000, 10_400_000)).toMatch(/10,4|10.4/);
  });
});
