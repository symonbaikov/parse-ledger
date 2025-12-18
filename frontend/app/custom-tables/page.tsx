'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, Plus, Table as TableIcon, Trash2 } from 'lucide-react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import apiClient from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';
import ConfirmModal from '@/app/components/ConfirmModal';

interface Category {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
}

interface CustomTableItem {
  id: string;
  name: string;
  description: string | null;
  source: string;
  categoryId?: string | null;
  category?: Category | null;
  createdAt: string;
  updatedAt: string;
}

const extractErrorMessage = (error: any): string | null => {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    (typeof error?.response?.data === 'string' ? error.response.data : null) ||
    null
  );
};

export default function CustomTablesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CustomTableItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', categoryId: '' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomTableItem | null>(null);

  const canCreate = useMemo(() => form.name.trim().length > 0, [form.name]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      const payload = response.data?.data || response.data || [];
      setCategories(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTables = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/custom-tables');
      const payload = response.data?.items || response.data?.data?.items || response.data?.data || [];
      setItems(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error('Failed to load custom tables:', error);
      toast.error(extractErrorMessage(error) || 'Не удалось загрузить таблицы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadTables();
      loadCategories();
    }
  }, [authLoading, user]);

  const handleCreate = async () => {
    if (!canCreate) return;
    setCreating(true);
    try {
      const response = await apiClient.post('/custom-tables', {
        name: form.name.trim(),
        description: form.description.trim() ? form.description.trim() : undefined,
        categoryId: form.categoryId ? form.categoryId : undefined,
      });
      const created = response.data?.data || response.data;
      toast.success('Таблица создана');
      setCreateOpen(false);
      setForm({ name: '', description: '', categoryId: '' });
      if (created?.id) {
        router.push(`/custom-tables/${created.id}`);
        return;
      }
      await loadTables();
    } catch (error) {
      console.error('Failed to create custom table:', error);
      toast.error(extractErrorMessage(error) || 'Не удалось создать таблицу');
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = (table: CustomTableItem) => {
    setDeleteTarget(table);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const toastId = toast.loading('Удаление...');
    try {
      await apiClient.delete(`/custom-tables/${deleteTarget.id}`);
      toast.success('Таблица удалена', { id: toastId });
      await loadTables();
    } catch (error) {
      console.error('Failed to delete custom table:', error);
      toast.error('Не удалось удалить таблицу', { id: toastId });
    } finally {
      setDeleteTarget(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">Загрузка...</div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Войдите в систему, чтобы просматривать таблицы.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            <TableIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Таблицы</h1>
            <p className="text-secondary mt-1">
              Пользовательские таблицы внутри FinFlow (в т.ч. импорт из Google Sheets).
            </p>
          </div>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          Создать
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/custom-tables/import/google-sheets"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          Импорт из Google Sheets
        </Link>
      </div>

      {createOpen && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-sm font-semibold text-gray-900">Новая таблица</div>
            <button
              onClick={() => {
                setCreateOpen(false);
                setForm({ name: '', description: '', categoryId: '' });
              }}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Закрыть
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Название</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Например: Реестр платежей"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Описание</label>
              <input
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Опционально"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Категория (иконка/цвет)</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Без категории</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {form.categoryId && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200"
                    style={{ backgroundColor: categories.find((c) => c.id === form.categoryId)?.color || '#f3f4f6' }}
                  >
                    {(() => {
                      const selected = categories.find((c) => c.id === form.categoryId);
                      return selected?.icon ? (
                        <Icon icon={selected.icon} className="h-4 w-4 text-gray-900" />
                      ) : (
                        <TableIcon className="h-4 w-4 text-gray-900" />
                      );
                    })()}
                  </span>
                  <span>Иконка/цвет будут взяты из категории</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => {
                setCreateOpen(false);
                setForm({ name: '', description: '', categoryId: '' });
              }}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              onClick={handleCreate}
              disabled={!canCreate || creating}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Загрузка...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
          Таблиц пока нет. Создайте первую таблицу или импортируйте из Google Sheets.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((table) => (
            <div
              key={table.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/custom-tables/${table.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push(`/custom-tables/${table.id}`);
                }
              }}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm cursor-pointer hover:shadow-md hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200"
                      style={{ backgroundColor: table.category?.color || '#f3f4f6' }}
                    >
                      {table.category?.icon ? (
                        <Icon icon={table.category.icon} className="h-5 w-5 text-gray-900" />
                      ) : (
                        <TableIcon className="h-5 w-5 text-gray-900" />
                      )}
                    </span>
                    <div className="text-lg font-semibold text-gray-900">{table.name}</div>
                  </div>
                  <div className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {table.description || '—'}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(table);
                  }}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600"
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <div className="truncate">Источник: {table.source === 'google_sheets_import' ? 'Google Sheets' : 'Manual'}</div>
                <div className="truncate">
                  {table.createdAt ? new Date(table.createdAt).toLocaleDateString() : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Удалить таблицу?"
        message={
          deleteTarget
            ? `Таблица “${deleteTarget.name}” будет удалена вместе со всеми строками и колонками.`
            : 'Таблица будет удалена вместе со всеми строками и колонками.'
        }
        confirmText="Удалить"
        cancelText="Отмена"
        isDestructive
      />
    </div>
  );
}
