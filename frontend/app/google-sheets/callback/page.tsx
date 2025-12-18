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

const decodeOauthState = (raw: string): Record<string, any> | null => {
  try {
    const base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '==='.slice((base64.length + 3) % 4);
    const json = decodeURIComponent(escape(atob(padded)));
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const oauthError = searchParams.get('error');
  const oauthState = searchParams.get('state');

  const [sheetId, setSheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [worksheetName, setWorksheetName] = useState('');
  const [redirectTo, setRedirectTo] = useState('/upload');
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

  useEffect(() => {
    if (!oauthState) return;
    const parsed = decodeOauthState(oauthState);
    if (!parsed) return;
    if (!sheetId && typeof parsed.sheetId === 'string') {
      setSheetId(parsed.sheetId);
    }
    if (!sheetName && typeof parsed.sheetName === 'string') {
      setSheetName(parsed.sheetName);
    }
    if (!worksheetName && typeof parsed.worksheetName === 'string') {
      setWorksheetName(parsed.worksheetName);
    }
    if (typeof parsed.from === 'string' && parsed.from.includes('integrations')) {
      setRedirectTo('/integrations/google-sheets');
    }
  }, [oauthState, sheetId, sheetName, worksheetName]);

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
        sheetName: sheetName.trim() || undefined,
        worksheetName: worksheetName.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push(redirectTo);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось подключить Google Sheet');
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
            label="Название подключения (опционально)"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="Например: Финансы 2025"
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
