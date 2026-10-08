export type Currency = 'USD' | 'EUR' | 'CNY';

export const CURRENCIES: Currency[] = ['USD', 'EUR', 'CNY'];

export const CURRENCY_META: Record<Currency, { symbol: string; name: string }> = {
  USD: { symbol: '$', name: 'Доллар США' },
  EUR: { symbol: '€', name: 'Евро' },
  CNY: { symbol: '¥', name: 'Китайский юань' },
};

/** Курсы: сколько рублей стоит 1 единица валюты */
export type RubRates = Record<Currency, number>;

export interface RatesResponse {
  /** Дата курса в формате YYYY-MM-DD */
  date: string;
  rates: RubRates;
}

// В dev-режиме запросы идут через прокси Vite (/cbr → cbr-xml-daily.ru),
// чтобы избежать блокировок CORS на локальной машине.
// В продакшн-сборке (GitHub Pages) — напрямую: у API ЦБ открыт CORS (*).
const API_BASE = import.meta.env.DEV ? '/cbr' : 'https://www.cbr-xml-daily.ru';

interface CbrResponse {
  Date: string;
  Valute: Record<string, { Value: number; Nominal: number }>;
}

function toRates(data: CbrResponse): RubRates {
  const rates = {} as RubRates;
  for (const c of CURRENCIES) {
    const v = data.Valute[c];
    if (!v) throw new Error(`В ответе ЦБ нет валюты ${c}`);
    rates[c] = v.Value / v.Nominal;
  }
  return rates;
}

function fmtDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function fetchCbr(url: string): Promise<CbrResponse | null> {
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Ошибка загрузки курсов: HTTP ${res.status}`);
  return (await res.json()) as CbrResponse;
}

export async function getTodayRates(): Promise<RatesResponse> {
  const data = await fetchCbr(`${API_BASE}/daily_json.js`);
  if (!data) throw new Error('Курс ЦБ на сегодня недоступен');
  return { date: data.Date.slice(0, 10), rates: toRates(data) };
}

export interface HistoryEntry {
  /** Запрошенная дата (тот же день N лет назад), YYYY-MM-DD */
  requestedDate: string;
  /** Фактическая дата курса (ближайший предыдущий день с данными) */
  date: string;
  rates: RubRates;
}

export async function getHistoryRates(years = 5): Promise<HistoryEntry[]> {
  const now = new Date();
  const tasks: Promise<HistoryEntry>[] = [];
  for (let i = 1; i <= years; i++) {
    tasks.push(fetchHistoryFor(new Date(now.getFullYear() - i, now.getMonth(), now.getDate())));
  }
  return Promise.all(tasks);
}

async function fetchHistoryFor(target: Date): Promise<HistoryEntry> {
  const requestedDate = fmtDate(target);
  const d = new Date(target);
  // В выходные и праздники архива нет - шагаем назад до ближайшего дня с данными
  for (let attempt = 0; attempt < 14; attempt++) {
    const day = fmtDate(d);
    const [yyyy, mm, dd] = day.split('-');
    const data = await fetchCbr(`${API_BASE}/archive/${yyyy}/${mm}/${dd}/daily_json.js`);
    if (data) {
      return { requestedDate, date: data.Date.slice(0, 10), rates: toRates(data) };
    }
    d.setDate(d.getDate() - 1);
  }
  throw new Error(`Нет данных ЦБ около даты ${requestedDate}`);
}

export function formatRub(value: number): string {
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
