"use client";

import ConfirmModal from '@/app/components/ConfirmModal';
import TransactionDocumentViewer from '@/app/components/TransactionDocumentViewer';
import { useLockBodyScroll } from '@/app/hooks/useLockBodyScroll';
import api from '@/app/lib/api';
import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ListAlt as ListAltIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  TableChart as TableChartIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { useIntlayer } from "next-intlayer";
import { useRouter, useSearchParams } from "next/navigation";
import React, { use, useEffect, useState } from "react";

interface Transaction {
  id: string;
  transactionDate: string;
  documentNumber?: string;
  counterpartyName: string;
  counterpartyBin?: string;
  counterpartyAccount?: string;
  counterpartyBank?: string;
  debit?: number;
  credit?: number;
  paymentPurpose: string;
  currency?: string;
  exchangeRate?: number;
  amountForeign?: number;
  categoryId?: string;
  branchId?: string;
  walletId?: string;
  article?: string;
  comments?: string;
  transactionType: "income" | "expense";
  category?: { id: string; name: string };
  branch?: { id: string; name: string };
  wallet?: { id: string; name: string };
}

interface Statement {
  id: string;
  fileName: string;
  status: string;
  totalTransactions: number;
  statementDateFrom?: string | null;
  statementDateTo?: string | null;
  balanceStart?: number | string | null;
  balanceEnd?: number | string | null;
  parsingDetails?: {
    detectedBank?: string;
    detectedFormat?: string;
    metadataExtracted?: {
      accountNumber?: string;
      dateFrom?: string;
      dateTo?: string;
      balanceStart?: number;
      balanceEnd?: number;
      headerDisplay?: {
        title?: string;
        subtitle?: string;
        periodDisplay?: string;
        accountDisplay?: string;
        institutionDisplay?: string;
        currencyDisplay?: string;
      };
    };
  } | null;
}

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

