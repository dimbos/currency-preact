import { useEffect, useState } from 'preact/hooks';
import { Alert, App as AntdApp, ConfigProvider, Spin, Typography } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { getHistoryRates, getTodayRates, type HistoryEntry, type RatesResponse } from './api';
import { Converter } from './components/Converter';
import { RatesToday } from './components/RatesToday';
import { HistoryTable } from './components/HistoryTable';

dayjs.locale('ru');

export function App() {
  const [today, setToday] = useState<RatesResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getTodayRates(), getHistoryRates(5)])
      .then(([t, h]) => {
        setToday(t);
        setHistory(h);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <ConfigProvider locale={ruRU}>
      <AntdApp>
        <div className="page">
          <header className="page-header">
            <Typography.Title level={1} style={{ fontSize: 'inherit', margin: 0 }}>
              Конвертер валют
            </Typography.Title>
            <Typography.Text type="secondary">RUB ⇄ USD / EUR / CNY</Typography.Text>
          </header>

          {error && (
            <Alert type="error" showIcon message="Не удалось загрузить курсы" description={error} />
          )}

          {!today && !error && (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <Spin size="large" />
            </div>
          )}

          {today && (
            <>
              <Converter rates={today.rates} />
              <RatesToday date={today.date} rates={today.rates} />
            </>
          )}

          {history && <HistoryTable entries={history} />}

          <Typography.Text type="secondary" style={{ textAlign: 'center', fontSize: 12 }}>
            Данные: ЦБ РФ (cbr-xml-daily.ru)
          </Typography.Text>
        </div>
      </AntdApp>
    </ConfigProvider>
  );
}
