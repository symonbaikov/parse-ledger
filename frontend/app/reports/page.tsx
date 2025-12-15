'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Download,
  RefreshCcw,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import apiClient from '../lib/api';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

type SummaryResponse = {
  totals: {
    income: number;
    expense: number;
    net: number;
    rows: number;
  };
  timeseries: Array<{ date: string; income: number; expense: number }>;
  categories: Array<{ name: string; amount: number; rows: number }>;
  counterparties: Array<{ name: string; amount: number; rows: number }>;
  recent: Array<{
    id: string;
    rowNumber: number;
    amount: number;
    category: string | null;
    counterparty: string | null;
    updatedAt: string;
  }>;
};

type StatementsSummaryResponse = {
  totals: {
    income: number;
    expense: number;
    net: number;
    rows: number;
  };
  timeseries: Array<{ date: string; income: number; expense: number }>;
  categories: Array<{ name: string; amount: number; rows: number }>;
  counterparties: Array<{ name: string; amount: number; rows: number }>;
  recent: Array<{
    id: string;
    amount: number;
    category: string | null;
    counterparty: string | null;
    updatedAt: string;
  }>;
};

type StatementStatus = 'uploaded' | 'processing' | 'parsed' | 'validated' | 'completed' | 'error' | string;

type StatementItem = {
  id: string;
  fileName: string;
  status: StatementStatus;
  bankName?: string;
  totalTransactions?: number;
  createdAt: string;
  errorMessage?: string | null;
};

const formatCurrency = (value: number) =>
  `${value.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} KZT`;

