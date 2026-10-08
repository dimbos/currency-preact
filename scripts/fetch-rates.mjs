// Скачивает курсы ЦБ РФ (сегодня + тот же день за последние 5 лет)
// и сохраняет в public/rates.json — приложение на GitHub Pages читает
// этот файл со своего домена без CORS.
import { writeFileSync, mkdirSync } from 'node:fs';

const API = 'https://www.cbr-xml-daily.ru';
const CURRENCIES = ['USD', 'EUR', 'CNY'];

function fmt(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return { iso: `${d.getFullYear()}-${mm}-${dd}`, path: `${d.getFullYear()}/${mm}/${dd}` };
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function toRates(data) {
  const rates = {};
  for (const c of CURRENCIES) {
    const v = data.Valute[c];
    if (!v) throw new Error(`Нет валюты ${c} в ответе ЦБ`);
    rates[c] = v.Value / v.Nominal;
  }
  return rates;
}

const todayData = await fetchJson(`${API}/daily_json.js`);
if (!todayData) throw new Error('Курс ЦБ на сегодня недоступен');
const today = { date: todayData.Date.slice(0, 10), rates: toRates(todayData) };

const now = new Date();
const history = [];
for (let i = 1; i <= 5; i++) {
  const target = new Date(now.getFullYear() - i, now.getMonth(), now.getDate());
  const requestedDate = fmt(target).iso;
  const d = new Date(target);
  let entry = null;
  for (let attempt = 0; attempt < 14 && !entry; attempt++) {
    const { path } = fmt(d);
    const data = await fetchJson(`${API}/archive/${path}/daily_json.js`);
    if (data) entry = { requestedDate, date: data.Date.slice(0, 10), rates: toRates(data) };
    else d.setDate(d.getDate() - 1);
  }
  if (!entry) throw new Error(`Нет данных ЦБ около ${requestedDate}`);
  history.push(entry);
}

const out = { generatedAt: new Date().toISOString(), today, history };
mkdirSync('public', { recursive: true });
writeFileSync('public/rates.json', JSON.stringify(out));
console.log('rates.json обновлён:', today.date, today.rates);
