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
import { useIntlayer, useLocale } from 'next-intlayer';

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

const resolveLocale = (locale: string) => {
  if (locale === 'ru') return 'ru-RU';
  if (locale === 'kk') return 'kk-KZ';
  return 'en-US';
};

export default function EditStatementPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const t = useIntlayer('statementEditPage');
  const { locale } = useLocale();
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
      setError(err.response?.data?.error?.message || t.errors.loadData.value);
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
      setError(err.response?.data?.error?.message || t.errors.saveTransaction.value);
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
      setError(err.response?.data?.error?.message || t.errors.updateStatement.value);
    } finally {
      setMetadataSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedData({});
  };

  const handleDelete = async (transactionId: string) => {
    if (!confirm(t.confirms.deleteOne.value)) {
      return;
    }

    try {
      await apiClient.delete(`/transactions/${transactionId}`);
      await loadData();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t.errors.deleteTransaction.value);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedRows.size === 0) {
      setError(t.errors.selectAtLeastOneTransaction.value);
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
      setError(err.response?.data?.error?.message || t.errors.updateTransactions.value);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) {
      setError(t.errors.selectAtLeastOneTransaction.value);
      return;
    }

    if (!confirm(`${t.confirms.deleteManyPrefix.value}${selectedRows.size}${t.confirms.deleteManySuffix.value}`)) {
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
      setError(err.response?.data?.error?.message || t.errors.deleteTransactions.value);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenBulkCategory = () => {
    if (selectedRows.size === 0) {
      setError(t.errors.selectTransactionsForCategory.value);
      return;
    }
    setBulkCategoryDialogOpen(true);
  };

  const handleApplyBulkCategory = async () => {
    if (!bulkCategoryId) {
      setError(t.errors.selectCategoryToApply.value);
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
      setError(err.response?.data?.error?.message || t.errors.assignCategory.value);
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
    { key: 'transactionDate', label: t.columns.transactionDate.value },
    { key: 'documentNumber', label: t.columns.documentNumber.value },
    { key: 'counterpartyName', label: t.columns.counterpartyName.value, multiline: true },
    { key: 'counterpartyBin', label: t.columns.counterpartyBin.value },
    { key: 'counterpartyBank', label: t.columns.counterpartyBank.value, multiline: true },
    { key: 'debit', label: t.columns.debit.value },
    { key: 'credit', label: t.columns.credit.value },
    { key: 'paymentPurpose', label: t.columns.paymentPurpose.value, multiline: true },
    { key: 'categoryId', label: t.columns.categoryId.value },
    { key: 'branchId', label: t.columns.branchId.value },
    { key: 'walletId', label: t.columns.walletId.value },
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
      ? value.toLocaleString(resolveLocale(locale), { minimumFractionDigits: 2 })
      : '-';

  const renderDisplayCell = (transaction: Transaction, column: ColumnDef) => {
    switch (column.key) {
      case 'transactionDate':
        return new Date(transaction.transactionDate).toLocaleDateString(resolveLocale(locale));
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
            <span>{t.labels.noCategory}</span>
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
              placeholder={t.labels.binPlaceholder.value}
              value={edited.counterpartyBin ?? transaction.counterpartyBin ?? ''}
              onChange={(e) => handleFieldChange(transaction.id, 'counterpartyBin', e.target.value)}
            />
            <TextField
              {...commonTextFieldProps}
              placeholder={t.labels.accountNumberPlaceholder.value}
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
            placeholder={t.labels.category.value}
            disabled={optionsLoading}
          >
            <MenuItem value="">{t.labels.noCategoryOption}</MenuItem>
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
            placeholder={t.labels.branch.value}
            disabled={optionsLoading}
          >
            <MenuItem value="">{t.labels.noBranchOption}</MenuItem>
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
            placeholder={t.labels.wallet.value}
            disabled={optionsLoading}
          >
            <MenuItem value="">{t.labels.noWalletOption}</MenuItem>
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
            {t.labels.back}
          </Button>
          <Typography variant="h5" component="h1" sx={{ mt: 2 }}>
            {t.labels.editTitlePrefix}
            {statement?.fileName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statement?.totalTransactions} {t.labels.transactionsCount}
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
              {t.labels.assignCategory}
            </Button>
            <Button
              variant="contained"
              onClick={handleBulkUpdate}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            >
              {t.labels.saveSelectedPrefix}
              {selectedRows.size}
              {t.labels.saveSelectedSuffix}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleBulkDelete}
              disabled={saving}
              startIcon={<Delete />}
            >
              {t.labels.deleteSelected}
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
          {t.labels.changesSaved}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        {t.labels.infoHint}
      </Alert>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info color="primary" />
            <Typography variant="h6">{t.labels.statementInfoTitle}</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={metadataSaving ? <CircularProgress size={18} /> : <Save />}
            onClick={handleMetadataSave}
            disabled={metadataSaving}
          >
            {t.labels.saveStatementData}
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
          <TextField
            label={t.labels.periodFrom.value}
            type="date"
            value={metadataForm.statementDateFrom}
            onChange={(e) => handleMetadataChange('statementDateFrom', e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText={
              statement?.parsingDetails?.metadataExtracted?.dateFrom
                ? `${t.labels.fromFilePrefix.value}${new Date(
                    statement.parsingDetails.metadataExtracted.dateFrom,
                  ).toLocaleDateString(resolveLocale(locale))}`
                : undefined
            }
          />
          <TextField
            label={t.labels.periodTo.value}
            type="date"
            value={metadataForm.statementDateTo}
            onChange={(e) => handleMetadataChange('statementDateTo', e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText={
              statement?.parsingDetails?.metadataExtracted?.dateTo
                ? `${t.labels.fromFilePrefix.value}${new Date(
                    statement.parsingDetails.metadataExtracted.dateTo,
                  ).toLocaleDateString(resolveLocale(locale))}`
                : undefined
            }
          />
          <TextField
            label={t.labels.balanceStart.value}
            type="number"
            value={metadataForm.balanceStart}
            onChange={(e) => handleMetadataChange('balanceStart', e.target.value)}
            helperText={
              statement?.parsingDetails?.metadataExtracted?.balanceStart !== undefined
                ? `${t.labels.fromFilePrefix.value}${statement.parsingDetails.metadataExtracted.balanceStart}`
                : t.labels.enterManuallyHint.value
            }
          />
          <TextField
            label={t.labels.balanceEnd.value}
            type="number"
            value={metadataForm.balanceEnd}
            onChange={(e) => handleMetadataChange('balanceEnd', e.target.value)}
            helperText={
              statement?.parsingDetails?.metadataExtracted?.balanceEnd !== undefined
                ? `${t.labels.fromFilePrefix.value}${statement.parsingDetails.metadataExtracted.balanceEnd}`
                : undefined
            }
          />
        </Box>

        {statement?.parsingDetails && (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">{t.labels.parsingDetails}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t.labels.generalInfo}
                    </Typography>
                    <Typography variant="body2">
                      {t.labels.bank}: {statement.parsingDetails.detectedBank || '—'}
                    </Typography>
                    <Typography variant="body2">
                      {t.labels.format}: {statement.parsingDetails.detectedFormat || '—'}
                    </Typography>
                    <Typography variant="body2">
                      {t.labels.parser}: {statement.parsingDetails.parserUsed || '—'}
                    </Typography>
                    <Typography variant="body2">
                      {t.labels.processingTime}:{' '}
                      {statement.parsingDetails.processingTime
                        ? `${statement.parsingDetails.processingTime}ms`
                        : '—'}
                    </Typography>
                  </Box>

                {statement.parsingDetails.metadataExtracted && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t.labels.extractedMetadata}
                    </Typography>
                    <Typography variant="body2">
                      {t.labels.account}: {statement.parsingDetails.metadataExtracted.accountNumber || '—'}
                    </Typography>
                    <Typography variant="body2">
                      {t.labels.period}:{' '}
                      {statement.parsingDetails.metadataExtracted.dateFrom
                        ? new Date(
                            statement.parsingDetails.metadataExtracted.dateFrom,
                          ).toLocaleDateString(resolveLocale(locale))
                        : '—'}{' '}
                      -{' '}
                      {statement.parsingDetails.metadataExtracted.dateTo
                        ? new Date(
                            statement.parsingDetails.metadataExtracted.dateTo,
                          ).toLocaleDateString(resolveLocale(locale))
                        : '—'}
                    </Typography>
                    <Typography variant="body2">
                      {t.labels.balanceStart}:{' '}
                      {statement.parsingDetails.metadataExtracted.balanceStart ?? '—'}
                    </Typography>
                    <Typography variant="body2">
                      {t.labels.balanceEnd}: {statement.parsingDetails.metadataExtracted.balanceEnd ?? '—'}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t.labels.parsingStats}
                  </Typography>
                  <Typography variant="body2">
                    {t.labels.foundTransactions}: {statement.parsingDetails.transactionsFound ?? '—'}
                  </Typography>
                  <Typography variant="body2">
                    {t.labels.createdTransactions}: {statement.parsingDetails.transactionsCreated ?? '—'}
                  </Typography>
                  {statement.parsingDetails.totalLinesProcessed && (
                    <Typography variant="body2">
                      {t.labels.processedLines}: {statement.parsingDetails.totalLinesProcessed}
                    </Typography>
                  )}
                </Box>

                {statement.parsingDetails.errors && statement.parsingDetails.errors.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="error">
                      {t.labels.errors} ({statement.parsingDetails.errors.length})
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
                      {t.labels.warnings} ({statement.parsingDetails.warnings.length})
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
                        {t.labels.processingLogPrefix}
                        {statement.parsingDetails.logEntries.length}
                        {t.labels.processingLogSuffix}
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
                              {new Date(log.timestamp).toLocaleTimeString(resolveLocale(locale))}
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
              <TableCell>{t.labels.actions}</TableCell>
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
        <DialogTitle>
          {t.labels.bulkCategoryTitlePrefix}
          {selectedRows.size}
          {t.labels.bulkCategoryTitleSuffix}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            select
            label={t.labels.category.value}
            fullWidth
            value={bulkCategoryId}
            onChange={(e) => setBulkCategoryId(e.target.value)}
            helperText={t.labels.bulkCategoryHelper.value}
          >
            <MenuItem value="">{t.labels.notSelected}</MenuItem>
            {flattenCategories(categories).map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkCategoryDialogOpen(false)}>{t.labels.cancel}</Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} /> : <CheckCircle />}
            onClick={handleApplyBulkCategory}
            disabled={saving}
          >
            {t.labels.apply}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
