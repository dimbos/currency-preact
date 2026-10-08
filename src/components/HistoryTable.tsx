import { Card, Table, Typography } from 'antd';
import { formatRub, type HistoryEntry } from '../api';

export function HistoryTable({ entries }: { entries: HistoryEntry[] }) {
  return (
    <Card size="small" title="Курс в этот день — последние 5 лет">
      <Table<HistoryEntry>
        size="small"
        rowKey="requestedDate"
        pagination={false}
        dataSource={entries}
        scroll={{ x: true }}
        columns={[
          {
            title: 'Дата',
            dataIndex: 'date',
            render: (date: string) =>
              new Date(date + 'T00:00:00').toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }),
          },
          {
            title: 'USD',
            align: 'right',
            render: (_, r) => `${formatRub(r.rates.USD)} ₽`,
          },
          {
            title: 'EUR',
            align: 'right',
            render: (_, r) => `${formatRub(r.rates.EUR)} ₽`,
          },
          {
            title: 'CNY',
            align: 'right',
            render: (_, r) => `${formatRub(r.rates.CNY)} ₽`,
          },
        ]}
      />
      <Typography.Paragraph className="history-note" style={{ marginTop: 8, marginBottom: 0 }}>
        Если день пришёлся на выходной, показан курс ближайшего предыдущего рабочего дня.
      </Typography.Paragraph>
    </Card>
  );
}
