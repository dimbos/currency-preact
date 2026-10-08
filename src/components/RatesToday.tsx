import { Card, Typography } from 'antd';
import { CURRENCIES, CURRENCY_META, formatRub, type RubRates } from '../api';

export function RatesToday({ date, rates }: { date: string; rates: RubRates }) {
  return (
    <Card
      size="small"
      title="Курс сегодня"
      extra={
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {new Date(date + 'T00:00:00').toLocaleDateString('ru-RU')}
        </Typography.Text>
      }
    >
      <div className="rates-grid">
        {CURRENCIES.map((c) => (
          <Card key={c} size="small" className="rate-card">
            <div className="rate-name">
              {c} {CURRENCY_META[c].symbol}
            </div>
            <div className="rate-value">{formatRub(rates[c])} ₽</div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
