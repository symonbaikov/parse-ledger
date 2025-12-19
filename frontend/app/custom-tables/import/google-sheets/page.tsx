'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileSpreadsheet, Loader2, Sparkles } from 'lucide-react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import apiClient from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';

type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multi_select';
type LayoutType = 'auto' | 'flat' | 'matrix';

interface GoogleSheetConnection {
  id: string;
  sheetId: string;
  sheetName: string;
  worksheetName?: string | null;
  isActive?: boolean;
  oauthConnected?: boolean;
}

interface Category {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
}

interface PreviewColumn {
  index: number;
  a1: string;
  title: string;
  suggestedType: ColumnType;
  include: boolean;
}

interface PreviewResponse {
  spreadsheetId: string;
  worksheetName: string;
  usedRange: { a1: string; rowsCount: number; colsCount: number };
  layoutSuggested: LayoutType;
  headerRowIndex: number;
  columns: PreviewColumn[];
  sampleRows: Array<{ rowNumber: number; values: Array<string | null> }>;
}

export default function GoogleSheetsImportPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [connections, setConnections] = useState<GoogleSheetConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');

  const [googleSheetId, setGoogleSheetId] = useState('');
  const [worksheetName, setWorksheetName] = useState('');
  const [range, setRange] = useState('');
  const [layoutType, setLayoutType] = useState<LayoutType>('auto');
  const [headerRowIndex, setHeaderRowIndex] = useState(0);

  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [columns, setColumns] = useState<PreviewColumn[]>([]);

  const [tableName, setTableName] = useState('');
  const [tableDescription, setTableDescription] = useState('');
  const [importData, setImportData] = useState(true);

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [jobId, setJobId] = useState('');
  const [jobStatus, setJobStatus] = useState('');
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStage, setJobStage] = useState('');
  const [jobError, setJobError] = useState('');

  const selectedConnection = useMemo(
    () => connections.find((c) => c.id === googleSheetId) || null,
    [connections, googleSheetId],
  );

  const canPreview = Boolean(googleSheetId && selectedConnection?.oauthConnected !== false);
  const canCommit = Boolean(preview && tableName.trim() && columns.some((c) => c.include));

  const loadConnections = async () => {
    setLoadingConnections(true);
    try {
      const response = await apiClient.get('/google-sheets');
      const items: GoogleSheetConnection[] = response.data?.data || response.data || [];
      setConnections(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Failed to load google sheets connections:', error);
      toast.error('Не удалось загрузить Google Sheets подключения');
    } finally {
      setLoadingConnections(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      const payload = response.data?.data || response.data || [];
      setCategories(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadConnections();
      loadCategories();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!selectedConnection) return;
    const nextWorksheet = selectedConnection.worksheetName || '';
    setWorksheetName((prev) => prev || nextWorksheet);
    setTableName((prev) => prev || selectedConnection.sheetName || 'Импорт из Google Sheets');
  }, [selectedConnection]);

  const handlePreview = async () => {
    if (!googleSheetId) return;
    if (selectedConnection?.oauthConnected === false) {
      toast.error('Подключение Google Sheets требует OAuth. Переподключите таблицу в разделе «Интеграции».');
      return;
    }
    setLoadingPreview(true);
    try {
      const response = await apiClient.post('/custom-tables/import/google-sheets/preview', {
        googleSheetId,
        worksheetName: worksheetName.trim() || undefined,
        range: range.trim() || undefined,
        headerRowIndex,
        layoutType,
      });

      const data: PreviewResponse = response.data?.data || response.data;
      setPreview(data);
      setColumns(data.columns || []);
      setHeaderRowIndex(data.headerRowIndex ?? headerRowIndex);
      if (!tableName.trim()) {
        setTableName(selectedConnection?.sheetName || 'Импорт из Google Sheets');
      }
      toast.success('Превью готово');
    } catch (error: any) {
      console.error('Preview failed:', error);
      const message = error?.response?.data?.message || 'Не удалось получить превью';
      toast.error(message);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCommit = async () => {
    if (!preview || !canCommit) return;
    setCommitting(true);
    try {
      const response = await apiClient.post('/custom-tables/import/google-sheets/commit', {
        googleSheetId,
        worksheetName: worksheetName.trim() || undefined,
        range: range.trim() || undefined,
        name: tableName.trim(),
        description: tableDescription.trim() ? tableDescription.trim() : undefined,
        categoryId: categoryId ? categoryId : undefined,
        headerRowIndex,
        importData,
        layoutType,
        columns: columns.map((c) => ({
          index: c.index,
          title: c.title,
          type: c.suggestedType,
          include: c.include,
        })),
      });

      const result = response.data?.data || response.data;
      const nextJobId = result?.jobId;
      if (!nextJobId) {
        toast.error('Не удалось запустить импорт');
        return;
      }
      setJobId(nextJobId);
      setJobStatus('pending');
      setJobProgress(0);
      setJobStage('queued');
      setJobError('');
      toast.success('Импорт запущен');
    } catch (error: any) {
      console.error('Commit failed:', error);
      const message = error?.response?.data?.message || 'Не удалось выполнить импорт';
      toast.error(message);
    } finally {
      setCommitting(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    let timer: number | null = null;

    const poll = async () => {
      try {
        const response = await apiClient.get(`/custom-tables/import/jobs/${jobId}`);
        const payload = response.data?.data || response.data;
        if (cancelled) return;

        const status = String(payload?.status || '');
        setJobStatus(status);
        setJobProgress(typeof payload?.progress === 'number' ? payload.progress : 0);
        setJobStage(String(payload?.stage || ''));
        setJobError(String(payload?.error || ''));

        if (status === 'done') {
          const tableId = payload?.result?.tableId;
          toast.success('Импорт завершён');
          if (tableId) {
            router.push(`/custom-tables/${tableId}`);
          } else {
            router.push('/custom-tables');
          }
          return;
        }

        if (status === 'failed') {
          toast.error(payload?.error || 'Импорт завершился с ошибкой');
          return;
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Job poll failed:', error);
      }

      timer = window.setTimeout(poll, 1500);
    };

    poll();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [jobId, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Войдите в систему, чтобы импортировать таблицу.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Импорт из Google Sheets</h1>
          <p className="text-secondary mt-1">
            Превью → настройка колонок → импорт в автономную таблицу FinFlow.
          </p>
        </div>
        <Link
          href="/custom-tables"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Назад
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-900 mb-3">Источник</div>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700">Подключение Google Sheet</span>
              <select
                value={googleSheetId}
                onChange={(e) => {
                  setGoogleSheetId(e.target.value);
                  setPreview(null);
                  setColumns([]);
                }}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">— выберите —</option>
                {connections.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.oauthConnected === false}>
                    {c.sheetName}
                    {c.oauthConnected === false ? ' (нужна OAuth)' : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700">Лист (worksheet)</span>
              <input
                value={worksheetName}
                onChange={(e) => setWorksheetName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="Например: Реестр платежей"
              />
              <div className="mt-1 text-xs text-gray-500">
                Если не указать — используем лист из подключения или первый лист.
              </div>
            </label>

            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700">Range (опционально)</span>
              <input
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="Например: A1:Z200"
              />
            </label>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Header row (index)</span>
                <input
                  type="number"
                  min={0}
                  value={headerRowIndex}
                  onChange={(e) => setHeaderRowIndex(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <div className="mt-1 text-xs text-gray-500">0 = первая строка used range</div>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Layout</span>
                <select
                  value={layoutType}
                  onChange={(e) => setLayoutType(e.target.value as LayoutType)}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="auto">Auto</option>
                  <option value="flat">Flat</option>
                  <option value="matrix">Matrix</option>
                </select>
              </label>
            </div>

            <button
              onClick={handlePreview}
              disabled={!canPreview || loadingPreview || loadingConnections}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {(loadingPreview || loadingConnections) && <Loader2 className="h-4 w-4 animate-spin" />}
              {loadingConnections ? 'Загрузка...' : 'Сделать превью'}
            </button>
            {loadingConnections && (
              <div className="mt-2 text-xs text-gray-500">Загружаем подключения…</div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-900 mb-3">Результат</div>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700">Название таблицы</span>
              <input
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="Например: Реестр платежей"
              />
            </label>
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700">Описание (опционально)</span>
              <input
                value={tableDescription}
                onChange={(e) => setTableDescription(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </label>

            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700">Категория (иконка/цвет)</span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Без категории</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {categoryId && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200"
                    style={{ backgroundColor: categories.find((c) => c.id === categoryId)?.color || '#f3f4f6' }}
                  >
                    {(() => {
                      const selected = categories.find((c) => c.id === categoryId);
                      return selected?.icon ? (
                        <Icon icon={selected.icon} className="h-4 w-4 text-gray-900" />
                      ) : (
                        <FileSpreadsheet className="h-4 w-4 text-gray-900" />
                      );
                    })()}
                  </span>
                  <span>Иконка/цвет будут взяты из категории</span>
                </div>
              )}
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700 mb-4">
              <input
                type="checkbox"
                checked={importData}
                onChange={(e) => setImportData(e.target.checked)}
                className="h-4 w-4"
              />
              Импортировать данные (кроме заголовка)
            </label>

            <button
              onClick={handleCommit}
              disabled={!canCommit || committing || Boolean(jobId)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {committing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {jobId ? 'Импорт выполняется…' : 'Импортировать'}
            </button>
            {jobId ? (
              <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-gray-900">Прогресс</div>
                  <div className="text-sm font-semibold text-gray-700">{Math.round(jobProgress)}%</div>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, jobProgress))}%` }} />
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Статус: <span className="font-medium">{jobStatus || '—'}</span>{' '}
                  {jobStage ? <span className="text-gray-500">({jobStage})</span> : null}
                </div>
                {jobError ? <div className="mt-2 text-xs text-red-600 break-words">{jobError}</div> : null}
              </div>
            ) : null}
            {!preview && (
              <div className="mt-2 text-xs text-gray-500">Сначала сделайте превью.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">Превью</div>
                <div className="text-xs text-gray-500 mt-1">
                  Used range и sample. В commit будут считаны все данные.
                </div>
              </div>
              {preview && (
                <div className="text-xs text-gray-500 text-right">
                  <div>{preview.usedRange.a1}</div>
                  <div>
                    {preview.usedRange.rowsCount}×{preview.usedRange.colsCount}, layout: {preview.layoutSuggested}
                  </div>
                </div>
              )}
            </div>

            {!preview ? (
              <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                Выберите подключение и нажмите “Сделать превью”.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-2 py-2 text-left font-semibold text-gray-700">Row</th>
                      {preview.columns.slice(0, 12).map((c) => (
                        <th key={c.index} className="px-2 py-2 text-left font-semibold text-gray-700">
                          {c.title}
                        </th>
                      ))}
                      {preview.columns.length > 12 && (
                        <th className="px-2 py-2 text-left font-semibold text-gray-500">…</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.sampleRows.map((r) => (
                      <tr key={r.rowNumber} className="border-b border-gray-100 last:border-0">
                        <td className="px-2 py-1 text-gray-500">{r.rowNumber}</td>
                        {r.values.slice(0, 12).map((v, idx) => (
                          <td key={idx} className="px-2 py-1 text-gray-700">
                            {v ?? '—'}
                          </td>
                        ))}
                        {preview.columns.length > 12 && (
                          <td className="px-2 py-1 text-gray-500">…</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">Колонки</div>
                <div className="text-xs text-gray-500 mt-1">
                  Можно отключать/переименовывать и менять тип. Тип используется для UI и валидаций.
                </div>
              </div>
              {preview && (
                <button
                  onClick={() => setColumns((prev) => prev.map((c) => ({ ...c, include: true })))}
                  className="text-xs text-primary hover:text-primary-hover"
                >
                  Включить все
                </button>
              )}
            </div>

            {!preview ? (
              <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                Колонки появятся после превью.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 w-[84px]">Вкл</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 w-[80px]">A1</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Название</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 w-[180px]">Тип</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columns.map((c) => (
                      <tr key={c.index} className="border-b border-gray-100 last:border-0">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={c.include}
                            onChange={(e) =>
                              setColumns((prev) =>
                                prev.map((x) => (x.index === c.index ? { ...x, include: e.target.checked } : x)),
                              )
                            }
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="px-3 py-2 text-gray-500">{c.a1}</td>
                        <td className="px-3 py-2">
                          <input
                            value={c.title}
                            onChange={(e) =>
                              setColumns((prev) =>
                                prev.map((x) => (x.index === c.index ? { ...x, title: e.target.value } : x)),
                              )
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={c.suggestedType}
                            onChange={(e) =>
                              setColumns((prev) =>
                                prev.map((x) =>
                                  x.index === c.index ? { ...x, suggestedType: e.target.value as ColumnType } : x,
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                          >
                            <option value="text">Текст</option>
                            <option value="number">Число</option>
                            <option value="date">Дата</option>
                            <option value="boolean">Да/Нет</option>
                            <option value="select">Выбор</option>
                            <option value="multi_select">Мультивыбор</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
