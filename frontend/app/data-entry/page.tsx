'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { CheckCircle2, ClipboardList, DollarSign, Droplets, TrendingDown, TrendingUp, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import apiClient from '@/app/lib/api';

type TabKey = 'cash' | 'raw' | 'debit' | 'credit';

interface FormState {
  date: string;
  amount: string;
  note: string;
  currency: string;
}

interface Entry {
  id: string;
  date: string;
  amount: number;
  note: string;
  currency?: string;
}

const initialForm: FormState = { date: '', amount: '', note: '', currency: 'KZT' };

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
  const [saving, setSaving] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const currencies = useMemo(
    () => [
      { code: 'KZT', label: 'KZT (Казахстан)' },
      { code: 'USD', label: 'USD (США)' },
      { code: 'EUR', label: 'EUR (Еврозона)' },
      { code: 'RUB', label: 'RUB (Россия)' },
    ],
    [],
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

    setSaving(true);
    setError(null);
    apiClient
      .post('/data-entry', {
        type: tab,
        date: payload.date,
        amount: amountNum,
        note: payload.note || undefined,
        currency: payload.currency || 'KZT',
      })
      .then((resp) => {
        const savedRaw: Entry = resp.data?.data || resp.data;
        const amountNumSafe = Number((savedRaw as any)?.amount);
        const saved: Entry = {
          ...savedRaw,
          amount: Number.isNaN(amountNumSafe) ? 0 : amountNumSafe,
          currency: savedRaw?.currency || 'KZT',
        };
        setEntries((prev) => ({
          ...prev,
          [tab]: [saved, ...(prev[tab] || [])],
        }));
        setForms((prev) => ({
          ...prev,
          [tab]: { ...initialForm },
        }));
        setStatus({ type: 'success', message: 'Данные сохранены' });
      })
      .catch((err) => {
        const message = err?.response?.data?.message || 'Не удалось сохранить данные';
        setStatus({ type: 'error', message });
      })
      .finally(() => setSaving(false));
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

  const loadEntries = (tab: TabKey) => {
    setLoadingList(true);
    setError(null);
    apiClient
      .get(`/data-entry?type=${tab}&limit=20`)
      .then((resp) => {
        const rawItems: Entry[] =
          resp.data?.items || resp.data?.data?.items || resp.data?.data || [];
        const items = rawItems.map((item) => {
          const amountNum = Number((item as any)?.amount);
          return {
            ...item,
            amount: Number.isNaN(amountNum) ? 0 : amountNum,
            currency: (item as any)?.currency || 'KZT',
          };
        });
        setEntries((prev) => ({
          ...prev,
          [tab]: items,
        }));
      })
      .catch((err) => {
        const message = err?.response?.data?.message || 'Не удалось загрузить записи';
        setError(message);
      })
      .finally(() => setLoadingList(false));
  };

  // Load on tab change
  useEffect(() => {
    if (!user) return;
    if ((entries[activeTab] || []).length === 0) {
      loadEntries(activeTab);
    }
  }, [activeTab, user]);

  const handleDelete = (entryId: string) => {
    setRemovingId(entryId);
    apiClient
      .delete(`/data-entry/${entryId}`)
      .then(() => {
        setEntries((prev) => ({
          ...prev,
          [activeTab]: (prev[activeTab] || []).filter((e) => e.id !== entryId),
        }));
        setStatus({ type: 'success', message: 'Запись удалена' });
      })
      .catch((err) => {
        const message = err?.response?.data?.message || 'Не удалось удалить запись';
        setStatus({ type: 'error', message });
      })
      .finally(() => setRemovingId(null));
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

      {(status || error) && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
            status?.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{status?.message || error}</span>
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
                onClick={() => {
                   setActiveTab(tab);
                   setCalendarOpen(false); // Close calendar on tab switch
                }}
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <span className="text-sm font-medium text-gray-700 block mb-1">Дата</span>
              <div 
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm flex items-center justify-between cursor-pointer transition-colors ${
                   calendarOpen ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCalendarOpen(!calendarOpen)}
              >
                 <span className={currentForm.date ? 'text-gray-900' : 'text-gray-400'}>
                    {currentForm.date 
                      ? format(new Date(currentForm.date), 'd MMMM yyyy', { locale: ru }) 
                      : 'Выберите дату'}
                 </span>
                 <CalendarIcon className="h-4 w-4 text-gray-500" />
              </div>

              {calendarOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setCalendarOpen(false)} 
                  />
                  <div className="absolute top-full left-0 mt-2 z-20 bg-white rounded-xl shadow-xl border border-gray-200 p-3 animate-in fade-in zoom-in-95 duration-200">
                     <style>{`
                       .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #0a66c2; --rdp-background-color: #e3f2fd; margin: 0; }
                       .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f3f2ef; font-weight: bold; }
                       .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { background-color: var(--rdp-accent-color); color: white; font-weight: bold; }
                       .rdp-head_cell { color: #666; font-weight: 600; font-size: 0.875rem; }
                       .rdp-caption_label { font-weight: 700; color: #191919; font-size: 1rem; }
                       .rdp-nav_button { color: #666; }
                       .rdp-nav_button:hover { background-color: #f3f2ef; color: #0a66c2; }
                     `}</style>
                     <DayPicker
                       mode="single"
                       selected={currentForm.date ? new Date(currentForm.date) : undefined}
                       onSelect={(day) => {
                         if (day) {
                           handleChange(activeTab, 'date', format(day, 'yyyy-MM-dd'));
                           setCalendarOpen(false);
                         }
                       }}
                       locale={ru}
                       className="rounded-lg"
                     />
                  </div>
                </>
              )}
            </div>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 block mb-1">Сумма</span>
              <input
                type="number"
                value={currentForm.amount}
                onChange={(e) => handleChange(activeTab, 'amount', e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 block mb-1">Комментарий</span>
              <input
                type="text"
                value={currentForm.note}
                onChange={(e) => handleChange(activeTab, 'note', e.target.value)}
                placeholder="Например, инкассация / поставщик / склад"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 block mb-1">Валюта</span>
              <div className="mt-1 w-full rounded-lg border border-gray-200 bg-white text-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <select
                  className="w-full bg-transparent px-3 py-2 outline-none"
                  value={currentForm.currency}
                  onChange={(e) => handleChange(activeTab, 'currency', e.target.value)}
                >
                  {currencies.map((cur) => (
                    <option key={cur.code} value={cur.code}>
                      {cur.code} — {cur.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {currencies.map((cur) => (
                  <button
                    key={cur.code}
                    type="button"
                    onClick={() => handleChange(activeTab, 'currency', cur.code)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                      currentForm.currency === cur.code
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 text-gray-700 hover:border-primary'
                    }`}
                  >
                    {cur.code}
                  </button>
                ))}
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleSubmit(activeTab)}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary-hover hover:shadow-primary/40 focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              Сохранить запись
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-gray-50/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Последние записи — {tabMeta[activeTab].label}</h3>
          </div>
          <span className="text-xs text-gray-500 font-medium">Отображаются последние записи из базы</span>
        </div>

        {loadingList ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">Загрузка данных...</div>
          ) : currentEntries.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500 flex flex-col items-center">
             <div className="bg-gray-100 p-3 rounded-full mb-3">
                <ClipboardList className="h-6 w-6 text-gray-400" />
             </div>
             Пока нет записей для этой вкладки
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {currentEntries.map((entry) => (
              <div key={entry.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/80 transition-colors group">
                <div>
                  <div className="flex items-center gap-2">
                     <p className="text-sm font-bold text-gray-900">{format(new Date(entry.date), 'dd.MM.yyyy')}</p>
                     <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{tabMeta[activeTab].label}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{entry.note || 'Без комментария'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 font-mono">
                      {Number(entry.amount || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold text-right">
                      {entry.currency || 'KZT'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={removingId === entry.id}
                    className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Удалить запись"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
