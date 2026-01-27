'use client';

import TransactionDocumentViewer from '@/app/components/TransactionDocumentViewer';
import api from '@/app/lib/api';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, IconButton, Stack, Tooltip } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { use, useEffect, useState } from 'react';

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

export default function ViewStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [statement, setStatement] = useState<Statement | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resolvedParams = use(params);
  const statementId = resolvedParams.id;

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
        console.error('Error fetching data:', err);
        setError('Не удалось загрузить данные выписки');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statementId]);

  const searchParams = useSearchParams();
  const shouldAutoPrint = searchParams.get('print') === 'true';

  useEffect(() => {
    if (shouldAutoPrint && !loading && statement && transactions.length > 0) {
      setTimeout(() => {
        window.print();
      }, 1000); // Small delay to ensure rendering
    }
  }, [shouldAutoPrint, loading, statement, transactions]);

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    if (statementId) {
      router.push(`/statements/${statementId}/edit`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
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
          {error || 'Выписка не найдена'}
        </Alert>
        <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Назад
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Action Bar - Hidden on print */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderBottomColor: 'grey.200',
          py: 2,
          '@media print': {
            display: 'none',
          },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '100%',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Назад
          </Button>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Редактировать">
              <IconButton onClick={handleEdit} color="primary">
                <EditIcon />
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
      <TransactionDocumentViewer statement={statement} transactions={transactions} locale="ru" />
    </Box>
  );
}
