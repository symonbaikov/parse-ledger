'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, ClipboardList, DollarSign, Droplets, TrendingDown, TrendingUp } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';

type TabKey = 'cash' | 'raw' | 'debit' | 'credit';

interface FormState {
  date: string;
  amount: string;
  note: string;
}

interface Entry {
  id: string;
  date: string;
  amount: number;
  note: string;
}

const initialForm: FormState = { date: '', amount: '', note: '' };

export default function DataEntryPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('cash');
  const [forms, setForms] = useState<Record<TabKey, FormState>>({
    cash: { ...initialForm },
    raw: { ...initialForm },
    debit: { ...initialForm },
    credit: { ...initialForm },
  });
  const [entries, setEntries] = useState<Record<TabKey, Entry[]>>({
    cash: [],
    raw: [],
    debit: [],
    credit: [],
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const tabMeta: Record<TabKey, { label: string; icon: ReactNode; description: string }> = useMemo(
    () => ({
      cash: {
        label: 'Наличные',
        icon: <DollarSign className="h-4 w-4" />,
        description: 'Остатки наличных средств.',
      },
      raw: {
        label: 'Сырьё',
        icon: <ClipboardList className="h-4 w-4" />,
        description: 'Остатки по сырью или материалам.',
      },
      debit: {
        label: 'Дебет',
        icon: <TrendingUp className="h-4 w-4" />,
        description: 'Дебетовые операции / приход.',
      },
      credit: {
        label: 'Кредит',
        icon: <TrendingDown className="h-4 w-4" />,
        description: 'Кредитовые операции / расход.',
      },
    }),
    [],
  );

  const handleChange = (tab: TabKey, field: keyof FormState, value: string) => {
    setForms((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (tab: TabKey) => {
    const payload = forms[tab];
    if (!payload.date || !payload.amount) {
      setStatus({ type: 'error', message: 'Заполните дату и сумму' });
      return;
    }

    const amountNum = Number(payload.amount);
    if (Number.isNaN(amountNum)) {
      setStatus({ type: 'error', message: 'Сумма должна быть числом' });
      return;
    }

    const newEntry: Entry = {
      id: `${tab}-${Date.now()}`,
      date: payload.date,
      amount: amountNum,
      note: payload.note,
    };

    setEntries((prev) => ({
      ...prev,
      [tab]: [newEntry, ...prev[tab]],
    }));

    setForms((prev) => ({
      ...prev,
      [tab]: { ...initialForm },
    }));

    setStatus({ type: 'success', message: 'Данные сохранены (локально)' });
  };

  const currentForm = forms[activeTab];
  const currentMeta = tabMeta[activeTab];
  const currentEntries = entries[activeTab] || [];

  const formatDate = (value: string) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
        Загрузка...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
          <p className="text-gray-800 font-semibold mb-2">Войдите, чтобы вводить данные.</p>
          <p className="text-sm text-gray-600">Авторизация необходима для сохранения записей.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <Droplets className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ввод данных</h1>
          <p className="text-secondary mt-1">
            Фиксируйте остатки налички, сырья и движения по дебету/кредиту.
          </p>
        </div>
      </div>

      {status && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
            status.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{status.message}</span>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 flex flex-wrap">
          {(Object.keys(tabMeta) as TabKey[]).map((tab) => {
            const meta = tabMeta[tab];
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                {meta.icon}
                {meta.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 space-y-4">
          <div className="text-sm text-gray-600">{currentMeta.description}</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Дата</span>
              <input
                type="date"
                value={currentForm.date}
                onChange={(e) => handleChange(activeTab, 'date', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Сумма</span>
              <input
                type="number"
                value={currentForm.amount}
                onChange={(e) => handleChange(activeTab, 'amount', e.target.value)}
                placeholder="0.00"
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Комментарий</span>
              <input
                type="text"
                value={currentForm.note}
                onChange={(e) => handleChange(activeTab, 'note', e.target.value)}
                placeholder="Например, инкассация / поставщик / склад"
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleSubmit(activeTab)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Последние записи — {tabMeta[activeTab].label}</h3>
          </div>
          <span className="text-xs text-gray-500">Отображаются локально после сохранения</span>
        </div>

        {currentEntries.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-600">Пока нет записей для этой вкладки.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {currentEntries.map((entry) => (
              <div key={entry.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(entry.date)}</p>
                  <p className="text-xs text-gray-600">{entry.note || 'Без комментария'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{entry.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Сумма</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