const InfoCard = ({
  title,
  value,
  accent,
  icon,
}: {
  title: string;
  value: string;
  accent?: 'green' | 'red' | 'blue';
  icon?: React.ReactNode;
}) => {
  const color =
    accent === 'green' ? 'text-emerald-600' : accent === 'red' ? 'text-red-600' : 'text-primary';
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{title}</div>
        {icon}
      </div>
      <div className={`mt-2 text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
};

export default function ReportsPage() {
  const [tab, setTab] = useState<'sheets' | 'statements'>('sheets');
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [statements, setStatements] = useState<StatementItem[]>([]);
  const [loadingStatements, setLoadingStatements] = useState(false);
  const [statementSummary, setStatementSummary] = useState<StatementsSummaryResponse | null>(null);
  const [loadingStatementSummary, setLoadingStatementSummary] = useState(false);

  const load = async (daysOverride?: number) => {
    const windowDays = daysOverride ?? days;
    setLoading(true);
    setError(null);
    try {
      const resp = await apiClient.get(`/integrations/google-sheets/summary?days=${windowDays}`);
      const payload = resp.data?.data || resp.data;
      setData(payload);
      setDays(windowDays);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось загрузить отчёт');
    } finally {
      setLoading(false);
    }
  };

  const loadStatementSummary = async (daysOverride: number = 30) => {
    setLoadingStatementSummary(true);
    setError(null);
    try {
      const resp = await apiClient.get(`/reports/statements/summary?days=${daysOverride}`);
      const payload = resp.data?.data || resp.data;
      setStatementSummary(payload);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось загрузить статистику по выпискам');
    } finally {
      setLoadingStatementSummary(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const loadStatements = async () => {
    setLoadingStatements(true);
    setError(null);
    try {
      const resp = await apiClient.get('/statements');
      const payload = resp.data?.data || resp.data || [];
      setStatements(payload);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось загрузить данные по выпискам');
    } finally {
      setLoadingStatements(false);
    }
  };

  useEffect(() => {
    if (tab === 'statements' && statements.length === 0) {
      loadStatements();
      loadStatementSummary();
    }
  }, [tab]);

  const cashflowOption = useMemo(() => {
    if (!data) return undefined;
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Приход', 'Расход'] },
      grid: { left: 30, right: 30, bottom: 30, top: 30 },
      xAxis: { type: 'category', data: data.timeseries.map((p) => p.date) },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Приход',
          type: 'line',
          smooth: true,
          data: data.timeseries.map((p) => p.income),
          areaStyle: { color: 'rgba(16,185,129,0.15)' },
          lineStyle: { color: '#10b981' },
          itemStyle: { color: '#10b981' },
        },
        {
          name: 'Расход',
          type: 'line',
          smooth: true,
          data: data.timeseries.map((p) => p.expense),
          areaStyle: { color: 'rgba(239,68,68,0.08)' },
          lineStyle: { color: '#ef4444' },
          itemStyle: { color: '#ef4444' },
        },
      ],
    };
  }, [data]);

  const expensePieOption = useMemo(() => {
    if (!data) return undefined;
    return {
      tooltip: { trigger: 'item' },
      legend: { top: 'bottom' },
      series: [
        {
          name: 'Расходы',
          type: 'pie',
          radius: ['30%', '70%'],
          roseType: 'radius',
          data: data.categories.map((c) => ({
            name: c.name,
            value: Number(c.amount.toFixed(2)),
          })),
        },
      ],
    };
  }, [data]);

  const incomeBarOption = useMemo(() => {
    if (!data) return undefined;
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 80, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'value' },
      yAxis: {
        type: 'category',
        data: data.counterparties.map((c) => c.name),
      },
      series: [
        {
          type: 'bar',
          data: data.counterparties.map((c) => Number(c.amount.toFixed(2))),
          itemStyle: {
            color: '#3b82f6',
            borderRadius: [4, 4, 4, 4],
          },
        },
      ],
    };
  }, [data]);

  const parsedStatements = useMemo(() => {
    if (!statements || statements.length === 0) {
      return {
        total: 0,
        processed: 0,
        processing: 0,
        errors: 0,
        totalTransactions: 0,
        lastDate: null as string | null,
        recentErrors: [] as StatementItem[],
        timeseries: [] as Array<{ date: string; count: number }>,
        banks: [] as Array<{ name: string; value: number }>,
        statuses: [] as Array<{ name: string; value: number }>,
      };
    }
    const total = statements.length;
    const processedStatuses = new Set(['parsed', 'validated', 'completed']);
    const processingStatuses = new Set(['processing']);

    let processed = 0;
    let processing = 0;
    let errors = 0;
    let totalTransactions = 0;
    let lastDate: string | null = null;
    const errorItems: StatementItem[] = [];
    const timeseriesMap = new Map<string, number>();
    const bankMap = new Map<string, number>();
    const statusMap = new Map<string, number>();

    statements.forEach((s) => {
      if (processedStatuses.has(s.status)) processed += 1;
      if (processingStatuses.has(s.status)) processing += 1;
      if (s.status === 'error') {
        errors += 1;
        errorItems.push(s);
      }
      totalTransactions += Number(s.totalTransactions || 0);
      if (!lastDate || new Date(s.createdAt) > new Date(lastDate)) {
        lastDate = s.createdAt;
      }

      const dateKey = s.createdAt ? s.createdAt.split('T')[0] : '—';
      timeseriesMap.set(dateKey, (timeseriesMap.get(dateKey) || 0) + 1);
      const bankKey = s.bankName || 'Без банка';
      bankMap.set(bankKey, (bankMap.get(bankKey) || 0) + 1);
      statusMap.set(s.status, (statusMap.get(s.status) || 0) + 1);
    });

    return {
      total,
      processed,
      processing,
      errors,
      totalTransactions,
      lastDate,
      recentErrors: errorItems.slice(0, 5),
      timeseries: Array.from(timeseriesMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      banks: Array.from(bankMap.entries()).map(([name, value]) => ({ name, value })),
      statuses: Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })),
    };
  }, [statements]);

  const statementsLineOption = useMemo(() => {
    const ts = parsedStatements.timeseries;
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 30, right: 30, bottom: 30, top: 30 },
      xAxis: { type: 'category', data: ts.map((p) => p.date) },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Выписки',
          type: 'line',
          smooth: true,
          data: ts.map((p) => p.count),
          areaStyle: { color: 'rgba(37,99,235,0.12)' },
          lineStyle: { color: '#2563eb' },
          itemStyle: { color: '#2563eb' },
        },
      ],
    };
  }, [parsedStatements.timeseries]);

  const statementsPieOption = useMemo(() => {
    return {
      tooltip: { trigger: 'item' },
      legend: { top: 'bottom' },
      series: [
        {
          name: 'Банки',
          type: 'pie',
          radius: ['30%', '70%'],
          data: parsedStatements.banks.map((b) => ({ name: b.name, value: b.value })),
        },
      ],
    };
  }, [parsedStatements.banks]);

  const statementsBarOption = useMemo(() => {
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 60, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: parsedStatements.statuses.map((s) => s.name) },
      series: [
        {
          type: 'bar',
          data: parsedStatements.statuses.map((s) => s.value),
          itemStyle: { color: '#0f172a', borderRadius: [4, 4, 4, 4] },
        },
      ],
    };
  }, [parsedStatements.statuses]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Отчёты</h1>
          <p className="text-secondary mt-1">
            Сводка приходов, расходов и чистого потока. Переключайтесь между данными Google Sheets и
            парсингом выписок.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTab('sheets');
            }}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
              tab === 'sheets'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
            }`}
          >
            Google Sheets
          </button>
          <button
            onClick={() => {
              setTab('statements');
            }}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
              tab === 'statements'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
            }`}
          >
            Парсинг выписок
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {tab === 'sheets' && (
        <>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => load(d)}
                className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                  days === d
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                }`}
              >
                {d} дн
              </button>
            ))}
            <button
              onClick={() => load(days)}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 hover:border-primary"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
            <InfoCard
              title="Приход"
              value={formatCurrency(data?.totals.income || 0)}
              accent="green"
              icon={<ArrowUp className="h-4 w-4 text-emerald-500" />}
            />
            <InfoCard
              title="Расход"
              value={formatCurrency(data?.totals.expense || 0)}
              accent="red"
              icon={<ArrowDown className="h-4 w-4 text-red-500" />}
            />
            <InfoCard
              title="Чистый поток"
              value={formatCurrency(data?.totals.net || 0)}
              accent={(data?.totals.net || 0) >= 0 ? 'green' : 'red'}
              icon={<TrendingUp className="h-4 w-4 text-primary" />}
            />
            <InfoCard title="Строк" value={`${data?.totals.rows || 0}`} icon={<Download className="h-4 w-4 text-primary" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Динамика по дням</h3>
                <span className="text-xs text-gray-500">За последние {days} дней</span>
              </div>
              {loading ? (
                <div className="h-64 flex items-center justify-center text-gray-500">Загрузка…</div>
              ) : (
                <ReactECharts
                  style={{ height: 320 }}
                  option={cashflowOption}
                  notMerge
                  lazyUpdate
                  theme="light"
                />
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Категории расходов</h3>
                <span className="text-xs text-gray-500">Top-10</span>
              </div>
              {loading ? (
                <div className="h-64 flex items-center justify-center text-gray-500">Загрузка…</div>
              ) : (
                <ReactECharts style={{ height: 280 }} option={expensePieOption} notMerge lazyUpdate />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Приходы по контрагентам</h3>
                <span className="text-xs text-gray-500">Top-10</span>
              </div>
              {loading ? (
                <div className="h-64 flex items-center justify-center text-gray-500">Загрузка…</div>
              ) : (
                <ReactECharts style={{ height: 280 }} option={incomeBarOption} notMerge lazyUpdate />
              )}
            </div>

            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Последние операции</h3>
                <span className="text-xs text-gray-500">20 строк</span>
              </div>
              <div className="divide-y divide-gray-100">
                {(data?.recent || []).map((row) => (
                  <div key={row.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {row.counterparty || 'Без названия'} · #{row.rowNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {row.category || 'Без категории'} · {new Date(row.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className={`text-sm font-semibold ${row.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(row.amount)}
                    </div>
                  </div>
                ))}
                {(data?.recent || []).length === 0 && (
                  <div className="py-6 text-sm text-gray-500 text-center">Нет данных за выбранный период</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'statements' && (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadStatements();
                loadStatementSummary();
              }}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 hover:border-primary flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" /> Обновить
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
            <InfoCard title="Всего" value={`${parsedStatements.total}`} icon={<FileText className="h-4 w-4 text-primary" />} />
            <InfoCard
              title="Обработано"
              value={`${parsedStatements.processed}`}
              accent="green"
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            />
            <InfoCard
              title="В процессе"
              value={`${parsedStatements.processing}`}
              accent="blue"
              icon={<RefreshCcw className="h-4 w-4 text-primary" />}
            />
            <InfoCard
              title="Ошибки"
              value={`${parsedStatements.errors}`}
              accent="red"
              icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
            <InfoCard
              title="Приход"
              value={formatCurrency(statementSummary?.totals.income || 0)}
              accent="green"
              icon={<ArrowDown className="h-4 w-4 text-emerald-500" />}
            />
            <InfoCard
              title="Расход"
              value={formatCurrency(statementSummary?.totals.expense || 0)}
              accent="red"
              icon={<ArrowUp className="h-4 w-4 text-red-500" />}
            />
            <InfoCard
              title="Чистый поток"
              value={formatCurrency(statementSummary?.totals.net || 0)}
              accent={(statementSummary?.totals.net || 0) >= 0 ? 'green' : 'red'}
              icon={<TrendingUp className="h-4 w-4 text-primary" />}
            />
            <InfoCard
              title="Операции"
              value={`${statementSummary?.totals.rows || 0}`}
              icon={<FileText className="h-4 w-4 text-primary" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Динамика загрузок</h3>
                <span className="text-xs text-gray-500">По датам загрузки</span>
              </div>
              {loadingStatements || loadingStatementSummary ? (
                <div className="h-64 flex items-center justify-center text-gray-500">Загрузка…</div>
              ) : (
                <ReactECharts
                  style={{ height: 320 }}
                  option={statementsLineOption}
                  notMerge
                  lazyUpdate
                  theme="light"
                />
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Банки</h3>
                <span className="text-xs text-gray-500">Top</span>
              </div>
              {loadingStatements ? (
                <div className="h-64 flex items-center justify-center text-gray-500">Загрузка…</div>
              ) : (
                <ReactECharts style={{ height: 280 }} option={statementsPieOption} notMerge lazyUpdate />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Статусы</h3>
                <span className="text-xs text-gray-500">Распределение</span>
              </div>
              {loadingStatements ? (
                <div className="h-64 flex items-center justify-center text-gray-500">Загрузка…</div>
              ) : (
                <ReactECharts style={{ height: 280 }} option={statementsBarOption} notMerge lazyUpdate />
              )}
            </div>

            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Последние загрузки</h3>
                <span className="text-xs text-gray-500">до 10 записей</span>
              </div>
              {loadingStatements ? (
                <div className="py-6 text-sm text-gray-500 text-center">Загрузка...</div>
              ) : statements.length === 0 ? (
                <div className="py-6 text-sm text-gray-500 text-center">Нет данных</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {statements.slice(0, 10).map((s) => (
                    <div key={s.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {s.bankName || '—'} · {new Date(s.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-600">
                        <p className="font-semibold capitalize">{s.status}</p>
                        <p>{s.totalTransactions || 0} транзакций</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
