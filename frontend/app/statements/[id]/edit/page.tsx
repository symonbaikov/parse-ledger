'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Checkbox,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Save,
  Delete,
  ArrowBack,
  CheckCircle,
  Cancel,
  Info,
  ExpandMore,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import apiClient from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';

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
  transactionType: 'income' | 'expense';
  category?: { id: string; name: string };
  branch?: { id: string; name: string };
  wallet?: { id: string; name: string };
}

interface Statement {
  id: string;
  fileName: string;
  status: string;
  totalTransactions: number;
  parsingDetails?: {
    detectedBank?: string;
    detectedFormat?: string;
    parserUsed?: string;
    totalLinesProcessed?: number;
    transactionsFound?: number;
    transactionsCreated?: number;
    errors?: string[];
    warnings?: string[];
    metadataExtracted?: {
      accountNumber?: string;
      dateFrom?: string;
      dateTo?: string;
      balanceStart?: number;
      balanceEnd?: number;
    };
    processingTime?: number;
    logEntries?: Array<{ timestamp: string; level: string; message: string }>;
  } | null;
}

export default function EditStatementPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const statementId = params.id as string;

  const [statement, setStatement] = useState<Statement | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Record<string, Partial<Transaction>>>({});

  useEffect(() => {
    if (user && statementId) {
      loadData();
    }
  }, [user, statementId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statementRes, transactionsRes] = await Promise.all([
        apiClient.get(`/statements/${statementId}`),
        apiClient.get(`/transactions?statement_id=${statementId}&limit=1000`),
      ]);

      setStatement(statementRes.data);
      setTransactions(transactionsRes.data.data || transactionsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRowSelect = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === transactions.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(transactions.map((t) => t.id)));
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingRow(transaction.id);
    setEditedData({
      [transaction.id]: {
        ...transaction,
      },
    });
  };

  const handleFieldChange = (
    transactionId: string,
    field: keyof Transaction,
    value: any,
  ) => {
    setEditedData({
      ...editedData,
      [transactionId]: {
        ...editedData[transactionId],
        [field]: value,
      },
    });
  };

  const handleSave = async (transactionId: string) => {
    try {
      const updates = editedData[transactionId];
      if (!updates) return;

      await apiClient.put(`/transactions/${transactionId}`, updates);
      await loadData();
      setEditingRow(null);
      setEditedData({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save transaction');
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedData({});
  };

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await apiClient.delete(`/transactions/${transactionId}`);
      await loadData();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete transaction');
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedRows.size === 0) {
      setError('Please select at least one transaction');
      return;
    }

    try {
      setSaving(true);
      const updates = Array.from(selectedRows).map((id) => ({
        id,
        updates: editedData[id] || {},
      }));

      await apiClient.post('/transactions/bulk-update', { items: updates });
      await loadData();
      setSelectedRows(new Set());
      setEditedData({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update transactions');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) {
      setError('Please select at least one transaction');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedRows.size} transactions?`)) {
      return;
    }

    try {
      setSaving(true);
      await Promise.all(
        Array.from(selectedRows).map((id) => apiClient.delete(`/transactions/${id}`)),
      );
      await loadData();
      setSelectedRows(new Set());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete transactions');
    } finally {
      setSaving(false);
    }
  };

  type ColumnKey = keyof Transaction;
  interface ColumnDef {
    key: ColumnKey;
    label: string;
    multiline?: boolean;
  }

  const columnDefs: ColumnDef[] = [
    { key: 'transactionDate', label: 'Дата операции' },
    { key: 'documentNumber', label: 'Номер документа' },
    { key: 'counterpartyName', label: 'Наименование контрагента', multiline: true },
    { key: 'counterpartyBin', label: 'БИН/номер счёта контрагента' },
    { key: 'counterpartyBank', label: 'Реквизиты банка контрагента', multiline: true },
    { key: 'debit', label: 'Дебет' },
    { key: 'credit', label: 'Кредит' },
    { key: 'paymentPurpose', label: 'Назначение платежа', multiline: true },
  ];

  const mandatoryColumns: ColumnKey[] = columnDefs.map((col) => col.key);

  const hasDataForColumn = (key: ColumnKey): boolean => {
    if (mandatoryColumns.includes(key)) {
      return true;
    }
    return transactions.some((t) => {
      const edited = editedData[t.id];
      const value = edited && key in edited ? edited[key] : t[key];
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      return true;
    });
  };

  const visibleColumns = columnDefs.filter((col) => hasDataForColumn(col.key));

  const formatNumber = (value?: number) =>
    value !== undefined && value !== null
      ? value.toLocaleString('ru-RU', { minimumFractionDigits: 2 })
      : '-';

  const renderDisplayCell = (transaction: Transaction, column: ColumnDef) => {
    switch (column.key) {
      case 'transactionDate':
        return new Date(transaction.transactionDate).toLocaleDateString('ru-RU');
      case 'documentNumber':
        return transaction.documentNumber || '-';
      case 'counterpartyName':
        return transaction.counterpartyName || '-';
      case 'counterpartyBin': {
        const bin = transaction.counterpartyBin;
        const account = transaction.counterpartyAccount;
        if (bin && account) {
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <span>{bin}</span>
              <span>{account}</span>
            </Box>
          );
        }
        return bin || account || '-';
      }
      case 'counterpartyBank':
        return transaction.counterpartyBank || '-';
      case 'debit':
        return formatNumber(transaction.debit);
      case 'credit':
        return formatNumber(transaction.credit);
      case 'paymentPurpose':
        return transaction.paymentPurpose || '-';
      default:
        return (transaction as any)[column.key] || '-';
    }
  };

  const renderEditCell = (transaction: Transaction, edited: Partial<Transaction>, column: ColumnDef) => {
    const commonTextFieldProps = {
      size: 'small' as const,
      fullWidth: true,
      multiline: column.multiline,
    };

    switch (column.key) {
      case 'transactionDate':
        return (
          <TextField
            {...commonTextFieldProps}
            type="date"
            value={edited.transactionDate?.split('T')[0] || transaction.transactionDate.split('T')[0]}
            onChange={(e) =>
              handleFieldChange(transaction.id, 'transactionDate', e.target.value)
            }
          />
        );
      case 'documentNumber':
      case 'counterpartyName':
      case 'counterpartyBank':
        return (
          <TextField
            {...commonTextFieldProps}
            value={(edited as any)[column.key] ?? (transaction as any)[column.key] ?? ''}
            onChange={(e) => handleFieldChange(transaction.id, column.key, e.target.value)}
          />
        );
      case 'counterpartyBin':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              {...commonTextFieldProps}
              placeholder="БИН"
              value={edited.counterpartyBin ?? transaction.counterpartyBin ?? ''}
              onChange={(e) => handleFieldChange(transaction.id, 'counterpartyBin', e.target.value)}
            />
            <TextField
              {...commonTextFieldProps}
              placeholder="Номер счёта"
              value={edited.counterpartyAccount ?? transaction.counterpartyAccount ?? ''}
              onChange={(e) =>
                handleFieldChange(transaction.id, 'counterpartyAccount', e.target.value)
              }
            />
          </Box>
        );
      case 'paymentPurpose':
        return (
          <TextField
            {...commonTextFieldProps}
            value={edited.paymentPurpose ?? transaction.paymentPurpose ?? ''}
            onChange={(e) => handleFieldChange(transaction.id, 'paymentPurpose', e.target.value)}
          />
        );
      case 'debit':
      case 'credit':
        return (
          <TextField
            {...commonTextFieldProps}
            type="number"
            value={(edited as any)[column.key] ?? (transaction as any)[column.key] ?? ''}
            onChange={(e) =>
              handleFieldChange(
                transaction.id,
                column.key,
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        );
      default:
        return (transaction as any)[column.key] ?? '-';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Button startIcon={<ArrowBack />} onClick={() => router.back()}>
            Back
          </Button>
          <Typography variant="h5" component="h1" sx={{ mt: 2 }}>
            Edit Statement: {statement?.fileName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statement?.totalTransactions} transactions
          </Typography>
        </Box>
        {selectedRows.size > 0 && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleBulkUpdate}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            >
              Save Selected ({selectedRows.size})
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleBulkDelete}
              disabled={saving}
              startIcon={<Delete />}
            >
              Delete Selected
            </Button>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
          Changes saved successfully!
        </Alert>
      )}

      {statement?.parsingDetails && (
        <Paper sx={{ mb: 3, p: 2 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info color="primary" />
                <Typography variant="h6">Детали парсинга</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Общая информация
                  </Typography>
                  <Typography variant="body2">
                    Банк: {statement.parsingDetails.detectedBank || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Формат: {statement.parsingDetails.detectedFormat || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Парсер: {statement.parsingDetails.parserUsed || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Время обработки: {statement.parsingDetails.processingTime ? `${statement.parsingDetails.processingTime}ms` : 'N/A'}
                  </Typography>
                </Box>

                {statement.parsingDetails.metadataExtracted && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Извлеченные метаданные
                    </Typography>
                    <Typography variant="body2">
                      Счет: {statement.parsingDetails.metadataExtracted.accountNumber || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Период: {statement.parsingDetails.metadataExtracted.dateFrom ? new Date(statement.parsingDetails.metadataExtracted.dateFrom).toLocaleDateString('ru-RU') : 'N/A'} - {statement.parsingDetails.metadataExtracted.dateTo ? new Date(statement.parsingDetails.metadataExtracted.dateTo).toLocaleDateString('ru-RU') : 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Остаток на начало: {statement.parsingDetails.metadataExtracted.balanceStart || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Остаток на конец: {statement.parsingDetails.metadataExtracted.balanceEnd || 'N/A'}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Статистика парсинга
                  </Typography>
                  <Typography variant="body2">
                    Найдено транзакций: {statement.parsingDetails.transactionsFound ?? 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Создано транзакций: {statement.parsingDetails.transactionsCreated ?? 'N/A'}
                  </Typography>
                  {statement.parsingDetails.totalLinesProcessed && (
                    <Typography variant="body2">
                      Обработано строк: {statement.parsingDetails.totalLinesProcessed}
                    </Typography>
                  )}
                </Box>

                {statement.parsingDetails.errors && statement.parsingDetails.errors.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="error">
                      Ошибки ({statement.parsingDetails.errors.length})
                    </Typography>
                    {statement.parsingDetails.errors.map((error, idx) => (
                      <Alert key={idx} severity="error" sx={{ mt: 1 }}>
                        {error}
                      </Alert>
                    ))}
                  </Box>
                )}

                {statement.parsingDetails.warnings && statement.parsingDetails.warnings.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="warning.main">
                      Предупреждения ({statement.parsingDetails.warnings.length})
                    </Typography>
                    {statement.parsingDetails.warnings.map((warning, idx) => (
                      <Alert key={idx} severity="warning" sx={{ mt: 1 }}>
                        {warning}
                      </Alert>
                    ))}
                  </Box>
                )}

                {statement.parsingDetails.logEntries && statement.parsingDetails.logEntries.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Лог обработки ({statement.parsingDetails.logEntries.length} записей)
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 300,
                        overflow: 'auto',
                        bgcolor: 'grey.100',
                        p: 1,
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                      }}
                    >
                      {statement.parsingDetails.logEntries.map((log, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            color:
                              log.level === 'error'
                                ? 'error.main'
                                : log.level === 'warn'
                                ? 'warning.main'
                                : 'text.primary',
                            mb: 0.5,
                          }}
                        >
                          <span style={{ opacity: 0.7 }}>
                            {new Date(log.timestamp).toLocaleTimeString('ru-RU')}
                          </span>{' '}
                          <span style={{ fontWeight: 'bold' }}>[{log.level.toUpperCase()}]</span>{' '}
                          {log.message}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedRows.size === transactions.length && transactions.length > 0}
                  indeterminate={
                    selectedRows.size > 0 && selectedRows.size < transactions.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              {visibleColumns.map((col) => (
                <TableCell key={col.key}>{col.label}</TableCell>
              ))}
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => {
              const isEditing = editingRow === transaction.id;
              const edited = editedData[transaction.id] || transaction;

              return (
                <TableRow key={transaction.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRows.has(transaction.id)}
                      onChange={() => handleRowSelect(transaction.id)}
                    />
                  </TableCell>
                  {visibleColumns.map((col) => (
                    <TableCell key={col.key}>
                      {isEditing
                        ? renderEditCell(transaction, edited, col)
                        : renderDisplayCell(transaction, col)}
                    </TableCell>
                  ))}
                  <TableCell>
                    {isEditing ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleSave(transaction.id)}
                        >
                          <CheckCircle />
                        </IconButton>
                        <IconButton size="small" onClick={handleCancel}>
                          <Cancel />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Save />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
