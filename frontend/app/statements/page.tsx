'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UploadCloud, 
  FileText, 
  Eye, 
  Download, 
  Trash2, 
  RefreshCw, 
  X,
  File,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Terminal
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';
import ConfirmModal from '@/app/components/ConfirmModal';

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

export default function StatementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);
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
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statementToDelete, setStatementToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadStatements();
    }
  }, [user]);

  const loadStatements = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/statements');
      const statementsData = response.data.data || response.data;
      const statementsWithFileType = Array.isArray(statementsData)
        ? statementsData.map((stmt: Statement & { file_type?: string }) => ({
            ...stmt,
            fileType: stmt.fileType || stmt.file_type || 'pdf',
          }))
        : statementsData;
      setStatements(statementsWithFileType);
    } catch (error) {
      console.error('Failed to load statements:', error);
      toast.error('Не удалось загрузить список выписок');
    } finally {
      setLoading(false);
    }
  };

  const handleReprocess = async (id: string) => {
    const toastId = toast.loading('Запуск обработки...');
    try {
      await apiClient.post(`/statements/${id}/reprocess`);
      await loadStatements();
      toast.success('Обработка запущена успешно', { id: toastId });
    } catch (error) {
      console.error('Failed to reprocess statement:', error);
      toast.error('Ошибка при запуске обработки', { id: toastId });
    }
  };

  const confirmDelete = (id: string) => {
    setStatementToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!statementToDelete) return;

    const toastId = toast.loading('Удаление...');
    try {
      await apiClient.delete(`/statements/${statementToDelete}`);
      await loadStatements();
      toast.success('Выписка удалена', { id: toastId });
    } catch (error) {
      console.error('Failed to delete statement:', error);
      toast.error('Ошибка при удалении', { id: toastId });
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
    const filtered = files.filter((f) => allowed.includes(f.type));
    if (filtered.length === 0) {
      toast.error('Неподдерживаемый формат файла');
      return;
    }
    setUploadFiles((prev) => [...prev, ...filtered].slice(0, 5));
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
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      toast.error('Выберите хотя бы один файл');
      return;
    }
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    uploadFiles.forEach((file) => formData.append('files', file));

    try {
      await apiClient.post('/statements/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Файлы загружены, начата обработка');
      setUploadFiles([]);
      setUploadModalOpen(false);
      await loadStatements();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Не удалось загрузить файлы';
      setUploadError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle2 size={12} className="mr-1" /> Завершено
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <Loader2 size={12} className="mr-1 animate-spin" /> Обработка
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <AlertCircle size={12} className="mr-1" /> Ошибка
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

  const getFileIcon = (fileType?: string) => {
    return <FileText className="text-red-500" size={24} />;
  };

  const handleDownloadFile = async (id: string, fileName: string) => {
    const toastId = toast.loading('Скачивание файла...');
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/statements/${id}/file`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

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
        toast.success('Файл успешно скачан', { id: toastId });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error('Не удалось скачать файл', { id: toastId });
    }
  };

  const handleViewFile = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/statements/${id}/view`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setFileViewUrl(url);
        setViewingFile(id);
      }
    } catch (error) {
      console.error('Failed to load file:', error);
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
      toast.error('Не удалось получить логи обработки');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header / CTA Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Банковские выписки</h1>
          <p className="text-secondary mt-1">
            Управляйте загруженными файлами, отслеживайте статус обработки и экспортируйте данные.
          </p>
        </div>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          <UploadCloud className="-ml-1 mr-2 h-5 w-5" />
          Загрузить выписку
        </button>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
           <h2 className="text-lg font-semibold text-gray-900">Все выписки</h2>
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
            <h3 className="text-lg font-medium text-gray-900">Нет загруженных файлов</h3>
            <p className="mt-1 text-gray-500">Загрузите свою первую банковскую выписку, чтобы начать работу.</p>
            <div className="mt-6">
              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <UploadCloud className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Загрузить файл
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Файл
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Банк
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Транзакции
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statements.map((statement) => (
                  <tr
                    key={statement.id}
                    className={`transition-colors group ${
                      statement.status === 'processing'
                        ? 'bg-green-50/70 animate-pulse'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center cursor-pointer" onClick={() => handleViewFile(statement.id)}>
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded bg-red-50">
                           {getFileIcon(statement.fileType)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                            {statement.fileName}
                          </div>
                          <div className="text-xs text-gray-500">PDF Document</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(statement.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium capitalize">{statement.bankName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{statement.totalTransactions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(statement.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(statement.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewFile(statement.id)}
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary"
                          title="Просмотреть"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownloadFile(statement.id, statement.fileName)}
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary"
                          title="Скачать"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => openLogs(statement.id, statement.fileName)}
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary"
                          title="Логи обработки"
                        >
                          <Terminal size={18} />
                        </button>
                        {statement.status === 'error' && (
                          <button
                            onClick={() => handleReprocess(statement.id)}
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-orange-500"
                            title="Повторить"
                          >
                            <RefreshCw size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => confirmDelete(statement.id)}
                          className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600"
                          title="Удалить"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
            onClick={() => {
              setUploadModalOpen(false);
              setUploadFiles([]);
              setUploadError(null);
            }} 
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/5 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Загрузка файлов</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Поддерживаются PDF, Excel, CSV и изображения
                </p>
              </div>
              <button
                onClick={() => {
                  setUploadModalOpen(false);
                  setUploadFiles([]);
                  setUploadError(null);
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
                onDragOver={(e) => e.preventDefault()}
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
                    Нажмите для выбора 
                    <span className="font-normal text-gray-500"> или перетащите файлы</span>
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Максимум 5 файлов до 10 МБ каждый
                  </p>
                </div>
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
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} МБ
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
                }}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                disabled={uploading}
              >
                Отмена
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || uploadFiles.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary-hover hover:shadow-primary/40 focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                {uploading ? 'Загрузка...' : 'Загрузить файлы'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить выписку?"
        message="Вы уверены, что хотите удалить эту выписку? Это действие нельзя отменить, и файл будет удален из хранилища."
        confirmText="Удалить"
        cancelText="Отмена"
        isDestructive={true}
      />

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center">
                 <div className="mr-3 p-1.5 bg-white rounded shadow-sm border border-gray-100">
                    <FileText size={20} className="text-red-500" />
                 </div>
                 <h3 className="text-lg font-semibold text-gray-900">
                    {statements.find(s => s.id === viewingFile)?.fileName}
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
                  title="Предпросмотр файла"
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
                Закрыть
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
                Скачать файл
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
                <div className="text-sm text-gray-500">Логи обработки</div>
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
                <div className="py-8 text-center text-gray-500">Логи пока отсутствуют</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {logEntries.map((entry, idx) => (
                    <li key={`${entry.timestamp}-${idx}`} className="px-5 py-3 flex items-start space-x-3">
                      <div className="text-xs text-gray-400 w-32 shrink-0">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
              Обновляется каждые 3 секунды. Закройте окно, чтобы остановить.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
