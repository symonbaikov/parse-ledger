'use client';

import React, { useState } from 'react';
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
              <TableCell>Дата</TableCell>
              <TableCell>Номер документа</TableCell>
              <TableCell>Контрагент</TableCell>
              <TableCell>БИН</TableCell>
              <TableCell>Назначение платежа</TableCell>
              <TableCell>Дебет</TableCell>
              <TableCell>Кредит</TableCell>
              <TableCell>Валюта</TableCell>
              <TableCell>Курс</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Статья</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center">
                  Транзакции не найдены
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map(tx => (
                <TableRow key={tx.id} hover>
                  <TableCell>{formatDate(tx.transactionDate)}</TableCell>
                  <TableCell>{tx.documentNumber || '—'}</TableCell>
                  <TableCell>{tx.counterpartyName || '—'}</TableCell>
                  <TableCell>{tx.counterpartyBin || '—'}</TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>{tx.paymentPurpose || '—'}</TableCell>
                  <TableCell>
                    {tx.debit > 0 ? formatAmount(tx.debit, tx.currency) : '—'}
                    {tx.amountForeign && tx.debit ? (
                      <Box component="span" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.75rem' }}>
                        {tx.amountForeign.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                      </Box>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {tx.credit > 0 ? formatAmount(tx.credit, tx.currency) : '—'}
                    {tx.amountForeign && tx.credit ? (
                      <Box component="span" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.75rem' }}>
                        {tx.amountForeign.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                      </Box>
                    ) : null}
                  </TableCell>
                  <TableCell>{tx.currency || 'KZT'}</TableCell>
                  <TableCell>
                    {tx.exchangeRate
                      ? tx.exchangeRate.toLocaleString('ru-RU', { minimumFractionDigits: 2 })
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tx.transactionType}
                      size="small"
                      color={getTypeColor(tx.transactionType)}
                    />
                  </TableCell>
                  <TableCell>
                    {tx.category?.name ? (
                      <Chip label={tx.category.name} size="small" variant="outlined" />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{tx.article || '—'}</TableCell>
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


