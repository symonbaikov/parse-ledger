'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { Icon } from '@iconify/react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Droplets,
  Loader2,
  Plus,
  Table,
  TrendingDown,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import apiClient from '@/app/lib/api';

type BaseTabKey = 'cash' | 'raw' | 'debit' | 'credit';
type CustomFieldTabKey = `field:${string}`;
type TabKey = BaseTabKey | 'custom' | CustomFieldTabKey;

interface FormState {
  date: string;
  amount: string;
  note: string;
  currency: string;
  customFieldName: string;
  customFieldIcon: string;
  customFieldValue: string;
}

interface Entry {
  id: string;
  date: string;
  amount: number;
  note: string;
  currency?: string;
  customFieldName?: string | null;
  customFieldIcon?: string | null;
  customFieldValue?: string | null;
}

type CustomField = {
  id: string;
  name: string;
  icon: string | null;
  entriesCount?: number;
};

const initialForm: FormState = {
  date: '',
  amount: '',
  note: '',
  currency: 'KZT',
  customFieldName: '',
  customFieldIcon: 'mdi:tag',
  customFieldValue: '',
};

const CUSTOM_FIELD_ICONS = [
  'mdi:tag',
  'mdi:briefcase',
  'mdi:account',
  'mdi:account-group',
  'mdi:cash',
  'mdi:shopping',
  'mdi:warehouse',
  'mdi:truck',
  'mdi:office-building',
  'mdi:home',
  'mdi:chart-line',
  'mdi:file-document-outline',
  'mdi:calendar',
  'mdi:star',
];

