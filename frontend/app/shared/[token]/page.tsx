'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Alert,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useParams } from 'next/navigation';
import api from '../../lib/api';
import TransactionsView from '../../components/TransactionsView';

interface SharedFileAccess {
  statement: any;
  transactions: any[];
  permission: string;
  canDownload: boolean;
}

const getPermissionLabel = (permission: string) => {
  switch (permission) {
    case 'view':
      return 'Просмотр';
    case 'download':
      return 'Просмотр и скачивание';
    case 'edit':
      return 'Редактирование';
    default:
      return permission;
  }
};

/**
 * Public page for accessing shared files
 */
export default function SharedFilePage() {
  const params = useParams();
  const token = params.token as string;

  const [access, setAccess] = useState<SharedFileAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);

  useEffect(() => {
    loadSharedFile();
  }, [token]);

  const loadSharedFile = async (pwd?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = pwd ? { password: pwd } : {};
      const response = await api.get(`/storage/shared/${token}`, { params });
      
      setAccess(response.data);
      setNeedsPassword(false);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setNeedsPassword(true);
        setError('Требуется пароль для доступа к файлу');
      } else {
        setError(err.response?.data?.error?.message || 'Не удалось загрузить файл');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = () => {
    loadSharedFile(password);
  };

  const handleDownload = async () => {
    if (!access) return;

    try {
      const params = password ? { password } : {};
      const response = await api.get(`/storage/shared/${token}/download`, {
        params,
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', access.statement.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Typography align="center">Загрузка...</Typography>
      </Container>
    );
  }

  if (needsPassword) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <LockIcon sx={{ fontSize: 64, color: 'primary.main' }} />
            <Typography variant="h5" align="center">
              Защищенный файл
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Для доступа к этому файлу требуется пароль
            </Typography>

            {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}

            <TextField
              fullWidth
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handlePasswordSubmit}
              disabled={!password}
            >
              Открыть файл
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (error || !access) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Alert severity="error">{error || 'Файл не найден'}</Alert>
      </Container>
    );
  }

  const { statement, transactions, permission, canDownload } = access;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {statement.fileName}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip label="Общий доступ" size="small" color="info" />
          <Chip label={statement.bankName} size="small" variant="outlined" />
          <Chip label={`Права: ${getPermissionLabel(permission)}`} size="small" />
          {canDownload && (
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ ml: 'auto' }}
            >
              Скачать
            </Button>
          )}
        </Box>
      </Box>

      {/* File info */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Банк
            </Typography>
            <Typography variant="h6">{statement.bankName}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Размер файла
            </Typography>
            <Typography variant="h6">
              {formatFileSize(statement.fileSize)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Транзакций
            </Typography>
            <Typography variant="h6">{transactions.length}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Счет
            </Typography>
            <Typography variant="h6">
              {statement.metadata?.accountNumber || '—'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Transactions */}
      {transactions.length > 0 ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            Транзакции
          </Typography>
          <TransactionsView transactions={transactions} />
        </Box>
      ) : (
        <Alert severity="info">
          У вас нет прав на просмотр транзакций. Обратитесь к владельцу файла для получения доступа.
        </Alert>
      )}
    </Container>
  );
}
