'use client';

import ConfirmModal from '@/app/components/ConfirmModal';
import { useAuth } from '@/app/hooks/useAuth';
import apiClient from '@/app/lib/api';
import { Icon } from '@iconify/react';
import { FileSpreadsheet, Plus, Table as TableIcon, Trash2 } from 'lucide-react';
import { useIntlayer, useLocale } from 'next-intlayer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

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

interface StatementItem {
  id: string;
  fileName: string;
  status: string;
  totalTransactions: number;
  statementDateFrom?: string | null;
  statementDateTo?: string | null;
  createdAt: string;
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
  const t = useIntlayer('customTablesPage');
  const { locale } = useLocale();
  const [items, setItems] = useState<CustomTableItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statements, setStatements] = useState<StatementItem[]>([]);
  const [statementsLoading, setStatementsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', categoryId: '' });
  const [createFromStatementsOpen, setCreateFromStatementsOpen] = useState(false);
  const [createFromStatementsForm, setCreateFromStatementsForm] = useState<{
    name: string;
    description: string;
  }>({
    name: '',
    description: '',
  });
  const [selectedStatementIds, setSelectedStatementIds] = useState<string[]>([]);
  const [creatingFromStatements, setCreatingFromStatements] = useState(false);
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
      const payload =
        response.data?.items || response.data?.data?.items || response.data?.data || [];
      setItems(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error('Failed to load custom tables:', error);
      toast.error(extractErrorMessage(error) || t.toasts.loadTablesFailed.value);
    } finally {
      setLoading(false);
    }
  };

  const loadStatements = async () => {
    setStatementsLoading(true);
    try {
      const response = await apiClient.get('/statements', { params: { page: 1, limit: 50 } });
      const payload = response.data?.data || response.data?.items || [];
      setStatements(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error('Failed to load statements:', error);
      toast.error(extractErrorMessage(error) || t.toasts.loadStatementsFailed.value);
    } finally {
      setStatementsLoading(false);
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
      toast.success(t.toasts.created.value);
      setCreateOpen(false);
      setForm({ name: '', description: '', categoryId: '' });
      if (created?.id) {
        router.push(`/custom-tables/${created.id}`);
        return;
      }
      await loadTables();
    } catch (error) {
      console.error('Failed to create custom table:', error);
      toast.error(extractErrorMessage(error) || t.toasts.createFailed.value);
    } finally {
      setCreating(false);
    }
  };

  const openCreateFromStatements = async () => {
    setCreateFromStatementsOpen(true);
    setSelectedStatementIds([]);
    setCreateFromStatementsForm({ name: '', description: '' });
    await loadStatements();
  };

  const handleCreateFromStatements = async () => {
    if (!selectedStatementIds.length) {
      toast.error(t.toasts.selectAtLeastOneStatement.value);
      return;
    }
    setCreatingFromStatements(true);
    try {
      const response = await apiClient.post('/custom-tables/from-statements', {
        statementIds: selectedStatementIds,
        name: createFromStatementsForm.name.trim()
          ? createFromStatementsForm.name.trim()
          : undefined,
        description: createFromStatementsForm.description.trim()
          ? createFromStatementsForm.description.trim()
          : undefined,
      });
      const data = response.data?.data || response.data;
      const tableId = data?.tableId || data?.id;
      toast.success(t.toasts.createdFromStatement.value);
      setCreateFromStatementsOpen(false);
      setSelectedStatementIds([]);
      if (tableId) {
        router.push(`/custom-tables/${tableId}`);
        return;
      }
      await loadTables();
    } catch (error) {
      console.error('Failed to create from statements:', error);
      toast.error(extractErrorMessage(error) || t.toasts.createFromStatementFailed.value);
    } finally {
      setCreatingFromStatements(false);
    }
  };

  const confirmDelete = (table: CustomTableItem) => {
    setDeleteTarget(table);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const toastId = toast.loading(t.toasts.deleting.value);
    try {
      await apiClient.delete(`/custom-tables/${deleteTarget.id}`);
      toast.success(t.toasts.deleted.value, { id: toastId });
      await loadTables();
    } catch (error) {
      console.error('Failed to delete custom table:', error);
      toast.error(t.toasts.deleteFailed.value, { id: toastId });
    } finally {
      setDeleteTarget(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
        {t.auth.loading}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          {t.auth.loginRequired}
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
            <h1 className="text-2xl font-bold text-gray-900">{t.header.title}</h1>
            <p className="text-secondary mt-1">{t.header.subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.actions.create}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openCreateFromStatements}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FileSpreadsheet className="h-4 w-4 text-blue-600" />
          {t.actions.fromStatement}
        </button>
        <Link
          href="/custom-tables/import/google-sheets"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          {t.actions.importGoogleSheets}
        </Link>
      </div>

      {createFromStatementsOpen && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-sm font-semibold text-gray-900">
              {t.createFromStatements.title}
            </div>
            <button
              onClick={() => setCreateFromStatementsOpen(false)}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              {t.actions.close}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-1">
              <label
                className="block text-xs font-semibold text-gray-700 mb-1"
                htmlFor="create-from-statements-name"
              >
                {t.createFromStatements.nameOptional}
              </label>
              <input
                id="create-from-statements-name"
                value={createFromStatementsForm.name}
                onChange={e =>
                  setCreateFromStatementsForm(prev => ({ ...prev, name: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder={t.createFromStatements.namePlaceholder.value}
              />
            </div>
            <div className="md:col-span-2">
              <label
                className="block text-xs font-semibold text-gray-700 mb-1"
                htmlFor="create-from-statements-description"
              >
                {t.createFromStatements.descriptionOptional}
              </label>
              <input
                id="create-from-statements-description"
                value={createFromStatementsForm.description}
                onChange={e =>
                  setCreateFromStatementsForm(prev => ({ ...prev, description: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder={t.createFromStatements.descriptionPlaceholder.value}
              />
            </div>
            <div className="md:col-span-1">
              <label
                className="block text-xs font-semibold text-gray-700 mb-1"
                htmlFor="create-from-statements-select"
              >
                {t.createFromStatements.statements}
              </label>
              <div className="max-h-44 overflow-auto rounded-lg border border-gray-200 p-2">
                {statementsLoading ? (
                  <div className="text-sm text-gray-500 px-2 py-1">
                    {t.createFromStatements.statementsLoading}
                  </div>
                ) : statements.length === 0 ? (
                  <div className="text-sm text-gray-500 px-2 py-1">
                    {t.createFromStatements.statementsEmpty}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {statements.map(s => {
                      const disabled =
                        !s.totalTransactions ||
                        s.status === 'error' ||
                        s.status === 'uploaded' ||
                        s.status === 'processing';
                      const checked = selectedStatementIds.includes(s.id);
                      const label = s.fileName || s.id;
                      return (
                        <label
                          key={s.id}
                          className={`flex items-center gap-2 rounded-md px-2 py-1 text-xs ${
                            disabled ? 'opacity-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={disabled}
                            checked={checked}
                            onChange={e => {
                              const nextChecked = e.target.checked;
                              setSelectedStatementIds(prev => {
                                if (nextChecked) return Array.from(new Set([...prev, s.id]));
                                return prev.filter(id => id !== s.id);
                              });
                            }}
                          />
                          <span className="truncate" title={label}>
                            {label}
                          </span>
                          <span className="ml-auto text-gray-400">{s.totalTransactions ?? 0}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="mt-1 text-[11px] text-gray-500">{t.createFromStatements.hint}</div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setCreateFromStatementsOpen(false)}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t.actions.cancel}
            </button>
            <button
              onClick={handleCreateFromStatements}
              disabled={!selectedStatementIds.length || creatingFromStatements}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingFromStatements ? t.createFromStatements.creating.value : t.actions.create}
            </button>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-sm font-semibold text-gray-900">{t.create.title}</div>
            <button
              onClick={() => {
                setCreateOpen(false);
                setForm({ name: '', description: '', categoryId: '' });
              }}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              {t.actions.close}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-1">
              <label
                className="block text-xs font-semibold text-gray-700 mb-1"
                htmlFor="create-name"
              >
                {t.create.name}
              </label>
              <input
                id="create-name"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder={t.create.namePlaceholder.value}
              />
            </div>
            <div className="md:col-span-2">
              <label
                className="block text-xs font-semibold text-gray-700 mb-1"
                htmlFor="create-description"
              >
                {t.create.description}
              </label>
              <input
                id="create-description"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder={t.create.descriptionPlaceholder.value}
              />
            </div>
            <div className="md:col-span-1">
              <label
                className="block text-xs font-semibold text-gray-700 mb-1"
                htmlFor="create-category"
              >
                {t.create.category}
              </label>
              <select
                id="create-category"
                value={form.categoryId}
                onChange={e => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">{t.create.noCategory}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {form.categoryId && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200"
                    style={{
                      backgroundColor:
                        categories.find(c => c.id === form.categoryId)?.color || '#f3f4f6',
                    }}
                  >
                    {(() => {
                      const selected = categories.find(c => c.id === form.categoryId);
                      return selected?.icon ? (
                        <Icon icon={selected.icon} className="h-4 w-4 text-gray-900" />
                      ) : (
                        <TableIcon className="h-4 w-4 text-gray-900" />
                      );
                    })()}
                  </span>
                  <span>{t.create.categoryHint}</span>
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
              {t.actions.cancel}
            </button>
            <button
              onClick={handleCreate}
              disabled={!canCreate || creating}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? t.create.creating.value : t.actions.create}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          {t.loading}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
          {t.empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(table => (
            <button
              type="button"
              key={table.id}
              onClick={() => router.push(`/custom-tables/${table.id}`)}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm cursor-pointer hover:shadow-md hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 text-left"
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
                  onClick={e => {
                    e.stopPropagation();
                    confirmDelete(table);
                  }}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600"
                  title={t.actions.delete.value}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <div className="truncate">
                  {t.sources.label.value}:{' '}
                  {table.source === 'google_sheets_import'
                    ? t.sources.googleSheets.value
                    : t.sources.manual.value}
                </div>
                <div className="truncate">
                  {table.createdAt
                    ? new Date(table.createdAt).toLocaleDateString(
                        locale === 'kk' ? 'kk-KZ' : locale === 'ru' ? 'ru-RU' : 'en-US',
                      )
                    : ''}
                </div>
              </div>
            </button>
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
        title={t.confirmDelete.title.value}
        message={
          deleteTarget
            ? `${t.confirmDelete.messageWithNamePrefix.value}${deleteTarget.name}${t.confirmDelete.messageWithNameSuffix.value}`
            : t.confirmDelete.messageNoName.value
        }
        confirmText={t.confirmDelete.confirm.value}
        cancelText={t.confirmDelete.cancel.value}
        isDestructive
      />
    </div>
  );
}
