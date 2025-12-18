'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Maximize2, Minimize2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import apiClient from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';
import ConfirmModal from '@/app/components/ConfirmModal';

type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multi_select';

interface CustomTableColumn {
  id: string;
  key: string;
  title: string;
  type: ColumnType;
  isRequired: boolean;
  isUnique: boolean;
  position: number;
  config: Record<string, any> | null;
}

interface CustomTable {
  id: string;
  name: string;
  description: string | null;
  source: string;
  categoryId?: string | null;
  category?: { id: string; name: string; color?: string | null; icon?: string | null } | null;
  columns: CustomTableColumn[];
}

interface CustomTableRow {
  id: string;
  rowNumber: number;
  data: Record<string, any>;
}

const COLUMN_TYPES: Array<{ value: ColumnType; label: string }> = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'date', label: 'Дата' },
  { value: 'boolean', label: 'Да/Нет' },
  { value: 'select', label: 'Выбор' },
  { value: 'multi_select', label: 'Мультивыбор' },
];

export default function CustomTableDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const tableId = params?.id;

  const [isFullscreen, setIsFullscreen] = useState(true);
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaDraft, setMetaDraft] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [savingMeta, setSavingMeta] = useState(false);

  const [table, setTable] = useState<CustomTable | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; color?: string | null; icon?: string | null }>>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [rows, setRows] = useState<CustomTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [savingCell, setSavingCell] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [newColumnOpen, setNewColumnOpen] = useState(false);
  const [newColumn, setNewColumn] = useState<{ title: string; type: ColumnType }>({
    title: '',
    type: 'text',
  });

  const [deleteColumnModalOpen, setDeleteColumnModalOpen] = useState(false);
  const [deleteColumnTarget, setDeleteColumnTarget] = useState<CustomTableColumn | null>(null);
  const [deleteRowModalOpen, setDeleteRowModalOpen] = useState(false);
  const [deleteRowTarget, setDeleteRowTarget] = useState<CustomTableRow | null>(null);

  const orderedColumns = useMemo(() => {
    const cols = table?.columns || [];
    return [...cols].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [table?.columns]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      const payload = response.data?.data || response.data || [];
      setCategories(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTable = async () => {
    if (!tableId) return;
    setLoading(true);
    try {
      const response = await apiClient.get(`/custom-tables/${tableId}`);
      const payload = response.data?.data || response.data;
      setTable(payload);
      const currentCategoryId = payload?.categoryId || payload?.category?.id || '';
      setCategoryId(currentCategoryId || '');
    } catch (error) {
      console.error('Failed to load table:', error);
      toast.error('Не удалось загрузить таблицу');
    } finally {
      setLoading(false);
    }
  };

  const loadRows = async (opts?: { reset?: boolean }) => {
    if (!tableId) return;
    if (loadingRows) return;
    setLoadingRows(true);
    try {
      const cursor = opts?.reset ? undefined : rows[rows.length - 1]?.rowNumber;
      const response = await apiClient.get(`/custom-tables/${tableId}/rows`, {
        params: { cursor, limit: 50 },
      });
      const items = response.data?.items || response.data?.data?.items || [];
      const next = Array.isArray(items) ? items : [];
      setRows((prev) => (opts?.reset ? next : [...prev, ...next]));
      setHasMore(next.length >= 50);
    } catch (error) {
      console.error('Failed to load rows:', error);
      toast.error('Не удалось загрузить строки');
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && tableId) {
      loadCategories();
      loadTable();
      loadRows({ reset: true });
    }
  }, [authLoading, user, tableId]);

  useEffect(() => {
    if (!table || editingMeta) return;
    setMetaDraft({
      name: table.name || '',
      description: table.description || '',
    });
  }, [table?.id, table?.name, table?.description, editingMeta]);

  useEffect(() => {
    if (!user) return;
    if (isFullscreen) {
      document.body.classList.add('ff-table-fullscreen');
    } else {
      document.body.classList.remove('ff-table-fullscreen');
    }
    return () => {
      document.body.classList.remove('ff-table-fullscreen');
    };
  }, [isFullscreen, user]);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag && ['input', 'textarea', 'select'].includes(tag)) return;
      if (target && (target as any).isContentEditable) return;
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  const updateCategory = async (nextCategoryId: string) => {
    if (!tableId) return;
    setCategoryId(nextCategoryId);
    try {
      await apiClient.patch(`/custom-tables/${tableId}`, {
        categoryId: nextCategoryId ? nextCategoryId : null,
      });
      await loadTable();
      toast.success('Категория обновлена');
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Не удалось обновить категорию');
    }
  };

  const startEditMeta = () => {
    if (!table) return;
    setMetaDraft({
      name: table.name || '',
      description: table.description || '',
    });
    setEditingMeta(true);
  };

  const cancelEditMeta = () => {
    setEditingMeta(false);
    setMetaDraft({
      name: table?.name || '',
      description: table?.description || '',
    });
  };

  const saveMeta = async () => {
    if (!tableId) return;
    const name = metaDraft.name.trim();
    if (!name) {
      toast.error('Введите название таблицы');
      return;
    }
    const description = metaDraft.description.trim();

    setSavingMeta(true);
    try {
      await apiClient.patch(`/custom-tables/${tableId}`, {
        name,
        description: description ? description : null,
      });
      setEditingMeta(false);
      await loadTable();
      toast.success('Сохранено');
    } catch (error) {
      console.error('Failed to update table meta:', error);
      toast.error('Не удалось сохранить изменения');
    } finally {
      setSavingMeta(false);
    }
  };

  const addRow = async () => {
    if (!tableId) return;
    const toastId = toast.loading('Добавление строки...');
    try {
      const response = await apiClient.post(`/custom-tables/${tableId}/rows`, { data: {} });
      const created = response.data?.data || response.data;
      setRows((prev) => [...prev, created]);
      toast.success('Строка добавлена', { id: toastId });
    } catch (error) {
      console.error('Failed to add row:', error);
      toast.error('Не удалось добавить строку', { id: toastId });
    }
  };

  const saveCell = async (row: CustomTableRow, column: CustomTableColumn, value: any) => {
    if (!tableId) return;
    const key = `${row.id}:${column.id}`;
    setSavingCell(key);
    try {
      await apiClient.patch(`/custom-tables/${tableId}/rows/${row.id}`, { data: { [column.key]: value } });
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, data: { ...(r.data || {}), [column.key]: value } } : r)),
      );
    } catch (error) {
      console.error('Failed to update cell:', error);
      toast.error('Не удалось сохранить значение');
    } finally {
      setSavingCell(null);
    }
  };

  const openDeleteColumn = (column: CustomTableColumn) => {
    setDeleteColumnTarget(column);
    setDeleteColumnModalOpen(true);
  };

  const deleteColumn = async () => {
    if (!tableId || !deleteColumnTarget) return;
    const toastId = toast.loading('Удаление колонки...');
    try {
      await apiClient.delete(`/custom-tables/${tableId}/columns/${deleteColumnTarget.id}`);
      toast.success('Колонка удалена', { id: toastId });
      setDeleteColumnModalOpen(false);
      setDeleteColumnTarget(null);
      await loadTable();
    } catch (error) {
      console.error('Failed to delete column:', error);
      toast.error('Не удалось удалить колонку', { id: toastId });
    }
  };

  const openDeleteRow = (row: CustomTableRow) => {
    setDeleteRowTarget(row);
    setDeleteRowModalOpen(true);
  };

  const deleteRow = async () => {
    if (!tableId || !deleteRowTarget) return;
    const toastId = toast.loading('Удаление строки...');
    try {
      await apiClient.delete(`/custom-tables/${tableId}/rows/${deleteRowTarget.id}`);
      toast.success('Строка удалена', { id: toastId });
      setRows((prev) => prev.filter((r) => r.id !== deleteRowTarget.id));
      setDeleteRowModalOpen(false);
      setDeleteRowTarget(null);
    } catch (error) {
      console.error('Failed to delete row:', error);
      toast.error('Не удалось удалить строку', { id: toastId });
    }
  };

  const createColumn = async () => {
    if (!tableId) return;
    const title = newColumn.title.trim();
    if (!title) return;
    const toastId = toast.loading('Добавление колонки...');
    try {
      await apiClient.post(`/custom-tables/${tableId}/columns`, { title, type: newColumn.type });
      toast.success('Колонка добавлена', { id: toastId });
      setNewColumnOpen(false);
      setNewColumn({ title: '', type: 'text' });
      await loadTable();
    } catch (error) {
      console.error('Failed to create column:', error);
      toast.error('Не удалось добавить колонку', { id: toastId });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">Загрузка...</div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Войдите в систему, чтобы просматривать таблицу.
        </div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Таблица не найдена.
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        isFullscreen
          ? 'h-full px-4 sm:px-6 lg:px-8 py-4 flex flex-col'
          : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
      }
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/custom-tables')}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </button>
            <Link href="/custom-tables" className="text-sm text-gray-400 hover:text-gray-600">
              / Таблицы
            </Link>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200"
              style={{ backgroundColor: table.category?.color || '#f3f4f6' }}
            >
              {table.category?.icon ? (
                <Icon icon={table.category.icon} className="h-5 w-5 text-gray-900" />
              ) : (
                <span className="text-gray-900 font-semibold">T</span>
              )}
            </span>
            {editingMeta ? (
              <div className="flex items-center gap-2 w-full max-w-[520px]">
                <input
                  value={metaDraft.name}
                  onChange={(e) => setMetaDraft((prev) => ({ ...prev, name: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      saveMeta();
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      e.stopPropagation();
                      cancelEditMeta();
                    }
                  }}
                  disabled={savingMeta}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                  placeholder="Название таблицы"
                />
                <button
                  onClick={saveMeta}
                  disabled={savingMeta || !metaDraft.name.trim()}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Сохранить"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={cancelEditMeta}
                  disabled={savingMeta}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Отмена"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">{table.name}</h1>
                <button
                  onClick={startEditMeta}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  title="Редактировать название и описание"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          {editingMeta ? (
            <textarea
              value={metaDraft.description}
              onChange={(e) => setMetaDraft((prev) => ({ ...prev, description: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  cancelEditMeta();
                }
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  saveMeta();
                }
              }}
              disabled={savingMeta}
              rows={2}
              className="mt-2 w-full max-w-[720px] resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
              placeholder="Описание (опционально)"
            />
          ) : (
            <p className="text-secondary mt-1">{table.description || '—'}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="text-xs font-semibold text-gray-700">Категория:</div>
            <select
              value={categoryId}
              onChange={(e) => updateCategory(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Без категории</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            title={isFullscreen ? 'Выйти из полноэкранного режима (Esc)' : 'Открыть в полноэкранном режиме'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isFullscreen ? 'Выйти' : 'Полный экран'}
          </button>
          <button
            onClick={() => setNewColumnOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Колонка
          </button>
          <button
            onClick={addRow}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Строка
          </button>
        </div>
      </div>

      {newColumnOpen && (
        <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Название колонки</label>
              <input
                value={newColumn.title}
                onChange={(e) => setNewColumn((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Например: Сумма, Дата, Контрагент"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Тип</label>
              <select
                value={newColumn.type}
                onChange={(e) => setNewColumn((prev) => ({ ...prev, type: e.target.value as ColumnType }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {COLUMN_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1 flex gap-2 justify-end">
              <button
                onClick={() => setNewColumnOpen(false)}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={createColumn}
                disabled={!newColumn.title.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={isFullscreen ? 'flex-1 min-h-0 overflow-hidden' : undefined}>
        <div
          className={
            isFullscreen
              ? 'h-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm'
              : 'overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm'
          }
        >
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 w-[72px]">#</th>
              {orderedColumns.map((col) => {
                const columnIcon = (col.config as any)?.icon;
                return (
                  <th key={col.id} className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {typeof columnIcon === 'string' && columnIcon ? (
                        <Icon icon={columnIcon} className="h-4 w-4 text-gray-600" />
                      ) : null}
                      <span className="truncate max-w-[260px]" title={col.title}>
                        {col.title}
                      </span>
                      <button
                        onClick={() => openDeleteColumn(col)}
                        className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-gray-50"
                        title="Удалить колонку"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </th>
                );
              })}
              <th className="px-3 py-2 text-right font-semibold text-gray-700 w-[64px]"></th>
            </tr>
            </thead>
            <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={orderedColumns.length + 2} className="px-4 py-6 text-center text-gray-500">
                  {loadingRows ? 'Загрузка...' : 'Нет строк. Добавьте первую строку.'}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 text-gray-500">{row.rowNumber}</td>
                  {orderedColumns.map((col) => {
                    const cellKey = `${row.id}:${col.id}`;
                    const value = (row.data || {})[col.key];
                    const isSaving = savingCell === cellKey;

                    if (col.type === 'boolean') {
                      return (
                        <td key={col.id} className="px-3 py-2">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(value)}
                              disabled={isSaving}
                              onChange={(e) => saveCell(row, col, e.target.checked)}
                              className="h-4 w-4"
                            />
                            {isSaving && <span className="text-xs text-gray-400">…</span>}
                          </label>
                        </td>
                      );
                    }

                    return (
                      <td key={col.id} className="px-3 py-2">
                        <input
                          defaultValue={value ?? ''}
                          onBlur={(e) => {
                            const next = e.target.value;
                            const normalized = next === '' ? null : next;
                            if ((value ?? null) === normalized) return;
                            saveCell(row, col, normalized);
                          }}
                          disabled={isSaving}
                          className="w-full min-w-[160px] rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                        />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => openDeleteRow(row)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600"
                      title="Удалить строку"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={isFullscreen ? 'mt-3 flex items-center justify-center' : 'mt-4 flex items-center justify-center'}>
        <button
          onClick={() => loadRows()}
          disabled={!hasMore || loadingRows}
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingRows ? 'Загрузка...' : hasMore ? 'Загрузить ещё' : 'Больше нет строк'}
        </button>
      </div>

      <ConfirmModal
        isOpen={deleteColumnModalOpen}
        onClose={() => {
          setDeleteColumnModalOpen(false);
          setDeleteColumnTarget(null);
        }}
        onConfirm={deleteColumn}
        title="Удалить колонку?"
        message={
          deleteColumnTarget
            ? `Колонка “${deleteColumnTarget.title}” будет удалена. Значения в строках останутся в данных, но не будут отображаться (пока не добавите колонку снова).`
            : 'Колонка будет удалена.'
        }
        confirmText="Удалить"
        cancelText="Отмена"
        isDestructive
      />

      <ConfirmModal
        isOpen={deleteRowModalOpen}
        onClose={() => {
          setDeleteRowModalOpen(false);
          setDeleteRowTarget(null);
        }}
        onConfirm={deleteRow}
        title="Удалить строку?"
        message={
          deleteRowTarget
            ? `Строка #${deleteRowTarget.rowNumber} будет удалена.`
            : 'Строка будет удалена.'
        }
        confirmText="Удалить"
        cancelText="Отмена"
        isDestructive
      />
    </div>
  );
}
