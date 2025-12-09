'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import apiClient from '@/app/lib/api';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const oauthError = searchParams.get('error');

  const [sheetId, setSheetId] = useState('');
  const [worksheetName, setWorksheetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!code && !oauthError) {
      setError('Не удалось получить код авторизации Google.');
    }
    if (oauthError) {
      setError(`Google OAuth ошибка: ${oauthError}`);
    }
  }, [code, oauthError]);

  const handleSubmit = async () => {
    if (!code) return;
    if (!sheetId.trim()) {
      setError('Введите ID таблицы Google Sheet');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/google-sheets/oauth/callback', {
        code,
        sheetId: sheetId.trim(),
        worksheetName: worksheetName.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/upload');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось подключить Google Sheet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Подключение Google Sheets
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Авторизация в Google завершена. Укажите ID таблицы, чтобы сохранить подключение.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Подключение сохранено. Перенаправляем на загрузку…
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="ID таблицы"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            placeholder="Например: 1AbCdEf..."
            required
          />
          <TextField
            label="Лист (опционально)"
            value={worksheetName}
            onChange={(e) => setWorksheetName(e.target.value)}
            placeholder="Лист1"
          />
          <Button variant="contained" onClick={handleSubmit} disabled={loading || !code}>
            {loading ? <CircularProgress size={20} /> : 'Сохранить подключение'}
          </Button>
          <Button variant="text" onClick={() => router.push('/upload')}>
            Вернуться к загрузке
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default function GoogleSheetsCallbackPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="sm" sx={{ mt: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
