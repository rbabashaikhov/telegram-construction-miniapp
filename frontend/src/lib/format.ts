export function formatMoney(value: number, symbol = '₽'): string {
  const formatted = new Intl.NumberFormat('ru-RU').format(Math.round(value));
  return `${formatted} ${symbol}`;
}

export function formatMoneyRange(from: number, to: number, symbol = '₽'): string {
  const compact = (value: number) => {
    if (value >= 1_000_000) {
      const millions = value / 1_000_000;
      const digits = millions >= 10 ? 1 : 1;
      return `${millions.toLocaleString('ru-RU', { maximumFractionDigits: digits, minimumFractionDigits: millions % 1 === 0 ? 0 : digits })} млн`;
    }
    return formatMoney(value, symbol);
  };
  return `${compact(from)}–${compact(to)} ${symbol}`.replace(` ${symbol} ${symbol}`, ` ${symbol}`);
}

export function formatArea(area: number): string {
  return `${area} м²`;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const parts = value.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      });
    }
    return value;
  }
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

export const LAND_LABELS: Record<string, string> = {
  yes: 'Участок есть',
  choosing: 'Выбираю участок',
  no: 'Участка пока нет',
};

export const START_LABELS: Record<string, string> = {
  asap: 'Как можно скорее',
  '1_3': '1–3 месяца',
  '3_6': '3–6 месяцев',
  '6_12': '6–12 месяцев',
  exploring: 'Пока изучаю варианты',
};

export const BUDGET_LABELS: Record<string, string> = {
  under_7: 'до 7 млн',
  '7_10': '7–10 млн',
  '10_15': '10–15 млн',
  '15_20': '15–20 млн',
  '20_plus': '20+ млн',
};

export const STATUS_LABELS: Record<string, string> = {
  new: 'NEW',
  contacted: 'CONTACTED',
  qualified: 'QUALIFIED',
  proposal: 'PROPOSAL',
  won: 'WON',
  lost: 'LOST',
};

export const STAGE_LABELS: Record<string, string> = {
  pending: 'Ожидает',
  in_progress: 'В работе',
  completed: 'Завершён',
  delayed: 'Сдвиг',
};