export default function ViewStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t: any = useIntlayer('statementEditPage' as any) as any;
  const statementsText: any = useIntlayer('statementsPage' as any) as any;
  const router = useRouter();
  const [statement, setStatement] = useState<Statement | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logsOpen, setLogsOpen] = useState(false);
  const [logEntries, setLogEntries] = useState<
    Array<{ timestamp: string; level: string; message: string }>
  >([]);
  const [logLoading, setLogLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const resolvedParams = use(params);
  const statementId = resolvedParams.id;

  useLockBodyScroll(logsOpen || deleteModalOpen);

  useEffect(() => {
    if (!statementId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch everything from storage/files which includes statement metadata and transactions
        const response = await api.get(`/storage/files/${statementId}`);
        const { statement, transactions } = response.data;

        setStatement(statement);
        setTransactions(transactions);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Не удалось загрузить данные выписки");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statementId]);

  const searchParams = useSearchParams();
  const shouldAutoPrint = searchParams.get("print") === "true";

  useEffect(() => {
    if (shouldAutoPrint && !loading && statement && transactions.length > 0) {
      setTimeout(() => {
        window.print();
      }, 1000); // Small delay to ensure rendering
    }
  }, [shouldAutoPrint, loading, statement, transactions]);

  useEffect(() => {
    if (!logsOpen || !statementId) return;
    let mounted = true;
    const tick = async () => {
      try {
        const res = await api.get(`/statements/${statementId}`);
        const details = res.data.parsingDetails || res.data.parsing_details;
        if (mounted) {
          setLogEntries(details?.logEntries || details?.log_entries || []);
        }
      } catch (err) {
        console.error('Failed to refresh logs:', err);
      }
    };
    tick();
    const interval = setInterval(tick, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [logsOpen, statementId]);

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    if (statementId) {
      router.push(`/statements/${statementId}/edit`);
    }
  };

  const handleDownloadFile = async () => {
    if (!statementId) return;
    const toastId = toast.loading(statementsText.download.loading.value);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiBaseUrl}/statements/${statementId}/file`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = statement?.fileName || 'statement';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(statementsText.download.success.value, { id: toastId });
      } else {
        const message = await extractErrorMessage(response);
        throw new Error(message || 'Download failed');
      }
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error((error as Error).message || statementsText.download.failed.value, {
        id: toastId,
      });
    }
  };

  const openLogs = async () => {
    if (!statementId) return;
    setLogsOpen(true);
    setLogLoading(true);
    try {
      const res = await api.get(`/statements/${statementId}`);
      const details = res.data.parsingDetails || res.data.parsing_details;
      setLogEntries(details?.logEntries || details?.log_entries || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
      toast.error(statementsText.logs.openFailed.value);
    } finally {
      setLogLoading(false);
    }
  };

  const closeLogs = () => {
    setLogsOpen(false);
    setLogEntries([]);
  };

  const handleReprocess = async () => {
    if (!statementId) return;
    const toastId = toast.loading(statementsText.reprocessStart.value);
    try {
      await api.post(`/statements/${statementId}/reprocess`);
      toast.success(statementsText.reprocessSuccess.value, { id: toastId });
    } catch (err) {
      console.error('Failed to reprocess statement:', err);
      toast.error(statementsText.reprocessError.value, { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!statementId) return;
    const toastId = toast.loading(statementsText.deleteLoading.value);
    try {
      await api.post(`/statements/${statementId}/trash`);
      toast.success(statementsText.deleteSuccess.value, { id: toastId });
      setDeleteModalOpen(false);
      router.push('/statements');
    } catch (err) {
      console.error('Failed to delete statement:', err);
      toast.error(statementsText.deleteError.value, { id: toastId });
    }
  };

  const [exportingToTable, setExportingToTable] = useState(false);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("ru-RU");
    } catch (err) {
      return String(dateString);
    }
  };

  const handleExportToCustomTable = async () => {
    if (!statementId) return;
    setExportingToTable(true);
    const toastId = toast.loading(t.labels.exportLoading.value);

    if (!statement) {
      toast.error(t.labels.exportFailure.value, { id: toastId });
      setExportingToTable(false);
      return;
    }

    try {
      const rawName = `Выписка — ${statement.fileName}`;
      const MAX_NAME_LENGTH = 120;
      const name =
        rawName.length > MAX_NAME_LENGTH
          ? rawName.slice(0, MAX_NAME_LENGTH)
          : rawName;

      const payload = {
        statementIds: [statementId],
        name,
        description: `Экспорт из выписки от ${formatDate(statement.statementDateFrom)} - ${formatDate(
          statement.statementDateTo,
        )}`,
      };

      const response = await api.post(
        "/custom-tables/from-statements",
        payload,
      );
      const tableId = response?.data?.tableId || response?.data?.id;

      if (tableId) {
        toast.success(t.labels.exportSuccess.value, { id: toastId });
        router.push(`/custom-tables/${tableId}`);
      } else {
        toast.error(t.labels.exportFailure.value, { id: toastId });
        router.push("/custom-tables");
      }
    } catch (err) {
      console.error("Export to custom table failed:", err);
      toast.error(t.labels.exportFailure.value, { id: toastId });
    } finally {
      setExportingToTable(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !statement) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Выписка не найдена"}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Назад
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "var(--background)" }}>
      {/* Action Bar - Hidden on print */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          bgcolor: "white",
          borderBottom: "1px solid",
          borderBottomColor: "grey.200",
          py: 2,
          "@media print": {
            display: "none",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Назад
          </Button>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Редактировать">
              <IconButton onClick={handleEdit} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t.labels.exportButton.value}>
              <IconButton
                onClick={handleExportToCustomTable}
                color="primary"
                disabled={exportingToTable || !transactions.length}
              >
                {exportingToTable ? (
                  <CircularProgress size={20} />
                ) : (
                  <TableChartIcon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title={statementsText.actions.download.value}>
              <IconButton onClick={handleDownloadFile} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={statementsText.actions.logs.value}>
              <IconButton onClick={openLogs} color="primary">
                <ListAltIcon />
              </IconButton>
            </Tooltip>
            {statement.status === 'error' && (
              <Tooltip title={statementsText.actions.retry.value}>
                <IconButton onClick={handleReprocess} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={statementsText.actions.delete.value}>
              <IconButton onClick={() => setDeleteModalOpen(true)} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Печать">
              <IconButton onClick={handlePrint} color="primary">
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>

      {/* Document Content */}
      <TransactionDocumentViewer
        statement={statement}
        transactions={transactions}
        locale="ru"
      />

      {logsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-muted">
              <div>
                <div className="text-sm text-gray-500">{statementsText.logs.title}</div>
                <div className="text-lg font-semibold text-gray-900">{statement.fileName}</div>
              </div>
              <button
                onClick={closeLogs}
                className="p-2 rounded-full hover:bg-muted text-gray-500 transition-colors"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {logLoading ? (
                <div className="flex items-center justify-center py-10">
                  <CircularProgress size={20} />
                </div>
              ) : logEntries.length === 0 ? (
                <div className="py-8 text-center text-gray-500">{statementsText.logs.empty}</div>
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
              {statementsText.logs.autoRefresh}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={statementsText.confirmDelete.title.value}
        message={statementsText.confirmDelete.message.value}
        confirmText={statementsText.confirmDelete.confirm.value}
        cancelText={statementsText.confirmDelete.cancel.value}
        isDestructive={true}
      />
    </Box>
  );
}
