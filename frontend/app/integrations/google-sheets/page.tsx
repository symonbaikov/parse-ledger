'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  Loader2,
  Plug,
  RefreshCcw,
  Trash2,
} from 'lucide-react';
import apiClient from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';

interface GoogleSheetConnection {
  id: string;
  sheetId: string;
  sheetName: string;
  worksheetName?: string | null;
  lastSync?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

const parseSpreadsheetId = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match?.[1]) {
    return match[1];
  }

  return trimmed;
};

export default function GoogleSheetsIntegrationPage() {
  const { user, loading: authLoading } = useAuth();
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [worksheetName, setWorksheetName] = useState('');
  const [connections, setConnections] = useState<GoogleSheetConnection[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadConnections();
    }
  }, [user]);

  const loadConnections = async () => {
    try {
      setLoadingList(true);
      setError(null);
      const response = await apiClient.get('/google-sheets');
      const items: GoogleSheetConnection[] = response.data?.data || response.data || [];
      setConnections(items);
    } catch (err) {
      console.error('Failed to load google sheets', err);
      setError('Не удалось загрузить подключённые таблицы');
    } finally {
      setLoadingList(false);
    }
  };

  const handleConnect = async () => {
    const parsedId = parseSpreadsheetId(sheetUrl);
    if (!parsedId) {
      setError('Укажите ID или ссылку на таблицу');
      return;
    }
    const finalSheetName = sheetName.trim() || `Sheet ${parsedId.slice(0, 6)}`;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      await apiClient.post('/google-sheets/connect', {
        sheetId: parsedId,
        sheetName: finalSheetName,
        worksheetName: worksheetName.trim() || undefined,
      });
      setSuccess('Таблица подключена. Не забудьте настроить Apps Script webhook.');
      setSheetUrl('');
      setSheetName('');
      setWorksheetName('');
      await loadConnections();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Не удалось подключить таблицу';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSync = async (id: string) => {
    try {
      setSyncingId(id);
      setError(null);
      setSuccess(null);
      await apiClient.put(`/google-sheets/${id}/sync`, {});
      setSuccess('Синхронизация запущена');
      await loadConnections();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Не удалось синхронизировать';
      setError(message);
    } finally {
      setSyncingId(null);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      setRemovingId(id);
      setError(null);
      setSuccess(null);
      await apiClient.delete(`/google-sheets/${id}`);
      setSuccess('Подключение отключено');
      await loadConnections();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Не удалось отключить таблицу';
      setError(message);
    } finally {
      setRemovingId(null);
    }
  };

  const emptyState = useMemo(
    () => !loadingList && connections.length === 0,
    [loadingList, connections],
  );

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
          <p className="text-gray-800 font-semibold mb-2">Войдите, чтобы подключить Google Sheets</p>
          <p className="text-sm text-gray-600">
            Авторизация нужна для создания привязки таблицы к вашему аккаунту.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <Plug className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Подключение Google Sheets</h1>
          <p className="text-secondary mt-1">
            Укажите таблицу и лист, куда будут отправляться данные. После подключения вставьте
            Apps Script из документации для отправки вебхуков.
          </p>
        </div>
      </div>

      {(error || success) && (
        <div className="mb-4 space-y-2">
          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Шаг 1</p>
                <h2 className="text-lg font-semibold text-gray-900">Добавить таблицу</h2>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Ссылка или ID таблицы</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="https://docs.google.com/spreadsheets/d/… или 1A2B3C…"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Название в системе</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="Например: Выписки Казахстан"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Имя листа (опционально, если не Sheet1)
                </span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="Например: Отгрузки"
                  value={worksheetName}
                  onChange={(e) => setWorksheetName(e.target.value)}
                />
              </label>

              <button
                type="button"
                onClick={handleConnect}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Подключить
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                <Plug className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Шаг 2</p>
                <h2 className="text-lg font-semibold text-gray-900">Настроить Apps Script</h2>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Скопируйте скрипт из нашей инструкции и поставьте триггер onEdit, чтобы отправлять
              изменения по вебхуку.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://github.com/symonbaikov/parse-ledger/blob/main/docs/google-sheets-apps-script.md"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Инструкция по Apps Script
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://docs.google.com/spreadsheets/u/0/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Открыть Google Sheets
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-3 rounded-lg bg-gray-50 border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-600">
              Эндпоинт вебхука: <code className="font-mono">/api/v1/integrations/google-sheets/update</code> <br />
              Заголовок: <code className="font-mono">X-Webhook-Token: &lt;ваш токен&gt;</code>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Подключённые таблицы</h3>
              <span className="text-xs text-gray-500">Автообновление по вебхуку</span>
            </div>

            {loadingList ? (
              <div className="space-y-2">
                {[1, 2].map((key) => (
                  <div
                    key={key}
                    className="animate-pulse rounded-lg border border-gray-100 bg-gray-50 p-3 h-20"
                  />
                ))}
              </div>
            ) : emptyState ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                Пока нет подключений. Добавьте первую таблицу через форму слева.
              </div>
            ) : (
              <div className="space-y-3">
                {connections.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{item.sheetName}</span>
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Активно
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 break-all">
                          ID: {item.sheetId}
                        </p>
                        {item.worksheetName && (
                          <p className="text-xs text-gray-500">Лист: {item.worksheetName}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Последняя синхронизация:{' '}
                          {item.lastSync ? new Date(item.lastSync).toLocaleString() : '—'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleSync(item.id)}
                          disabled={syncingId === item.id}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-60"
                        >
                          {syncingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCcw className="h-4 w-4" />
                          )}
                          Синхронизировать
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          disabled={removingId === item.id}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                          {removingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Отключить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
