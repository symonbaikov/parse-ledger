'use client';

import { BankLogoAvatar } from '@/app/components/BankLogoAvatar';
import ConfirmModal from '@/app/components/ConfirmModal';
import { DocumentTypeIcon } from '@/app/components/DocumentTypeIcon';
import { useAuth } from '@/app/hooks/useAuth';
import apiClient from '@/app/lib/api';
import { resolveBankLogo } from '@bank-logos';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  File,
  Loader2,
  RefreshCw,
  Search,
  Terminal,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { useIntlayer } from 'next-intlayer';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface Statement {
  id: string;
  fileName: string;
  status: string;
  totalTransactions: number;
  createdAt: string;
  processedAt?: string;
  bankName: string;
  fileType: string;
  parsingDetails?: {
    logEntries?: Array<{ timestamp: string; level: string; message: string }>;
  };
}

// Use the same API base everywhere so prod doesn't fall back to localhost
const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? '/api/v1').replace(/\/$/, '');

const extractErrorMessage = async (response: Response) => {
  try {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const payload = await response.json();
      return (
        payload?.error?.message ||
        payload?.message ||
        (typeof payload === 'string' ? payload : null)
      );
    }
    const text = await response.text();
    return text?.slice(0, 200) || null;
  } catch {
    return null;
  }
};

const getBankDisplayName = (bankName: string) => {
  const resolved = resolveBankLogo(bankName);
  if (!resolved) return bankName;
  return resolved.key !== 'other' ? resolved.displayName : bankName;
};

