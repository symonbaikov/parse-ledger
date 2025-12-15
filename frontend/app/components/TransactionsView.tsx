'use client';

import React, { useMemo, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  TextField,
  InputAdornment,
  TablePagination,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface Transaction {
  id: string;
  transactionDate: string;
  documentNumber?: string;
  counterpartyName: string;
  counterpartyBin?: string;
  paymentPurpose: string;
  debit: number;
  credit: number;
  amount: number;
  transactionType: string;
  currency?: string;
  exchangeRate?: number;
  article?: string;
  amountForeign?: number;
  category?: { name: string };
  branch?: { name: string };
  wallet?: { name: string };
}

interface TransactionsViewProps {
  transactions: Transaction[];
}

type ColumnDef = {
  key: string;
  label: string;
  render?: (tx: Transaction) => React.ReactNode;
};

/**
 * Component for displaying transactions list with search and pagination
 */
export default function TransactionsView({ transactions }: TransactionsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const formatAmount = (amount: number, currency?: string): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency || 'KZT',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, 'success' | 'error' | 'info'> = {
      INCOME: 'success',
      EXPENSE: 'error',
      TRANSFER: 'info',
    };
    return colors[type] || 'default';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'Приход';
      case 'EXPENSE':
        return 'Расход';
      case 'TRANSFER':
        return 'Перевод';
      default:
        return type;
    }
  };

  const filteredTransactions = transactions.filter(
    tx =>
      tx.counterpartyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.paymentPurpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.documentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.counterpartyBin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.article?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const availableColumns: ColumnDef[] = useMemo(() => {
    const presentKeys = new Set<string>();
    transactions.forEach(tx => {
      Object.keys(tx).forEach(key => {
        if (key === 'id') return;
        presentKeys.add(key);
      });
    });

    const preferredOrder: Array<keyof Transaction> = [
      'transactionDate',
      'documentNumber',
      'counterpartyName',
      'counterpartyBin',
      'paymentPurpose',
      'debit',
      'credit',
      'currency',
      'exchangeRate',
      'transactionType',
      'category',
      'article',
      'amountForeign',
      'branch',
      'wallet',
    ];

    const labelMap: Record<string, string> = {
      transactionDate: 'Дата',
      documentNumber: 'Номер документа',
      counterpartyName: 'Контрагент',
      counterpartyBin: 'БИН',
      paymentPurpose: 'Назначение платежа',
      debit: 'Дебет',
      credit: 'Кредит',
      currency: 'Валюта',
      exchangeRate: 'Курс',
      transactionType: 'Тип',
      category: 'Категория',
      article: 'Статья',
      amountForeign: 'Сумма в валюте',
      branch: 'Филиал',
      wallet: 'Кошелёк',
    };

    const renderers: Record<string, (tx: Transaction) => React.ReactNode> = {
      transactionDate: tx => formatDate(tx.transactionDate),
      debit: tx => (tx.debit > 0 ? formatAmount(tx.debit, tx.currency) : '—'),
      credit: tx => (tx.credit > 0 ? formatAmount(tx.credit, tx.currency) : '—'),
      currency: tx => tx.currency || 'KZT',
      exchangeRate: tx =>
        tx.exchangeRate
          ? tx.exchangeRate.toLocaleString('ru-RU', { minimumFractionDigits: 2 })
          : '—',
      transactionType: tx => (
        <Chip
          label={getTypeLabel(tx.transactionType)}
          size="small"
          color={getTypeColor(tx.transactionType)}
        />
      ),
      category: tx =>
        tx.category?.name ? <Chip label={tx.category.name} size="small" variant="outlined" /> : '—',
      branch: tx => tx.branch?.name || '—',
      wallet: tx => tx.wallet?.name || '—',
      paymentPurpose: tx => tx.paymentPurpose || '—',
      counterpartyName: tx => tx.counterpartyName || '—',
      counterpartyBin: tx => tx.counterpartyBin || '—',
      documentNumber: tx => tx.documentNumber || '—',
      amountForeign: tx =>
        tx.amountForeign
          ? tx.amountForeign.toLocaleString('ru-RU', { minimumFractionDigits: 2 })
          : '—',
    };

    const columns: ColumnDef[] = [];

    preferredOrder.forEach(key => {
      if (presentKeys.has(key)) {
        columns.push({
          key,
          label: labelMap[key] || key,
          render: renderers[key],
        });
        presentKeys.delete(key);
      }
    });

    // Any other keys from backend that we don't know about yet
    Array.from(presentKeys).forEach(key => {
      columns.push({
        key,
        label: labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
        render: (tx: Transaction) => {
          const value = (tx as any)[key];
          if (value === null || value === undefined || value === '') {
            return '—';
          }
          if (typeof value === 'number') {
            return value.toLocaleString('ru-RU');
          }
          if (typeof value === 'object') {
            return value.name || JSON.stringify(value);
          }
          return value.toString();
        },
      });
    });

    return columns;
  }, [transactions]);

  return (
    <Box>
      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Поиск по контрагенту, назначению или категории..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Transactions table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {availableColumns.map(col => (
                <TableCell key={col.key}>{col.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={availableColumns.length || 1} align="center">
                  Транзакции не найдены
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map(tx => (
                <TableRow key={tx.id} hover>
                  {availableColumns.map(col => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(tx) : ((tx as any)[col.key] ?? '—').toString()}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredTransactions.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        />
      </TableContainer>
    </Box>
  );
}
