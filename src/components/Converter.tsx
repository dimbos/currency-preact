import { useState } from 'preact/hooks';
import { Button, Card, InputNumber, Select, Space, Typography } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { CURRENCIES, CURRENCY_META, formatRub, type Currency, type RubRates } from '../api';

type AnyCurrency = Currency | 'RUB';

const ALL_CURRENCIES: AnyCurrency[] = ['RUB', ...CURRENCIES];

const META: Record<AnyCurrency, string> = {
  RUB: 'Российский рубль',
  USD: CURRENCY_META.USD.name,
  EUR: CURRENCY_META.EUR.name,
  CNY: CURRENCY_META.CNY.name,
};

function rateInRub(c: AnyCurrency, rates: RubRates): number {
  return c === 'RUB' ? 1 : rates[c];
}

export function Converter({ rates }: { rates: RubRates }) {
  const [amount, setAmount] = useState('1000');
  const [from, setFrom] = useState<AnyCurrency>('RUB');
  const [to, setTo] = useState<AnyCurrency>('USD');

  const value = Number(amount.replace(',', '.')) || 0;
  const fromRate = rateInRub(from, rates);
  const toRate = rateInRub(to, rates);
  const converted = toRate ? (value * fromRate) / toRate : 0;
  const result = `${converted.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${to}`;

  const currencyOptions = ALL_CURRENCIES.map((c) => ({ value: c, label: c }));

  return (
    <Card title="Конвертер" size="small">
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Space.Compact block>
          <InputNumber<string>
            style={{ flex: 1, width: '100%' }}
            size="large"
            stringMode
            value={amount}
            onChange={(v) => setAmount((v ?? '').replace(/[^\d.,]/g, ''))}
            placeholder="Сумма"
            inputMode="decimal"
          />
          <Select
            size="large"
            value={from}
            onChange={setFrom}
            style={{ width: 110 }}
            options={currencyOptions}
          />
        </Space.Compact>
        <div style={{ textAlign: 'center' }}>
          <Button
            type="text"
            icon={<SwapOutlined rotate={90} />}
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
          />
        </div>
        <Space.Compact block>
          <InputNumber
            style={{ flex: 1, width: '100%' }}
            size="large"
            value={converted}
            readOnly
            placeholder="Результат"
            inputMode="decimal"
          />
          <Select
            size="large"
            value={to}
            onChange={setTo}
            style={{ width: 110 }}
            options={currencyOptions}
          />
        </Space.Compact>
        <div className="converter-result">
          <SwapOutlined style={{ marginRight: 8, color: '#1677ff' }} />
          {result}
        </div>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          1 {from} ({META[from]}) ={' '}
          {(toRate ? fromRate / toRate : 0).toLocaleString('ru-RU', { maximumFractionDigits: 4 })}{' '}
          {to} · 1 USD = {formatRub(rates.USD)} ₽
        </Typography.Text>
      </Space>
    </Card>
  );
}
