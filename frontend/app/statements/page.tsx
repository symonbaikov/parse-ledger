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
          onClick={() => router.push('/upload')}
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
                onClick={() => router.push('/upload')}
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
