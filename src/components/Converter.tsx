import { useState } from 'preact/hooks';
import { Card, InputNumber, Segmented, Select, Space, Typography } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { CURRENCIES, CURRENCY_META, formatRub, type Currency, type RubRates } from '../api';

type Direction = 'rub-to-cur' | 'cur-to-rub';

export function Converter({ rates }: { rates: RubRates }) {
  const [amount, setAmount] = useState<number | null>(1000);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [direction, setDirection] = useState<Direction>('rub-to-cur');

  const rate = rates[currency];
  const value = amount ?? 0;
  const result =
    direction === 'rub-to-cur'
      ? `${(rate ? value / rate : 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
      : `${formatRub(value * rate)} ₽`;

  return (
    <Card title="Конвертер" size="small">
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Segmented
          block
          value={direction}
          onChange={(v) => setDirection(v as Direction)}
          options={[
            { label: 'RUB → валюта', value: 'rub-to-cur' },
            { label: 'Валюта → RUB', value: 'cur-to-rub' },
          ]}
        />
        <Space.Compact block>
          <InputNumber
            style={{ flex: 1, width: '100%' }}
            size="large"
            min={0}
            value={amount}
            onChange={(v) => setAmount(v)}
            placeholder="Сумма"
            inputMode="decimal"
          />
          <Select
            size="large"
            value={currency}
            onChange={setCurrency}
            style={{ width: 110 }}
            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
          />
        </Space.Compact>
        <div className="converter-result">
          <SwapOutlined style={{ marginRight: 8, color: '#1677ff' }} />
          {result}
        </div>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          1 {currency} ({CURRENCY_META[currency].name}) = {formatRub(rate)} ₽
        </Typography.Text>
      </Space>
    </Card>
  );
}