export default function DataEntryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const customFieldRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('cash');
  const [forms, setForms] = useState<Record<string, FormState>>({
    cash: { ...initialForm },
    raw: { ...initialForm },
    debit: { ...initialForm },
    credit: { ...initialForm },
  });
  const [entries, setEntries] = useState<Record<string, Entry[]>>({});
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loadingCustomFields, setLoadingCustomFields] = useState(false);
  const [creatingCustomField, setCreatingCustomField] = useState(false);
  const [newCustomFieldName, setNewCustomFieldName] = useState('');
  const [newCustomFieldIcon, setNewCustomFieldIcon] = useState('mdi:tag');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    fieldId: string;
    fieldName: string;
    entriesCount: number;
  }>({ open: false, fieldId: '', fieldName: '', entriesCount: 0 });
  const [deletingTab, setDeletingTab] = useState(false);
  const [exportingTabToTable, setExportingTabToTable] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const iconInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [customIconOpen, setCustomIconOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportingTable, setExportingTable] = useState(false);
  const [customFieldHighlight, setCustomFieldHighlight] = useState(false);
  const currencies = useMemo(
    () => [
      { code: 'KZT', label: 'KZT (Казахстан)' },
      { code: 'USD', label: 'USD (США)' },
      { code: 'EUR', label: 'EUR (Еврозона)' },
      { code: 'RUB', label: 'RUB (Россия)' },
    ],
    [],
  );

  const tabMeta: Record<BaseTabKey | 'custom', { label: string; icon: ReactNode; description: string }> = useMemo(
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
      custom: {
        label: 'Пользовательская',
        icon: <Plus className="h-4 w-4" />,
        description:
          'Создайте пользовательскую вкладку (название + иконка). После создания она появится сверху рядом с другими вкладками.',
      },
    }),
    [],
  );

  const handleChange = (tab: TabKey, field: keyof FormState, value: string) => {
    setForms((prev) => ({
      ...prev,
      [tab]: {
        ...(prev[tab] || { ...initialForm }),
        [field]: value,
      },
    }));
  };

  const handleSubmit = (tab: TabKey) => {
    const payload = forms[tab] || initialForm;
    if (tab === 'custom') {
      setStatus({ type: 'error', message: 'Для этой вкладки используйте создание колонки' });
      return;
    }
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
    const isFieldTabValue = tab.startsWith('field:');
    const fieldId = isFieldTabValue ? tab.slice('field:'.length) : null;
    const field = fieldId ? customFields.find((f) => f.id === fieldId) || null : null;
    const submitType: BaseTabKey = isFieldTabValue ? 'cash' : (tab as BaseTabKey);
    apiClient
      .post('/data-entry', {
        type: submitType,
        ...(isFieldTabValue && fieldId ? { customTabId: fieldId } : {}),
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
        if (isFieldTab(tab)) {
          const fieldId = getFieldId(tab);
          setCustomFields((prev) =>
            prev.map((f) =>
              f.id === fieldId
                ? { ...f, entriesCount: Number(f.entriesCount || 0) + 1 }
                : f,
            ),
          );
        }
        setForms((prev) => ({
          ...prev,
          [tab]: {
            ...initialForm,
            customFieldName: '',
            customFieldIcon: initialForm.customFieldIcon,
          },
        }));
        setStatus({ type: 'success', message: 'Данные сохранены' });
      })
      .catch((err) => {
        const message = err?.response?.data?.message || 'Не удалось сохранить данные';
        setStatus({ type: 'error', message });
      })
      .finally(() => setSaving(false));
  };

  const currentForm = forms[activeTab] || initialForm;
  const currentMeta = tabMeta[activeTab as BaseTabKey] || tabMeta.custom;
  const currentEntries = entries[activeTab] || [];

  const isBaseTab = (tab: TabKey): tab is BaseTabKey =>
    tab === 'cash' || tab === 'raw' || tab === 'debit' || tab === 'credit';
  const isFieldTab = (tab: TabKey): tab is CustomFieldTabKey => tab.startsWith('field:');
  const getFieldId = (tab: CustomFieldTabKey) => tab.slice('field:'.length);

  const getTabLabel = (tab: TabKey): string => {
    if (isBaseTab(tab)) return tabMeta[tab].label;
    if (tab === 'custom') return tabMeta.custom.label;
    const fieldId = getFieldId(tab);
    const field = customFields.find((f) => f.id === fieldId);
    return field?.name || 'Пользовательская';
  };

  const getTabIcon = (tab: TabKey): ReactNode => {
    if (isBaseTab(tab)) return tabMeta[tab].icon;
    if (tab === 'custom') return tabMeta.custom.icon;
    const fieldId = getFieldId(tab);
    const field = customFields.find((f) => f.id === fieldId);
    return <Icon icon={field?.icon || 'mdi:tag'} className="h-4 w-4" />;
  };

  const renderIconPreview = (icon: string, className?: string) => {
    if (!icon) return null;
    if (icon.startsWith('http')) {
      return <img src={icon} alt="icon" className={`h-5 w-5 ${className || ''}`} />;
    }
    if (icon.startsWith('/uploads')) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const baseUrl = apiUrl.replace('/api/v1', '');
      const fullUrl = baseUrl + icon;
      return <img src={fullUrl} alt="icon" className={`h-5 w-5 ${className || ''}`} />;
    }
    return <Icon icon={icon} className={`h-5 w-5 ${className || ''}`} />;
  };

  const formatDate = (value: string) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  };

  const loadEntries = (tab: BaseTabKey) => {
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

  const loadCustomTabEntries = (customTabId: string, tabKey: CustomFieldTabKey) => {
    setLoadingList(true);
    setError(null);
    apiClient
      .get(`/data-entry?customTabId=${customTabId}&limit=20`)
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
          [tabKey]: items,
        }));
      })
      .catch((err) => {
        const message = err?.response?.data?.message || 'Не удалось загрузить записи';
        setError(message);
      })
      .finally(() => setLoadingList(false));
  };

  const loadCustomFields = () => {
    setLoadingCustomFields(true);
    setError(null);
    apiClient
      .get('/data-entry/custom-fields')
      .then((resp) => {
        const payload = resp.data?.data || resp.data;
        const items = (payload?.items || []) as CustomField[];
        setCustomFields(items);
      })
      .catch((err) => {
        const message = err?.response?.data?.message || 'Не удалось загрузить пользовательские колонки';
        setError(message);
      })
      .finally(() => setLoadingCustomFields(false));
  };

  const createCustomField = () => {
    const name = newCustomFieldName.trim();
    if (!name) {
      setStatus({ type: 'error', message: 'Укажите название колонки' });
      return;
    }
    setCreatingCustomField(true);
    setError(null);
    apiClient
      .post('/data-entry/custom-fields', {
        name,
        icon: newCustomFieldIcon?.trim() || undefined,
      })
      .then((resp) => {
        const createdRaw: CustomField = resp.data?.data || resp.data;
        const created: CustomField = { ...createdRaw, entriesCount: 0 };
        setCustomFields((prev) => {
          const next = [...prev, created].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
          return next;
        });
        setActiveTab(`field:${created.id}`);
        setNewCustomFieldName('');
        setStatus({ type: 'success', message: 'Пользовательская колонка создана' });
      })
      .catch((err) => {
        const message = err?.response?.data?.message || 'Не удалось создать колонку';
        setStatus({ type: 'error', message });
      })
      .finally(() => setCreatingCustomField(false));
  };

  const removeCustomField = (id: string) => {
    setError(null);
    apiClient
      .delete(`/data-entry/custom-fields/${id}`)
      .then(() => {
        setCustomFields((prev) => prev.filter((f) => f.id !== id));
        if (activeTab === `field:${id}`) {
          setActiveTab('cash');
        }
        setEntries((prev) => {
          const next = { ...prev };
          delete next[`field:${id}`];
          return next;
        });
        setStatus({ type: 'success', message: 'Колонка удалена' });
      })
      .catch((err) => {
        const message = err?.response?.data?.message || 'Не удалось удалить колонку';
        setStatus({ type: 'error', message });
      });
  };

  const openDeleteDialog = (field: CustomField) => {
    setDeleteDialog({
      open: true,
      fieldId: field.id,
      fieldName: field.name,
      entriesCount: Number(field.entriesCount || 0),
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, fieldId: '', fieldName: '', entriesCount: 0 });
    setDeletingTab(false);
    setExportingTabToTable(false);
  };

  const exportTabToCustomTableAndDelete = async () => {
    if (!deleteDialog.fieldId) return;
    setExportingTabToTable(true);
    setStatus(null);
    setError(null);
    try {
      const resp = await apiClient.post('/custom-tables/from-data-entry-custom-tab', {
        customTabId: deleteDialog.fieldId,
        name: deleteDialog.fieldName,
      });
      const payload = resp.data?.data || resp.data;
      const tableId = payload?.tableId;
      if (!tableId) throw new Error('tableId missing');
      await apiClient.delete(`/data-entry/custom-fields/${deleteDialog.fieldId}`);
      setCustomFields((prev) => prev.filter((f) => f.id !== deleteDialog.fieldId));
      setEntries((prev) => {
        const next = { ...prev };
        delete next[`field:${deleteDialog.fieldId}`];
        return next;
      });
      if (activeTab === `field:${deleteDialog.fieldId}`) setActiveTab('cash');
      closeDeleteDialog();
      router.push(`/custom-tables/${tableId}`);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Не удалось скопировать в таблицу';
      setStatus({ type: 'error', message });
    } finally {
      setExportingTabToTable(false);
    }
  };

  const deleteTabOnly = async () => {
    if (!deleteDialog.fieldId) return;
    setDeletingTab(true);
    setStatus(null);
    setError(null);
    try {
      await apiClient.delete(`/data-entry/custom-fields/${deleteDialog.fieldId}`);
      setCustomFields((prev) => prev.filter((f) => f.id !== deleteDialog.fieldId));
      setEntries((prev) => {
        const next = { ...prev };
        delete next[`field:${deleteDialog.fieldId}`];
        return next;
      });
      if (activeTab === `field:${deleteDialog.fieldId}`) setActiveTab('cash');
      closeDeleteDialog();
      setStatus({ type: 'success', message: 'Вкладка удалена' });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Не удалось удалить вкладку';
      setStatus({ type: 'error', message });
    } finally {
      setDeletingTab(false);
    }
  };

  const triggerIconUpload = () => {
    iconInputRef.current?.click();
  };

  const handleIconFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingIcon(true);
    setStatus(null);
    setError(null);
    const formData = new FormData();
    formData.append('icon', file);
    try {
      const resp = await apiClient.post('/data-entry/custom-fields/icon', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = resp.data?.url || resp.data?.data?.url;
      if (url) {
        setNewCustomFieldIcon(url);
      } else {
        throw new Error('URL missing');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Не удалось загрузить иконку';
      setStatus({ type: 'error', message });
    } finally {
      setUploadingIcon(false);
      if (iconInputRef.current) iconInputRef.current.value = '';
    }
  };

  const createTableFromDataEntry = async (scope: 'type' | 'all') => {
    if (!user) return;
    setExportingTable(true);
    setExportMenuOpen(false);
    setCustomIconOpen(false);
    setCalendarOpen(false);
    setError(null);
    setStatus(null);
    try {
      if (scope === 'type' && isFieldTab(activeTab)) {
        const response = await apiClient.post('/custom-tables/from-data-entry-custom-tab', {
          customTabId: getFieldId(activeTab),
          name: getTabLabel(activeTab),
        });
        const payload = response.data?.data || response.data;
        const tableId = payload?.tableId;
        if (!tableId) {
          throw new Error('tableId missing');
        }
        router.push(`/custom-tables/${tableId}`);
      } else {
        const response = await apiClient.post('/custom-tables/from-data-entry', {
          scope,
          type: scope === 'type' ? (isBaseTab(activeTab) ? activeTab : 'cash') : undefined,
        });
        const payload = response.data?.data || response.data;
        const tableId = payload?.tableId;
        if (!tableId) {
          throw new Error('tableId missing');
        }
        router.push(`/custom-tables/${tableId}`);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Не удалось создать таблицу';
      setStatus({ type: 'error', message });
    } finally {
      setExportingTable(false);
    }
  };

  // Load on tab change
  useEffect(() => {
    if (!user) return;
    if (isBaseTab(activeTab)) {
      if ((entries[activeTab] || []).length === 0) {
        loadEntries(activeTab);
      }
      return;
    }
    if (isFieldTab(activeTab)) {
      const id = getFieldId(activeTab);
      if ((entries[activeTab] || []).length === 0) {
        loadCustomTabEntries(id, activeTab);
      }
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (!user) return;
    loadCustomFields();
  }, [user]);

  const handleDelete = (entryId: string) => {
    setRemovingId(entryId);
    if (!isBaseTab(activeTab) && !isFieldTab(activeTab)) return;
    const effectiveTab = activeTab;
    apiClient
      .delete(`/data-entry/${entryId}`)
      .then(() => {
        setEntries((prev) => ({
          ...prev,
          [effectiveTab]: (prev[effectiveTab] || []).filter((e) => e.id !== entryId),
        }));
        if (isFieldTab(effectiveTab)) {
          const fieldId = getFieldId(effectiveTab);
          setCustomFields((prev) =>
            prev.map((f) =>
              f.id === fieldId
                ? { ...f, entriesCount: Math.max(0, Number(f.entriesCount || 0) - 1) }
                : f,
            ),
          );
        }
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
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
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

        {(isBaseTab(activeTab) || isFieldTab(activeTab)) && <div className="relative">
          <button
            type="button"
            disabled={exportingTable}
            onClick={() => setExportMenuOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exportingTable ? <Loader2 className="h-4 w-4 animate-spin" /> : <Table className="h-4 w-4" />}
            Создать таблицу
          </button>

          {exportMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setExportMenuOpen(false)} />
              <div className="absolute right-0 mt-2 z-20 w-80 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => createTableFromDataEntry('type')}
                  className="w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50"
                >
                  Создать таблицу по текущей вкладке —{' '}
                  <span className="font-semibold">{getTabLabel(activeTab)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => createTableFromDataEntry('all')}
                  className="w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 border-t border-gray-100"
                >
                  Создать единую таблицу по всей базе «Ввод данных»
                </button>
              </div>
            </>
          )}
        </div>}
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
          {(['cash', 'raw', 'debit', 'credit'] as BaseTabKey[])
            .map((t) => t as TabKey)
            .concat(customFields.map((f) => `field:${f.id}` as CustomFieldTabKey))
            .concat(['custom' as const])
            .map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCalendarOpen(false);
                    setCustomIconOpen(false);
                    setExportMenuOpen(false);
                    if (tab === 'custom') {
                      setCustomFieldHighlight(true);
                      window.setTimeout(() => setCustomFieldHighlight(false), 1200);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  {getTabIcon(tab)}
                  {getTabLabel(tab)}
                  {isFieldTab(tab) && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        const fieldId = getFieldId(tab);
                        const field = customFields.find((f) => f.id === fieldId);
                        if (field) openDeleteDialog(field);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          const fieldId = getFieldId(tab);
                          const field = customFields.find((f) => f.id === fieldId);
                          if (field) openDeleteDialog(field);
                        }
                      }}
                      className="ml-1 inline-flex items-center justify-center h-6 w-6 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Удалить вкладку"
                    >
                      <Trash2 className="h-4 w-4" />
                    </span>
                  )}
                </button>
              );
            })}
        </div>

		        <div className="p-4 space-y-4">
		          <div className="text-sm text-gray-600">
                {isFieldTab(activeTab)
                  ? `Ввод данных для вкладки «${getTabLabel(activeTab)}».`
                  : currentMeta.description}
              </div>

		          {activeTab === 'custom' ? (
		            <div className="space-y-4">
	              <div
	                ref={customFieldRef}
	                className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all ${
	                  customFieldHighlight ? 'ring-2 ring-primary/40' : ''
	                }`}
	              >
	                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
	                  <label className="block md:col-span-2">
	                    <span className="text-sm font-medium text-gray-700 block mb-1">Название колонки</span>
	                    <input
	                      type="text"
	                      value={newCustomFieldName}
	                      onChange={(e) => setNewCustomFieldName(e.target.value)}
	                      placeholder="Например: Проект"
	                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
	                    />
	                  </label>

	                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCalendarOpen(false);
                        setExportMenuOpen(false);
                        setCustomIconOpen((v) => !v);
                      }}
                      className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      title="Выбрать иконку"
                    >
                      {renderIconPreview(newCustomFieldIcon || 'mdi:tag')}
                      <span className="text-sm font-semibold">Иконка</span>
                    </button>
	                    <button
	                      type="button"
	                      onClick={createCustomField}
	                      disabled={creatingCustomField}
	                      className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50"
	                    >
	                      {creatingCustomField ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Создать'}
	                    </button>
	                  </div>
	                </div>

	                {customIconOpen && (
	                  <>
	                    <div className="fixed inset-0 z-10" onClick={() => setCustomIconOpen(false)} />
	                    <div className="absolute mt-2 z-20 w-[320px] rounded-xl border border-gray-200 bg-white shadow-xl p-4">
	                      <div className="grid grid-cols-7 gap-2 mb-4">
	                        {CUSTOM_FIELD_ICONS.map((icon) => (
	                          <button
	                            key={icon}
	                            type="button"
	                            onClick={() => {
	                              setNewCustomFieldIcon(icon);
	                              setCustomIconOpen(false);
	                            }}
	                            className={`inline-flex items-center justify-center h-9 w-9 rounded-lg border transition-colors ${
	                              newCustomFieldIcon === icon
	                                ? 'border-primary bg-primary/10 text-primary'
	                                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
	                            }`}
	                            title={icon}
	                          >
	                            {renderIconPreview(icon)}
	                          </button>
	                        ))}
	                      </div>
	                      <div className="border-t border-gray-100 pt-4">
	                        <button
	                          type="button"
	                          onClick={() => {
	                            triggerIconUpload();
	                            setCustomIconOpen(false);
	                          }}
	                          disabled={uploadingIcon}
	                          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white py-2 text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 transition-all"
	                        >
	                          {uploadingIcon ? (
	                            <>
	                              <Loader2 className="h-4 w-4 animate-spin" />
	                              Загрузка...
	                            </>
	                          ) : (
	                            'Загрузить иконку'
	                          )}
	                        </button>
	                      </div>
	                      <input
	                        ref={iconInputRef}
	                        type="file"
	                        accept="image/*"
	                        className="hidden"
	                        onChange={handleIconFileChange}
	                      />
	                    </div>
	                  </>
	                )}
	              </div>

	              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
	                <div className="flex items-center justify-between mb-2">
	                  <h3 className="font-semibold text-gray-900">Мои колонки</h3>
	                  <span className="text-xs text-gray-500">
	                    {loadingCustomFields ? 'Загрузка…' : `${customFields.length} шт`}
	                  </span>
	                </div>
	                <div className="divide-y divide-gray-100">
	                  {customFields.map((field) => (
	                    <div key={field.id} className="py-2 flex items-center justify-between">
	                      <div className="flex items-center gap-2">
	                        <Icon icon={field.icon || 'mdi:tag'} className="h-5 w-5 text-gray-700" />
	                        <span className="text-sm font-semibold text-gray-900">{field.name}</span>
	                      </div>
		                      <button
		                        type="button"
		                        onClick={() => openDeleteDialog(field)}
		                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
		                      >
		                        <Trash2 className="h-4 w-4" /> Удалить
		                      </button>
	                    </div>
	                  ))}
	                  {!loadingCustomFields && customFields.length === 0 && (
	                    <div className="py-6 text-sm text-gray-500 text-center">Пока нет созданных колонок</div>
	                  )}
	                </div>
	              </div>
	            </div>
	          ) : (
	            <>
	              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
	            </>
	          )}
	        </div>
	      </div>

      {(isBaseTab(activeTab) || isFieldTab(activeTab)) && (
      <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-gray-50/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-primary" />
		            <h3 className="font-semibold text-gray-900">Последние записи — {getTabLabel(activeTab)}</h3>
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
	                     <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{getTabLabel(activeTab)}</span>
	                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {entry.note || 'Без комментария'}
                    {entry.customFieldName && entry.customFieldValue ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="mx-1">•</span>
                        {entry.customFieldIcon ? (
                          <Icon icon={entry.customFieldIcon} className="h-3.5 w-3.5 text-gray-500" />
                        ) : null}
                        <span>
                          {entry.customFieldName}: {entry.customFieldValue}
                        </span>
                      </span>
                    ) : null}
                  </p>
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
      )}

      {deleteDialog.open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={closeDeleteDialog} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl">
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">Удалить вкладку</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Вкладка: <span className="font-semibold text-gray-900">{deleteDialog.fieldName}</span>
                </p>
                {deleteDialog.entriesCount > 0 ? (
                  <p className="mt-2 text-sm text-gray-600">
                    Внутри есть данные ({deleteDialog.entriesCount}). Перед удалением можно скопировать их в таблицу.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-gray-600">Данных нет — вкладка будет удалена.</p>
                )}
              </div>

              <div className="flex flex-col gap-2 border-t border-gray-100 p-4">
                {deleteDialog.entriesCount > 0 && (
                  <button
                    type="button"
                    onClick={exportTabToCustomTableAndDelete}
                    disabled={exportingTabToTable || deletingTab}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
                  >
                    {exportingTabToTable ? 'Копирование…' : 'Скопировать в таблицу и удалить'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={deleteTabOnly}
                  disabled={exportingTabToTable || deletingTab}
                  className="w-full rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingTab ? 'Удаление…' : 'Удалить вкладку'}
                </button>
                <button
                  type="button"
                  onClick={closeDeleteDialog}
                  disabled={exportingTabToTable || deletingTab}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
