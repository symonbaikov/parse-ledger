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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save,
  Delete,
  ArrowBack,
  CheckCircle,
  Cancel,
  Info,
  ExpandMore,
  WarningAmber,
  Category,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import apiClient from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';

interface CategoryOption {
  id: string;
  name: string;
  type?: 'income' | 'expense';
  children?: CategoryOption[];
}

interface BranchOption {
  id: string;
  name: string;
}

interface WalletOption {
  id: string;
  name: string;
}

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
  statementDateFrom?: string | null;
  statementDateTo?: string | null;
  balanceStart?: number | string | null;
  balanceEnd?: number | string | null;
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

const flattenCategories = (items: CategoryOption[], prefix = ''): CategoryOption[] =>
  items.flatMap((item) => {
    const currentName = prefix ? `${prefix} / ${item.name}` : item.name;
    return [
      { ...item, name: currentName },
      ...(item.children ? flattenCategories(item.children, currentName) : []),
    ];
  });

const normalizeDateInput = (value?: string | Date | null) => {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

const normalizeNumberInput = (value?: number | string | null) => {
  if (value === null || value === undefined) return '';
  return typeof value === 'string' ? value : value.toString();
};

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
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [bulkCategoryDialogOpen, setBulkCategoryDialogOpen] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  const [metadataForm, setMetadataForm] = useState({
    balanceStart: '',
    balanceEnd: '',
    statementDateFrom: '',
    statementDateTo: '',
  });
  const [metadataSaving, setMetadataSaving] = useState(false);

  useEffect(() => {
    if (user && statementId) {
      loadData();
    }
  }, [user, statementId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setOptionsLoading(true);
      const [statementRes, transactionsRes, categoriesRes, branchesRes, walletsRes] = await Promise.all([
        apiClient.get(`/statements/${statementId}`),
        apiClient.get(`/transactions?statement_id=${statementId}&limit=1000`),
        apiClient.get('/categories'),
        apiClient.get('/branches'),
        apiClient.get('/wallets'),
      ]);

      const statementData = statementRes.data?.data || statementRes.data;
      setStatement(statementData);
      setTransactions(transactionsRes.data.data || transactionsRes.data);
      setCategories(categoriesRes.data?.data || categoriesRes.data || []);
      setBranches(branchesRes.data?.data || branchesRes.data || []);
      setWallets(walletsRes.data?.data || walletsRes.data || []);

      const extractedMeta = statementData?.parsingDetails?.metadataExtracted || {};
      setMetadataForm({
        balanceStart: normalizeNumberInput(
          statementData?.balanceStart ?? extractedMeta.balanceStart,
        ),
        balanceEnd: normalizeNumberInput(
          statementData?.balanceEnd ?? extractedMeta.balanceEnd,
        ),
        statementDateFrom: normalizeDateInput(
          statementData?.statementDateFrom ?? extractedMeta.dateFrom,
        ),
        statementDateTo: normalizeDateInput(
          statementData?.statementDateTo ?? extractedMeta.dateTo,
        ),
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
      setOptionsLoading(false);
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
      setError(err.response?.data?.error?.message || 'Не удалось сохранить транзакцию');
    }
  };

  const handleMetadataChange = (field: keyof typeof metadataForm, value: string) => {
    setMetadataForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMetadataSave = async () => {
    try {
      setMetadataSaving(true);
      const payload = {
        balanceStart: metadataForm.balanceStart === '' ? null : Number(metadataForm.balanceStart),
        balanceEnd: metadataForm.balanceEnd === '' ? null : Number(metadataForm.balanceEnd),
        statementDateFrom: metadataForm.statementDateFrom || null,
        statementDateTo: metadataForm.statementDateTo || null,
      };

      const response = await apiClient.patch(`/statements/${statementId}`, payload);
      const updatedStatement = response.data?.data || response.data;
      setStatement(updatedStatement);

      const meta = updatedStatement?.parsingDetails?.metadataExtracted || {};
      setMetadataForm({
        balanceStart: normalizeNumberInput(
          updatedStatement?.balanceStart ?? meta.balanceStart,
        ),
        balanceEnd: normalizeNumberInput(updatedStatement?.balanceEnd ?? meta.balanceEnd),
        statementDateFrom: normalizeDateInput(
          updatedStatement?.statementDateFrom ?? meta.dateFrom,
        ),
        statementDateTo: normalizeDateInput(
          updatedStatement?.statementDateTo ?? meta.dateTo,
        ),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось обновить данные выписки');
    } finally {
      setMetadataSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedData({});
  };

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
      return;
    }

    try {
      await apiClient.delete(`/transactions/${transactionId}`);
      await loadData();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось удалить транзакцию');
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedRows.size === 0) {
      setError('Выберите хотя бы одну транзакцию');
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
      setError(err.response?.data?.error?.message || 'Не удалось обновить транзакции');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) {
      setError('Выберите хотя бы одну транзакцию');
      return;
    }

    if (!confirm(`Вы уверены, что хотите удалить ${selectedRows.size} транзакций?`)) {
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
      setError(err.response?.data?.error?.message || 'Не удалось удалить транзакции');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenBulkCategory = () => {
    if (selectedRows.size === 0) {
      setError('Выберите транзакции, чтобы назначить категорию');
      return;
    }
    setBulkCategoryDialogOpen(true);
  };

  const handleApplyBulkCategory = async () => {
    if (!bulkCategoryId) {
      setError('Выберите категорию для назначения');
      return;
    }

    try {
      setSaving(true);
      const items = Array.from(selectedRows).map((id) => ({
        id,
        updates: { categoryId: bulkCategoryId },
      }));

      await apiClient.post('/transactions/bulk-update', { items });
      await loadData();
      setBulkCategoryDialogOpen(false);
      setBulkCategoryId('');
      setSelectedRows(new Set());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось назначить категорию');
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
    { key: 'categoryId', label: 'Категория' },
    { key: 'branchId', label: 'Филиал' },
    { key: 'walletId', label: 'Кошелек' },
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
      case 'categoryId':
        return transaction.category ? (
          transaction.category.name
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
            <WarningAmber fontSize="small" />
            <span>Нет категории</span>
          </Box>
        );
      case 'branchId':
        return transaction.branch?.name || '—';
      case 'walletId':
        return transaction.wallet?.name || '—';
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

    const commonSelectProps = {
      size: 'small' as const,
      fullWidth: true,
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
      case 'categoryId': {
        const availableCategories = flattenCategories(categories).filter(
          (cat) => !cat.type || cat.type === transaction.transactionType,
        );
        return (
          <TextField
            {...commonSelectProps}
            select
            value={edited.categoryId ?? transaction.categoryId ?? ''}
            onChange={(e) =>
              handleFieldChange(transaction.id, 'categoryId', e.target.value || null)
            }
            placeholder="Категория"
            disabled={optionsLoading}
          >
            <MenuItem value="">Без категории</MenuItem>
            {availableCategories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
        );
      }
      case 'branchId':
        return (
          <TextField
            {...commonSelectProps}
            select
            value={edited.branchId ?? transaction.branchId ?? ''}
            onChange={(e) =>
              handleFieldChange(transaction.id, 'branchId', e.target.value || null)
            }
            placeholder="Филиал"
            disabled={optionsLoading}
          >
            <MenuItem value="">Без филиала</MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.name}
              </MenuItem>
            ))}
          </TextField>
        );
      case 'walletId':
        return (
          <TextField
            {...commonSelectProps}
            select
            value={edited.walletId ?? transaction.walletId ?? ''}
            onChange={(e) =>
              handleFieldChange(transaction.id, 'walletId', e.target.value || null)
            }
            placeholder="Кошелек"
            disabled={optionsLoading}
          >
            <MenuItem value="">Без кошелька</MenuItem>
            {wallets.map((wallet) => (
              <MenuItem key={wallet.id} value={wallet.id}>
                {wallet.name}
              </MenuItem>
            ))}
          </TextField>
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
            Назад
          </Button>
          <Typography variant="h5" component="h1" sx={{ mt: 2 }}>
            Редактирование выписки: {statement?.fileName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statement?.totalTransactions} транзакций
          </Typography>
        </Box>
        {selectedRows.size > 0 && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleOpenBulkCategory}
              startIcon={<Category />}
              disabled={saving}
            >
              Назначить категорию
            </Button>
            <Button
              variant="contained"
              onClick={handleBulkUpdate}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            >
              Сохранить выбранные ({selectedRows.size})
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleBulkDelete}
              disabled={saving}
              startIcon={<Delete />}
            >
              Удалить выбранные
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
          Изменения успешно сохранены!
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        После загрузки сразу переходите к проверке: строки без категории подсвечены, выберите им
        категорию вручную или через массовое действие.
      </Alert>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info color="primary" />
            <Typography variant="h6">Информация о выписке</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={metadataSaving ? <CircularProgress size={18} /> : <Save />}
            onClick={handleMetadataSave}
            disabled={metadataSaving}
          >
            Сохранить данные выписки
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
          <TextField
            label="Период с"
            type="date"
            value={metadataForm.statementDateFrom}
            onChange={(e) => handleMetadataChange('statementDateFrom', e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText={
              statement?.parsingDetails?.metadataExtracted?.dateFrom
                ? `Из файла: ${new Date(
                    statement.parsingDetails.metadataExtracted.dateFrom,
                  ).toLocaleDateString('ru-RU')}`
                : undefined
            }
          />
          <TextField
            label="Период по"
            type="date"
            value={metadataForm.statementDateTo}
            onChange={(e) => handleMetadataChange('statementDateTo', e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText={
              statement?.parsingDetails?.metadataExtracted?.dateTo
                ? `Из файла: ${new Date(
                    statement.parsingDetails.metadataExtracted.dateTo,
                  ).toLocaleDateString('ru-RU')}`
                : undefined
            }
          />
          <TextField
            label="Остаток на начало"
            type="number"
            value={metadataForm.balanceStart}
            onChange={(e) => handleMetadataChange('balanceStart', e.target.value)}
            helperText={
              statement?.parsingDetails?.metadataExtracted?.balanceStart !== undefined
                ? `Из файла: ${statement.parsingDetails.metadataExtracted.balanceStart}`
                : 'Укажите вручную, если не подтянулось'
            }
          />
          <TextField
            label="Остаток на конец"
            type="number"
            value={metadataForm.balanceEnd}
            onChange={(e) => handleMetadataChange('balanceEnd', e.target.value)}
            helperText={
              statement?.parsingDetails?.metadataExtracted?.balanceEnd !== undefined
                ? `Из файла: ${statement.parsingDetails.metadataExtracted.balanceEnd}`
                : undefined
            }
          />
        </Box>

        {statement?.parsingDetails && (
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1">Детали парсинга</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Общая информация
                  </Typography>
                  <Typography variant="body2">
                    Банк: {statement.parsingDetails.detectedBank || '—'}
                  </Typography>
                  <Typography variant="body2">
                    Формат: {statement.parsingDetails.detectedFormat || '—'}
                  </Typography>
                  <Typography variant="body2">
                    Парсер: {statement.parsingDetails.parserUsed || '—'}
                  </Typography>
                  <Typography variant="body2">
                    Время обработки:{' '}
                    {statement.parsingDetails.processingTime
                      ? `${statement.parsingDetails.processingTime}ms`
                      : '—'}
                  </Typography>
                </Box>

                {statement.parsingDetails.metadataExtracted && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Извлеченные метаданные
                    </Typography>
                    <Typography variant="body2">
                      Счет: {statement.parsingDetails.metadataExtracted.accountNumber || '—'}
                    </Typography>
                    <Typography variant="body2">
                      Период:{' '}
                      {statement.parsingDetails.metadataExtracted.dateFrom
                        ? new Date(
                            statement.parsingDetails.metadataExtracted.dateFrom,
                          ).toLocaleDateString('ru-RU')
                        : '—'}{' '}
                      -{' '}
                      {statement.parsingDetails.metadataExtracted.dateTo
                        ? new Date(
                            statement.parsingDetails.metadataExtracted.dateTo,
                          ).toLocaleDateString('ru-RU')
                        : '—'}
                    </Typography>
                    <Typography variant="body2">
                      Остаток на начало:{' '}
                      {statement.parsingDetails.metadataExtracted.balanceStart ?? '—'}
                    </Typography>
                    <Typography variant="body2">
                      Остаток на конец: {statement.parsingDetails.metadataExtracted.balanceEnd ?? '—'}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Статистика парсинга
                  </Typography>
                  <Typography variant="body2">
                    Найдено транзакций: {statement.parsingDetails.transactionsFound ?? '—'}
                  </Typography>
                  <Typography variant="body2">
                    Создано транзакций: {statement.parsingDetails.transactionsCreated ?? '—'}
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

                {statement.parsingDetails.logEntries &&
                  statement.parsingDetails.logEntries.length > 0 && (
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
                            <span style={{ fontWeight: 'bold' }}>
                              [{log.level.toUpperCase()}]
                            </span>{' '}
                            {log.message}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
      </Paper>

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
              const missingCategory = !(
                edited.categoryId ??
                transaction.categoryId ??
                transaction.category?.id
              );

              return (
                <TableRow
                  key={transaction.id}
                  hover
                  sx={{
                    bgcolor: missingCategory ? 'rgba(255, 193, 7, 0.08)' : undefined,
                    borderLeft: missingCategory ? '4px solid #fbc02d' : undefined,
                  }}
                >
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

      <Dialog open={bulkCategoryDialogOpen} onClose={() => setBulkCategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Назначить категорию ({selectedRows.size} шт.)</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            select
            label="Категория"
            fullWidth
            value={bulkCategoryId}
            onChange={(e) => setBulkCategoryId(e.target.value)}
            helperText="Категория будет применена ко всем выбранным транзакциям"
          >
            <MenuItem value="">Не выбрано</MenuItem>
            {flattenCategories(categories).map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkCategoryDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} /> : <CheckCircle />}
            onClick={handleApplyBulkCategory}
            disabled={saving}
          >
            Применить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