export default function StatementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const t = useIntlayer('statementsPage');
  const PAGE_SIZE = 20;
  const [statements, setStatements] = useState<Statement[]>([]);
  const statementsRef = useRef<Statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [fileViewUrl, setFileViewUrl] = useState<string | null>(null);
  const [logStatementId, setLogStatementId] = useState<string | null>(null);
  const [logEntries, setLogEntries] = useState<
    Array<{ timestamp: string; level: string; message: string }>
  >([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logStatementName, setLogStatementName] = useState<string>('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const allowDuplicatesLabel =
    (t.uploadModal as any)?.allowDuplicates?.value ?? 'Разрешить загрузку дубликатов';
  const totalPagesCount = Math.max(1, Math.ceil(total / pageSize) || 1);
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(total, page * pageSize);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statementToDelete, setStatementToDelete] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    statementsRef.current = statements;
  }, [statements]);

  useEffect(() => {
    if (!user) return;
    loadStatements({ page, search });
  }, [user, page, search]);

  const loadStatements = async (opts?: {
    silent?: boolean;
    notifyOnCompletion?: boolean;
    page?: number;
    search?: string;
  }) => {
    try {
      const { silent = false, notifyOnCompletion = false } = opts || {};
      const targetPage = opts?.page ?? page;
      const targetSearch = opts?.search ?? search;
      const prevStatements = statementsRef.current;
      const prevStatusById = new Map(prevStatements.map(s => [s.id, s.status]));
      if (!silent) setLoading(true);

      const response = await apiClient.get('/statements', {
        params: {
          page: targetPage,
          limit: PAGE_SIZE,
          search: targetSearch || undefined,
        },
      });

      const payload = response.data;
      const rawData = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.data)
          ? payload.data
          : [];

      const statementsWithFileType = rawData.map((stmt: Statement & { file_type?: string }) => ({
        ...stmt,
        fileType: stmt.fileType || stmt.file_type || 'pdf',
      }));

      const nextTotal =
        !Array.isArray(payload) && typeof payload.total === 'number'
          ? payload.total
          : statementsWithFileType.length;
      const nextPage =
        !Array.isArray(payload) && payload.page ? Number(payload.page) : targetPage;
      const nextLimit =
        !Array.isArray(payload) && payload.limit ? Number(payload.limit) : PAGE_SIZE;
      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / nextLimit) || 1);

      if (nextPage > nextTotalPages && nextTotal > 0) {
        setPage(nextTotalPages);
        return;
      }

      if (notifyOnCompletion && Array.isArray(statementsWithFileType)) {
        const processedStatuses = new Set(['parsed', 'validated', 'completed']);
        for (const next of statementsWithFileType) {
          const prevStatus = prevStatusById.get(next.id);
          if (!prevStatus) continue;

          const startedButNotFinished = prevStatus === 'processing' || prevStatus === 'uploaded';
          const finished = next.status !== 'processing' && next.status !== 'uploaded';
          if (!startedButNotFinished || !finished) continue;

          if (processedStatuses.has(next.status)) {
            toast.success(`${t.notify.donePrefix.value}: ${next.fileName}`);
          } else if (next.status === 'error') {
            toast.error(`${t.notify.errorPrefix.value}: ${next.fileName}`);
          } else {
            toast.success(`${t.notify.donePrefix.value}: ${next.fileName}`);
          }
        }
      }

      setStatements(statementsWithFileType);
      setTotal(nextTotal);
      setPageSize(nextLimit);
      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load statements:', error);
      toast.error(t.loadListError.value);
    } finally {
      const { silent = false } = opts || {};
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const hasProcessing = statements.some(
      s => s.status === 'processing' || (s.status === 'uploaded' && !s.processedAt),
    );
    if (!hasProcessing) return;
    const interval = setInterval(() => {
      loadStatements({ silent: true, notifyOnCompletion: true, page, search });
    }, 3000);
    return () => clearInterval(interval);
  }, [statements, page, search]);

  const handleReprocess = async (id: string) => {
    const toastId = toast.loading(t.reprocessStart.value);
    try {
      await apiClient.post(`/statements/${id}/reprocess`);
      await loadStatements({ page, search });
      toast.success(t.reprocessSuccess.value, { id: toastId });
    } catch (error) {
      console.error('Failed to reprocess statement:', error);
      toast.error(t.reprocessError.value, { id: toastId });
    }
  };

  const confirmDelete = (id: string) => {
    setStatementToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!statementToDelete) return;

    const toastId = toast.loading(t.deleteLoading.value);
    try {
      await apiClient.delete(`/statements/${statementToDelete}`);
      await loadStatements({ page, search });
      toast.success(t.deleteSuccess.value, { id: toastId });
    } catch (error) {
      console.error('Failed to delete statement:', error);
      toast.error(t.deleteError.value, { id: toastId });
    }
    setStatementToDelete(null);
  };

  const addFiles = (files: File[]) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'image/jpeg',
      'image/png',
    ];
    const filtered = files.filter(f => allowed.includes(f.type));
    if (filtered.length === 0) {
      toast.error(t.uploadModal.unsupportedFormat.value);
      return;
    }
    setUploadFiles(prev => [...prev, ...filtered].slice(0, 5));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      toast.error(t.uploadModal.pickAtLeastOne.value);
      return;
    }
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    uploadFiles.forEach(file => formData.append('files', file));
    if (allowDuplicates) {
      formData.append('allowDuplicates', 'true');
    }

    try {
      await apiClient.post('/statements/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(t.uploadModal.uploadedProcessing.value);
      setUploadFiles([]);
      setUploadModalOpen(false);
      setAllowDuplicates(false);
      setPage(1);
      await loadStatements({ page: 1, search });
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message || err?.response?.data?.message || t.uploadModal.uploadFailed.value;
      setUploadError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'parsed':
      case 'validated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle2 size={12} className="mr-1" /> {t.status.completed}
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <Loader2 size={12} className="mr-1 animate-spin" /> {t.status.processing}
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <AlertCircle size={12} className="mr-1" /> {t.status.error}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <Clock size={12} className="mr-1" /> {status}
          </span>
        );
    }
  };

  const getFileIcon = (fileType?: string, fileName?: string) => {
    return (
      <DocumentTypeIcon
        fileType={fileType}
        fileName={fileName}
        size={24}
        className="text-red-500"
      />
    );
  };

  const handleDownloadFile = async (id: string, fileName: string) => {
    const toastId = toast.loading(t.download.loading.value);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiBaseUrl}/statements/${id}/file`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(t.download.success.value, { id: toastId });
      } else {
        const message = await extractErrorMessage(response);
        throw new Error(message || 'Download failed');
      }
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error((error as Error).message || t.download.failed.value, { id: toastId });
    }
  };

  const handleViewFile = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiBaseUrl}/statements/${id}/view`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setFileViewUrl(url);
        setViewingFile(id);
      } else {
        const message = await extractErrorMessage(response);
        toast.error(message || t.viewFile.failed.value);
      }
    } catch (error) {
      console.error('Failed to load file:', error);
      toast.error(t.viewFile.failed.value);
    }
  };

  const handleCloseView = () => {
    if (fileViewUrl) {
      window.URL.revokeObjectURL(fileViewUrl);
      setFileViewUrl(null);
    }
    setViewingFile(null);
  };

  const openLogs = async (id: string, name: string) => {
    setLogStatementId(id);
    setLogStatementName(name);
    setLogLoading(true);
    try {
      const res = await apiClient.get(`/statements/${id}`);
      const details = res.data.parsingDetails || res.data.parsing_details;
      setLogEntries(details?.logEntries || details?.log_entries || []);
    } catch (error) {
      console.error('Failed to load logs:', error);
      toast.error(t.logs.openFailed.value);
    } finally {
      setLogLoading(false);
    }
  };

  useEffect(() => {
    if (!logStatementId) return;
    let mounted = true;
    const tick = async () => {
      try {
        const res = await apiClient.get(`/statements/${logStatementId}`);
        const details = res.data.parsingDetails || res.data.parsing_details;
        if (mounted) {
          setLogEntries(details?.logEntries || details?.log_entries || []);
        }
      } catch (error) {
        console.error('Failed to refresh logs:', error);
      }
    };
    tick();
    const interval = setInterval(tick, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [logStatementId]);

  const closeLogs = () => {
    setLogStatementId(null);
    setLogEntries([]);
    setLogStatementName('');
  };

  const viewingStatement = viewingFile ? statements.find(s => s.id === viewingFile) : null;

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header / CTA Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-secondary mt-1">{t.subtitle}</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Поиск по названию"
              aria-label="Поиск по выпискам"
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <UploadCloud className="-ml-1 mr-2 h-5 w-5" />
            {t.uploadStatement}
          </button>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">{t.allStatements}</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : statements.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="mx-auto h-16 w-16 text-gray-300 mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <File className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{t.empty.title}</h3>
            <p className="mt-1 text-gray-500">{t.empty.description}</p>
            <div className="mt-6">
              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <UploadCloud className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                {t.uploadModal.uploadFiles}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[40%]"
                    >
                      {t.table.file}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]"
                    >
                      {t.table.status}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%] hidden md:table-cell"
                    >
                      {t.table.bank}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%] hidden lg:table-cell"
                    >
                      {t.table.transactions}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]"
                    >
                      {t.table.date}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]"
                    >
                      {t.table.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statements.map(statement => (
                    <tr
                      key={statement.id}
                      className={`transition-all duration-200 group hover:shadow-md hover:bg-white hover:z-10 relative ${
                        statement.status === 'processing' ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          className="flex items-center w-full text-left cursor-pointer group/file"
                          onClick={() => handleViewFile(statement.id)}
                        >
                          <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 group-hover/file:bg-red-100 group-hover/file:scale-110 transition-all duration-200">
                            {getFileIcon(statement.fileType, statement.fileName)}
                          </div>
                          <div className="ml-4 min-w-0 flex-1">
                            <div
                              className="text-base font-semibold text-gray-900 truncate group-hover:text-primary transition-colors"
                              title={statement.fileName}
                            >
                              {statement.fileName.length > 20
                                ? `${statement.fileName.substring(0, 20)}...`
                                : statement.fileName}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-400">
                                {(statement.fileType || 'document').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        {getStatusBadge(statement.status)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap hidden md:table-cell">
                        <div className="flex items-center">
                          <BankLogoAvatar bankName={statement.bankName} size={32} className="mr-3" />
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {getBankDisplayName(statement.bankName)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-sm font-medium text-gray-900">
                          {statement.totalTransactions > 0 ? statement.totalTransactions : '—'}
                          <span className="text-gray-400 ml-1 font-normal text-xs">
                            {t.table.opsShort}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-smfont-medium text-gray-900">
                            {new Date(statement.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            {new Date(statement.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewFile(statement.id)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all"
                            title={t.actions.view.value}
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => handleDownloadFile(statement.id, statement.fileName)}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                            title={t.actions.download.value}
                          >
                            <Download size={20} />
                          </button>

                          <button
                            onClick={() => openLogs(statement.id, statement.fileName)}
                            disabled={logLoading && logStatementId === statement.id}
                            className={`p-2 rounded-lg transition-all ${
                              logLoading && logStatementId === statement.id
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                            title={t.actions.logs.value}
                          >
                            <Terminal size={20} />
                          </button>

                          {statement.status === 'error' && (
                            <button
                              onClick={() => handleReprocess(statement.id)}
                              className="p-2 rounded-lg text-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
                              title={t.actions.retry.value}
                            >
                              <RefreshCw size={20} />
                            </button>
                          )}
                          <button
                            onClick={() => confirmDelete(statement.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title={t.actions.delete.value}
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {total === 0
                  ? t.empty.title
                  : `Показано ${rangeStart}–${rangeEnd} из ${total}`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm border transition-all ${
                    page <= 1
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" /> Предыдущая
                </button>
                <span className="text-sm text-gray-600">
                  Страница {page} из {totalPagesCount}
                </span>
                <button
                  onClick={() => setPage(prev => Math.min(totalPagesCount, prev + 1))}
                  disabled={page >= totalPagesCount}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm border transition-all ${
                    page >= totalPagesCount
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Следующая <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            role="button"
            tabIndex={0}
            onClick={() => {
              setUploadModalOpen(false);
              setUploadFiles([]);
              setUploadError(null);
              setAllowDuplicates(false);
            }}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setUploadModalOpen(false);
                setUploadFiles([]);
                setUploadError(null);
                setAllowDuplicates(false);
              }
            }}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/5 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{t.uploadModal.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{t.uploadModal.subtitle}</p>
              </div>
              <button
                onClick={() => {
                  setUploadModalOpen(false);
                  setUploadFiles([]);
                  setUploadError(null);
                  setAllowDuplicates(false);
                }}
                className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-8 pb-8">
              {uploadError && (
                <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {uploadError}
                </div>
              )}

              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                className="group relative rounded-2xl border-2 border-solid border-gray-200 bg-gray-50/50 hover:border-blue-500 transition-all duration-200"
              >
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 cursor-pointer opacity-0 z-10"
                  accept=".pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png"
                  onChange={handleFileInput}
                />
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="mb-4 rounded-full bg-white p-4 shadow-sm ring-1 ring-gray-100 group-hover:scale-110 transition-transform duration-200">
                    <UploadCloud className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-base font-medium text-gray-900">
                    {t.uploadModal.dropHint1}{' '}
                    <span className="font-normal text-gray-500">{t.uploadModal.dropHint2}</span>
                  </p>
                  <p className="mt-2 text-xs text-gray-400">{t.uploadModal.maxHint}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input
                  id="allow-duplicates"
                  type="checkbox"
                  checked={allowDuplicates}
                  onChange={e => setAllowDuplicates(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="allow-duplicates" className="text-sm text-gray-700">
                  {allowDuplicatesLabel}
                </label>
              </div>

              {uploadFiles.length > 0 && (
                <div className="mt-6 flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {uploadFiles.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-gray-200 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                          <DocumentTypeIcon
                            fileType={file.type}
                            fileName={file.name}
                            size={20}
                            className="text-red-500"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} {t.uploadModal.mbShort}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeUploadFile(idx)}
                        className="rounded-full p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 pt-2 flex justify-end gap-3">
              <button
                onClick={() => {
                  setUploadModalOpen(false);
                  setUploadFiles([]);
                  setUploadError(null);
                  setAllowDuplicates(false);
                }}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                disabled={uploading}
              >
                {t.uploadModal.cancel}
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || uploadFiles.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary-hover hover:shadow-primary/40 focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                {uploading ? t.uploadModal.uploading : t.uploadModal.uploadFiles}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t.confirmDelete.title.value}
        message={t.confirmDelete.message.value}
        confirmText={t.confirmDelete.confirm.value}
        cancelText={t.confirmDelete.cancel.value}
        isDestructive={true}
      />

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center">
                <div className="mr-3 p-1.5 bg-white rounded shadow-sm border border-gray-100">
                  <DocumentTypeIcon
                    fileType={viewingStatement?.fileType}
                    fileName={viewingStatement?.fileName}
                    size={20}
                    className="text-red-500"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {viewingStatement?.fileName}
                </h3>
              </div>
              <button
                onClick={handleCloseView}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 bg-gray-100 relative">
              {fileViewUrl ? (
                <iframe
                  src={fileViewUrl}
                  className="w-full h-full border-0"
                  title={t.viewFile.previewTitle.value}
                />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end space-x-3">
              <button
                onClick={handleCloseView}
                className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                {t.viewFile.close}
              </button>
              <button
                onClick={() => {
                  const statement = statements.find(s => s.id === viewingFile);
                  if (statement) {
                    handleDownloadFile(viewingFile, statement.fileName);
                  }
                }}
                className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-hover font-medium text-sm shadow-sm flex items-center transition-colors"
              >
                <Download size={16} className="mr-2" />
                {t.viewFile.download}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs modal */}
      {logStatementId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <div className="text-sm text-gray-500">{t.logs.title}</div>
                <div className="text-lg font-semibold text-gray-900">{logStatementName}</div>
              </div>
              <button
                onClick={closeLogs}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {logLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : logEntries.length === 0 ? (
                <div className="py-8 text-center text-gray-500">{t.logs.empty}</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {logEntries.map((entry, idx) => (
                    <li
                      key={`${entry.timestamp}-${idx}`}
                      className="px-5 py-3 flex items-start space-x-3"
                    >
                      <div className="text-xs text-gray-400 w-32 shrink-0">
                        {new Date(entry.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                      <span
                        className={`text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
                          entry.level === 'error'
                            ? 'bg-red-100 text-red-700'
                            : entry.level === 'warn'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {entry.level}
                      </span>
                      <div className="text-sm text-gray-800 whitespace-pre-wrap flex-1">
                        {entry.message}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-200 bg-white text-sm text-gray-500">
              {t.logs.autoRefresh}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
